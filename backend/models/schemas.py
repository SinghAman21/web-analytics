"""
Shared schemas for communication between Backend and Frontend
"""
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class UltrafreeSiteCreate(BaseModel):
    """Schema for creating an ultrafree site"""
    site_name: str = Field(..., description="Display name of the site", examples=["My Portfolio"])
    site_url: str = Field(..., description="Public URL of the site", examples=["https://example.com"])
    hex_share_id: str = Field(
        ...,
        min_length=12,
        max_length=12,
        pattern=r"^[a-zA-Z0-9]{12}$",
        description="12-character alphanumeric public share ID",
        examples=["rfr3mknj2grl"],
    )


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


class EventData(BaseModel):
    """Schema for incoming event data from frontend tracker"""
    site_hex: str = Field(..., min_length=12, max_length=12, pattern=r"^[a-zA-Z0-9]{12}$")
    unique_cookie: str = Field(..., description="Persistent visitor identifier")
    session_id: str = Field(..., description="Per-tab/session identifier")
    page_path: str = Field(..., description="Current page path", examples=["/pricing"])
    device_type: str = Field(..., description="Device category", examples=["desktop", "mobile", "tablet"])
    referrer: Optional[str] = Field(None, description="HTTP referrer source")
    screen_res: Optional[str] = Field(None, description="Screen resolution", examples=["1920x1080"])


class ErrorResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status: str
    service: str


class RootResponse(BaseModel):
    message: str
    version: str
    docs: str


class UltrafreeSiteCreateResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str


class UltrafreeSiteGetResponse(BaseModel):
    success: bool
    data: Dict[str, Any]


class UltrafreeSiteListResponse(BaseModel):
    success: bool
    data: List[Dict[str, Any]]
    count: int
    total: int


class EventLogResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str


class TopPage(BaseModel):
    path: str
    views: int


class ReferrerStat(BaseModel):
    source: str
    count: int


class DailyDataPoint(BaseModel):
    date: str
    views: int


class AnalyticsData(BaseModel):
    site_hex: str
    period_hours: int
    total_pageviews: int
    unique_visitors: int
    bounce_rate: int
    sessions: int
    avg_pages_per_session: float
    top_pages: List[TopPage]
    device_breakdown: Dict[str, int]
    mobile_percentage: int
    desktop_percentage: int
    referrers: List[ReferrerStat]
    daily_data: List[DailyDataPoint]
    generated_at: str


class AnalyticsResponse(BaseModel):
    success: bool
    data: AnalyticsData


class SignedInUser(BaseModel):
    """Normalized signed-in user shape derived from Clerk token claims."""

    clerk_user_id: str = Field(..., description="Clerk user identifier (sub claim)")
    session_id: Optional[str] = Field(None, description="Clerk session id (sid claim)")
    email: Optional[str] = Field(None, description="Primary email, if included in token claims")
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")
    username: Optional[str] = Field(None, description="Clerk username, if present")
    image_url: Optional[str] = Field(None, description="Profile image URL")
    role: Optional[str] = Field(None, description="Organization role, if present")
    claims: Dict[str, Any] = Field(
        default_factory=dict,
        description="Subset of raw Clerk JWT claims for downstream authorization",
    )


class SignedInUserResponse(BaseModel):
    authenticated: bool
    data: SignedInUser