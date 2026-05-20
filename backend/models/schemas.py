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
    page_url: Optional[str] = Field(None, description="Full current page URL", examples=["https://example.com/pricing"])
    page_path: str = Field(..., description="Current page path", examples=["/pricing"])
    page_title: Optional[str] = Field(None, description="Document title")
    page_hostname: Optional[str] = Field(None, description="Hostname of the current page")
    device_type: str = Field(..., description="Device category", examples=["desktop", "mobile", "tablet"])
    viewport_res: Optional[str] = Field(None, description="Viewport resolution", examples=["981x933"])
    screen_res: Optional[str] = Field(None, description="Screen resolution", examples=["1920x1080"])
    referrer: Optional[str] = Field(None, description="Document referrer or tracking source")
    browser: Optional[str] = Field(None, description="Browser name")
    browser_version: Optional[str] = Field(None, description="Browser version")
    os: Optional[str] = Field(None, description="Operating system name")
    os_version: Optional[str] = Field(None, description="Operating system version")
    utm_source: Optional[str] = Field(None, description="UTM source")
    utm_medium: Optional[str] = Field(None, description="UTM medium")
    utm_campaign: Optional[str] = Field(None, description="UTM campaign")
    utm_content: Optional[str] = Field(None, description="UTM content")
    utm_term: Optional[str] = Field(None, description="UTM term")
    ref: Optional[str] = Field(None, description="Ref parameter (alternative tracking)")
    source_type: Optional[str] = Field(None, description="Source type (utm, ref, referrer, direct)")
    source_name: Optional[str] = Field(None, description="Source name (peerlist, twitter, google, etc.)")
    page_load_time: Optional[int] = Field(None, description="Page load time in milliseconds")
    dom_interactive_time: Optional[int] = Field(None, description="DOM interactive time in milliseconds")
    first_paint_time: Optional[int] = Field(None, description="First paint time in milliseconds")
    first_contentful_paint_time: Optional[int] = Field(None, description="First contentful paint time in milliseconds")
    interaction_count: int = Field(0, description="Number of user interactions")
    scroll_depth: Optional[int] = Field(None, ge=0, le=100, description="Scroll depth percentage")
    is_bounce: bool = Field(False, description="Whether the session is a bounce")
    country: Optional[str] = Field(None, description="Country name")
    country_code: Optional[str] = Field(None, description="Country code")
    region: Optional[str] = Field(None, description="Region or state")
    city: Optional[str] = Field(None, description="City")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    isp: Optional[str] = Field(None, description="Internet service provider")
    connection_type: Optional[str] = Field(None, description="Connection type")
    connection_effective_type: Optional[str] = Field(None, description="Effective connection type")
    language: Optional[str] = Field(None, description="Browser language")
    timezone: Optional[str] = Field(None, description="Client timezone")
    event_type: str = Field("page_view", description="Analytics event type")
    event_time: Optional[str] = Field(None, description="Event timestamp in ISO format")

    class Config:
        extra = "allow"


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


class FreeSiteCreateRequest(BaseModel):
    """Schema for creating a free-site owned by an authenticated free user."""

    site_name: str = Field(..., min_length=1, max_length=120, description="Display name of the site")
    site_url: str = Field(..., min_length=1, max_length=255, description="Public URL of the site")


class FreeSiteResponse(BaseModel):
    """Schema for authenticated free-site records."""

    id: int
    user_id: int
    site_name: str
    site_url: str
    hex_share_id: str
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class FreeSiteCreateResponse(BaseModel):
    success: bool
    data: FreeSiteResponse
    message: str


class FreeSiteListResponse(BaseModel):
    success: bool
    data: List[FreeSiteResponse]
    count: int
    total: int


class EventLogResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str


class TopPage(BaseModel):
    path: str
    views: int


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
    referrers: List[Dict[str, Any]]
    browsers: List[Dict[str, Any]]
    operating_systems: List[Dict[str, Any]]
    country_breakdown: List[Dict[str, Any]]
    live_users: int
    live_sessions: List[Dict[str, Any]]
    daily_data: List[DailyDataPoint]
    generated_at: str


class AnalyticsResponse(BaseModel):
    success: bool
    data: AnalyticsData


class SignedInUser(BaseModel):
    """Authenticated user from session token."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")
    username: Optional[str] = Field(None, description="Username")
    image_url: Optional[str] = Field(None, description="Profile image URL")
    created_at: Optional[str] = Field(None, description="Account creation timestamp")


class SignedInUserResponse(BaseModel):
    authenticated: bool
    data: SignedInUser


class LoginRequest(BaseModel):
    """Login request with email and password."""
    
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")


class LoginResponse(BaseModel):
    """Login response with session token."""
    
    authenticated: bool
    session_token: str = Field(..., description="Session token for authenticated requests")
    user: SignedInUser


class RegisterRequest(BaseModel):
    """Register request for new user."""
    
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")


class RegisterResponse(BaseModel):
    """Register response with session token."""
    
    authenticated: bool
    session_token: str = Field(..., description="Session token for authenticated requests")
    user: SignedInUser


class LogoutRequest(BaseModel):
    """Logout request."""
    
    session_token: str = Field(..., description="Session token to invalidate")


class GoogleAuthRequest(BaseModel):
    """Google OAuth authorization-code exchange request."""

    code: str = Field(..., description="Authorization code returned by Google sign-in")


class GoogleAuthResponse(BaseModel):
    """Google OAuth login response."""

    authenticated: bool
    user: SignedInUser