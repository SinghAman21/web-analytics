from fastapi import APIRouter, HTTPException
from core.database import supabase
from collections import Counter, defaultdict

router = APIRouter()

# Dashboard endpoints
@router.get("/stats/{hex_key}")
async def get_dashboard_stats(hex_key: str):
    """Get dashboard statistics"""
    try:
        # Get all pageviews for the site
        pageviews = supabase.table("pageviews").select("*").eq("hex_key", hex_key).execute()
        data = pageviews.data if pageviews.data else []
        
        # Calculate stats
        total_pageviews = len(data)
        unique_sessions = len(set(pv["session_id"] for pv in data)) if data else 0
        bounce_count = sum(1 for pv in data if pv["is_bounce"])
        bounce_rate = (bounce_count / total_pageviews * 100) if total_pageviews > 0 else 0
        
        # Top pages
        paths = [pv["path"] for pv in data]
        top_pages = Counter(paths).most_common(5) if paths else []
        
        return {
            "hex_key": hex_key,
            "total_pageviews": total_pageviews,
            "unique_sessions": unique_sessions,
            "bounce_rate": round(bounce_rate, 2),
            "top_pages": [{"path": path, "count": count} for path, count in top_pages]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/funnels/{hex_key}")
async def get_funnels(hex_key: str):
    """Get funnel analytics"""
    try:
        # Get all pageviews for the site
        pageviews = supabase.table("pageviews").select("*").eq("hex_key", hex_key).order("created_at", desc=False).execute()
        data = pageviews.data if pageviews.data else []
        
        # Group by session and build funnel
        sessions = defaultdict(list)
        for pv in data:
            sessions[pv["session_id"]].append(pv["path"])
        
        return {
            "hex_key": hex_key,
            "total_sessions": len(sessions),
            "funnel_paths": list(sessions.values())[:10]  # Return first 10 sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
