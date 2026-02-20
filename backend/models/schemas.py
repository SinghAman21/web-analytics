"""
Shared schemas for communication between Backend and Frontend
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UltrafreeSiteCreate(BaseModel):
    """Schema for creating an ultrafree site"""
    site_name: str
    site_url: str
    hex_share_id: str


class UltrafreeSiteResponse(BaseModel):
    """Schema for ultrafree site response"""
    id: Optional[int] = None
    hex_share_id: str
    name: str
    site_url: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UltrafreeSiteList(BaseModel):
    """Schema for list of ultrafree sites"""
    success: bool
    data: list[UltrafreeSiteResponse]
    count: int
