"""
Shared schemas for communication between Backend and Frontend
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UnsignedSiteCreate(BaseModel):
    """Schema for creating an unsigned site"""
    site_name: str
    site_url: str
    hex_share_id: str


class UnsignedSiteResponse(BaseModel):
    """Schema for unsigned site response"""
    id: Optional[int] = None
    hex_share_id: str
    name: str
    site_url: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UnsignedSiteList(BaseModel):
    """Schema for list of unsigned sites"""
    success: bool
    data: list[UnsignedSiteResponse]
    count: int
