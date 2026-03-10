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
from services.ultrafree import create_ultrafree, list_ultrafree, log_ultrafreeevent

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
        from services.ultrafree import get_ultrafree

        site = get_ultrafree(hex_id)
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
        return {"success": True, "data": site}
    except HTTPException:
        raise
    except Exception as e:
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
    summary="Ingest analytics event",
    description="Store one frontend tracking event for a public site.",
    responses={500: {"model": ErrorResponse, "description": "Server error"}},
)
async def log_event_endpoint(event: EventData, request: Request):
    try:
        client_ip = request.client.host if request.client else "unknown"
        event_dict = event.model_dump()
        result = log_ultrafreeevent(event_dict, client_ip)
        return {
            "success": True,
            "data": result,
            "message": "Event logged successfully",
        }
    except Exception as e:
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
        analytics = process_analytics(site_hex=hex_id, hours=720)
        logger.info("Analytics processed successfully")
        return {"success": True, "data": analytics}
    except Exception as e:
        logger.error(f"Error processing analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
