"""
Analytics routes for authenticated free-tier sites.
Requires user authentication via session cookie.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request, status
from core.auth import get_current_user
from models.schemas import (
    AnalyticsResponse,
    ErrorResponse,
    EventData,
    EventLogResponse,
    FreeSiteCreateRequest,
    FreeSiteCreateResponse,
    FreeSiteListResponse,
    SignedInUser,
)
from processing.free import process_analytics, get_realtime_stats
from services.free import get_free_site_by_hex, log_free_event, list_free_sites, create_free_site

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/free", tags=["Free Analytics"])


@router.post(
    "/ping",
    response_model=EventLogResponse,
    summary="Ingest analytics event (Free - Direct)",
    description="Internal endpoint: Store analytics event for free-tier site. Use /api/ping for unified routing.",
    responses={403: {"model": ErrorResponse, "description": "Site not owned by user"}, 500: {"model": ErrorResponse, "description": "Server error"}},
)
async def log_free_event_endpoint(event: EventData, request: Request):
    """
    Log an analytics event directly for a free-tier site.
    This is for direct calls; the unified /api/ping endpoint is preferred.
    """
    try:
        site = get_free_site_by_hex(event.site_hex)
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Free site not found")

        client_ip = request.client.host if request.client else "unknown"
        event_dict = event.model_dump()
        result = log_free_event(event_dict, client_ip)
        return {
            "success": True,
            "data": result,
            "message": "Event logged successfully",
        }
    except Exception as e:
        logger.error(f"Error logging event: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/analytics/{hex_id}",
    response_model=AnalyticsResponse,
    summary="Get analytics snapshot (Free)",
    description="Return processed analytics for the last 30 days for an authenticated free-tier site.",
    responses={
        403: {"model": ErrorResponse, "description": "Unauthorized - site not owned by user"},
        404: {"model": ErrorResponse, "description": "Site not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_analytics_endpoint(
    hex_id: str = Path(..., min_length=12, max_length=12, pattern=r"^[a-z0-9]{12}$"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: SignedInUser = Depends(get_current_user),
):
    """
    Get analytics for a free-tier site owned by the authenticated user.
    
    Verifies that the user owns the site before returning analytics data.
    Accepts an optional 'days' query parameter (1-365, default 30).
    """
    try:
        logger.info(f"Analytics request for hex_id={hex_id}, user_id={current_user.id}, days={days}")
        
        # Verify user ownership of the site
        sites = list_free_sites(user_id=current_user.id, limit=1000)
        site_hexes = {site["hex_share_id"] for site in sites.get("data", [])}
        
        if hex_id not in site_hexes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this site's analytics",
            )
        
        # Process analytics
        analytics = process_analytics(site_hex=hex_id, days=days)
        logger.info(f"Analytics processed successfully for {hex_id}")
        
        return {"success": True, "data": analytics}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/realtime/{hex_id}",
    summary="Get real-time stats (Free)",
    description="Return live visitor count and top pages for an authenticated free-tier site.",
    responses={
        403: {"model": ErrorResponse, "description": "Unauthorized - site not owned by user"},
        404: {"model": ErrorResponse, "description": "Site not found"},
        500: {"model": ErrorResponse, "description": "Server error"},
    },
)
async def get_realtime_endpoint(
    hex_id: str = Path(..., min_length=12, max_length=12, pattern=r"^[a-z0-9]{12}$"),
    current_user: SignedInUser = Depends(get_current_user),
):
    """
    Get real-time statistics for a free-tier site (last 24 hours).
    
    Returns live visitor count (last 30 minutes), total views in 24h, and top pages.
    Verifies that the user owns the site before returning data.
    """
    try:
        logger.info(f"Real-time stats request for hex_id={hex_id}, user_id={current_user.id}")
        
        # Verify user ownership of the site
        sites = list_free_sites(user_id=current_user.id, limit=1000)
        site_hexes = {site["hex_share_id"] for site in sites.get("data", [])}
        
        if hex_id not in site_hexes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this site's real-time stats",
            )
        
        # Get real-time stats
        stats = get_realtime_stats(site_hex=hex_id)
        logger.info(f"Real-time stats computed for {hex_id}")
        
        return {"success": True, "data": stats}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting real-time stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/free-sites",
    response_model=FreeSiteListResponse,
    summary="List authenticated user's free sites",
    description="Return all free sites owned by the currently authenticated user.",
    responses={401: {"model": ErrorResponse, "description": "Not authenticated"}},
)
async def list_free_sites_endpoint(
    limit: int = Query(50, ge=1, le=100, description="Number of sites per page"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    current_user: SignedInUser = Depends(get_current_user),
):
    """
    Get all free sites owned by the authenticated user.
    Returns site name, hex_share_id, site_url, and metadata for dashboard display.
    """
    try:
        result = list_free_sites(user_id=current_user.id, limit=limit, offset=offset)
        return {
            "success": True,
            "data": result["data"],
            "count": result["count"],
            "total": result["total"],
        }
    except Exception as e:
        logger.error(f"Error listing free sites: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/free-sites",
    response_model=FreeSiteCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create free site for authenticated user",
    description="Create a new site owned by the currently authenticated user.",
    responses={401: {"model": ErrorResponse, "description": "Not authenticated"}},
)
async def create_free_site_endpoint(
    request: FreeSiteCreateRequest,
    current_user: SignedInUser = Depends(get_current_user),
):
    """
    Create a new free site owned by the authenticated user.
    Automatically generates a unique 12-character hex_share_id.
    """
    try:
        site = create_free_site(
            user_id=current_user.id,
            site_name=request.site_name,
            site_url=request.site_url,
        )
        return {
            "success": True,
            "data": site,
            "message": "Site created successfully",
        }
    except ValueError as e:
        logger.error(f"Validation error creating site: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating free site: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
