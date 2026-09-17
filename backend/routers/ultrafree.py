import logging

from fastapi import APIRouter, HTTPException, Path, Query, Request, status
from models.schemas import (
    AnalyticsResponse,
    ErrorResponse,
    EventData,
    EventLogResponse,
    UltrafreeSiteCreate,
    UltrafreeSiteCreateResponse,
    UltrafreeSiteGetResponse,
    UltrafreeSiteListResponse,
)
from processing.ultrafree import process_analytics
from services.ultrafree import create_ultrafree, get_ultrafree, list_ultrafree, log_ultrafreeevent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Ultrafree"])


@router.post(
    "/api/ultrafree",
    response_model=UltrafreeSiteCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a public site",
    description="Create a new public site and reserve its 12-character share ID.",
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def create_ultrafree_site_endpoint(request: UltrafreeSiteCreate):
    try:
        site = create_ultrafree(
            site_name=request.site_name,
            site_url=request.site_url,
            hex_share_id=request.hex_share_id,
        )
        return {
            "success": True,
            "data": site,
            "message": "Site created successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/api/ultrafree/{hex_id}",
    response_model=UltrafreeSiteGetResponse,
    summary="Get a public site",
    description="Fetch a single public site by its share ID.",
    responses={
        404: {"model": ErrorResponse, "description": "Site not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_ultrafree_site_endpoint(
    hex_id: str = Path(..., min_length=12, max_length=12, pattern=r"^[a-zA-Z0-9]{12}$")
):
    try:
        try:
            from core.cache import cached_fetch, FRESH_KEY_PREFIX, STALE_KEY_PREFIX, CACHE_TTL_SECONDS

            def _fetch():
                s = get_ultrafree(hex_id)
                if not s:
                    raise HTTPException(status_code=404, detail="Site not found")
                return s

            site, source = cached_fetch(f"{FRESH_KEY_PREFIX}{hex_id}", f"{STALE_KEY_PREFIX}{hex_id}", _fetch, ttl=CACHE_TTL_SECONDS)
            logger.info("[Gateway] GetSite %s source=%s", hex_id, source)
            return {"success": True, "data": site}
        except ImportError:
            from services.ultrafree import get_ultrafree as _get

            site = _get(hex_id)
            if not site:
                raise HTTPException(status_code=404, detail="Site not found")
            return {"success": True, "data": site}
    except HTTPException:
        raise
    except Exception as e:
        if "Site not found" in str(e):
            raise HTTPException(status_code=404, detail="Site not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/api/ultrafree",
    response_model=UltrafreeSiteListResponse,
    summary="List public sites",
    description="Return paginated public sites sorted by newest first.",
    responses={500: {"model": ErrorResponse, "description": "Server error"}},
)
async def list_ultrafree_sites_endpoint(
    limit: int = Query(20, ge=1, le=100, description="Number of sites per page"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
):
    try:
        result = list_ultrafree(limit=limit, offset=offset)
        return {
            "success": True,
            "data": result["data"],
            "count": len(result["data"]),
            "total": result["total"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/api/ping",
    response_model=EventLogResponse,
    summary="Ingest analytics event (unified)",
    description="Store one frontend tracking event for either free or ultrafree site. Routes internally based on site ownership.",
    responses={404: {"model": ErrorResponse, "description": "Site not found"}, 500: {"model": ErrorResponse, "description": "Server error"}},
)
async def log_event_unified_endpoint(event: EventData, request: Request):
    """
    Unified ping endpoint for both free and ultrafree sites.
    Determines site tier automatically and routes to appropriate handler.
    """
    try:
        from services.ultrafree import get_site_tier
        from services.free import log_free_event
        
        client_ip = request.client.host if request.client else "unknown"
        event_dict = event.model_dump()
        logger.debug(f"Unified ping received from IP={client_ip} payload={event_dict}")

        # Basic payload validation
        if not event_dict or not event_dict.get("site_hex"):
            raise HTTPException(status_code=400, detail="Missing required field: site_hex")

        # Determine site tier
        try:
            tier = get_site_tier(event_dict.get("site_hex"))
        except Exception as e:
            logger.error(f"Error resolving site tier: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error resolving site tier")
        
        if tier == "free":
            # Route to free tier logger
            try:
                result = log_free_event(event_dict, client_ip)
            except Exception as e:
                logger.error(f"Error logging free event: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail="Failed to log free event")
        elif tier == "ultrafree":
            # Route to ultrafree tier logger
            try:
                result = log_ultrafreeevent(event_dict, client_ip)
            except Exception as e:
                logger.error(f"Error logging ultrafree event: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail="Failed to log ultrafree event")
        else:
            raise HTTPException(status_code=404, detail="Site not found in either free or ultrafree")
        
        return {
            "success": True,
            "data": result,
            "message": "Event logged successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in unified ping endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/api/analytics/{hex_id}",
    response_model=AnalyticsResponse,
    summary="Get analytics snapshot",
    description="Return processed analytics for the last 30 days for a public site.",
    responses={500: {"model": ErrorResponse, "description": "Server error"}},
)
async def get_analytics_endpoint(
    hex_id: str = Path(..., min_length=12, max_length=12, pattern=r"^[a-zA-Z0-9]{12}$")
):
    try:
        logger.info(f"Analytics request for hex_id={hex_id}")
        try:
            from core.cache import get_redis
            import json

            fresh = f"fresh:analytics:{hex_id}:720"
            stale = f"stale:analytics:{hex_id}:720"
            r = None
            try:
                r = get_redis()
                cached = r.get(fresh)
                if cached:
                    logger.info("[Gateway] CACHE HIT analytics %s", hex_id)
                    return {"success": True, "data": json.loads(cached)}
                logger.info("[Gateway] CACHE MISS analytics %s", hex_id)
            except Exception as ce:
                logger.warning("[Gateway] REDIS UNAVAILABLE %s", ce)
                r = None
            analytics = process_analytics(site_hex=hex_id, hours=720)
            if r is not None:
                try:
                    import os

                    ttl = int(os.getenv("CACHE_TTL_SECONDS", "10"))
                    r.set(fresh, json.dumps(analytics), ex=ttl)
                    r.set(stale, json.dumps(analytics))
                except Exception:
                    logger.warning("[Gateway] Redis write failed")
            logger.info("Analytics processed successfully")
            return {"success": True, "data": analytics}
        except ImportError:
            analytics = process_analytics(site_hex=hex_id, hours=720)
            logger.info("Analytics processed successfully")
            return {"success": True, "data": analytics}
    except Exception as e:
        try:
            from core.cache import get_redis
            import json

            stale = f"stale:analytics:{hex_id}:720"
            try:
                r = get_redis()
                stale_data = r.get(stale)
                if stale_data:
                    logger.warning("[Gateway] BACKEND UNAVAILABLE serving STALE %s", hex_id)
                    return {"success": True, "data": json.loads(stale_data)}
            except Exception:
                pass
        except Exception:
            pass
        logger.error(f"Error processing analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
