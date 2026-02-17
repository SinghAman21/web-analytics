from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import supabase
from models.unsigned_users import PageviewCreate

router = APIRouter(tags=["public"])

class TrackEventRequest(BaseModel):
    hex_key: str
    path: str
    session_id: str
    is_bounce: bool = False
    ip_hash: str
    ua_hash: str

# Public tracking endpoint
@router.post("/track")
async def track_event(request: TrackEventRequest):
    """Track public page views and events"""
    try:
        # Insert pageview directly using hex_key
        pageview_data = {
            "hex_key": request.hex_key,
            "path": request.path,
            "session_id": request.session_id,
            "is_bounce": request.is_bounce,
            "ip_hash": request.ip_hash,
            "ua_hash": request.ua_hash,
        }
        
        response = supabase.table("pageviews").insert(pageview_data).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sites/{hex_key}")
async def get_public_site(hex_key: str):
    """Get public site information"""
    try:
        response = supabase.table("sites").select("*").eq("hex_key", hex_key).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Site not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
