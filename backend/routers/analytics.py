from fastapi import APIRouter, HTTPException
from core.database import supabase

router = APIRouter()

# Analytics endpoints
@router.get("/overview/{hex_key}")
async def get_overview(hex_key: str):
    """Get analytics overview for a site"""
    try:
        # Get pageview count
        pageviews = supabase.table("pageviews").select("id", count="exact").eq("hex_key", hex_key).execute()
        pageview_count = len(pageviews.data) if pageviews.data else 0
        
        # Get unique sessions
        sessions = supabase.table("pageviews").select("session_id").eq("hex_key", hex_key).execute()
        unique_sessions = len(set(s["session_id"] for s in sessions.data)) if sessions.data else 0
        
        # Get bounce rate
        bounces = supabase.table("pageviews").select("id", count="exact").eq("hex_key", hex_key).eq("is_bounce", True).execute()
        bounce_count = len(bounces.data) if bounces.data else 0
        bounce_rate = (bounce_count / pageview_count * 100) if pageview_count > 0 else 0
        
        return {
            "hex_key": hex_key,
            "pageviews": pageview_count,
            "unique_sessions": unique_sessions,
            "bounce_rate": round(bounce_rate, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pageviews/{hex_key}")
async def get_pageviews(hex_key: str, limit: int = 100):
    """Get pageview analytics"""
    try:
        response = supabase.table("pageviews").select("*").eq("hex_key", hex_key).order("created_at", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
