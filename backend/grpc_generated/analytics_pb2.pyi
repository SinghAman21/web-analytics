from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class EventData(_message.Message):
    __slots__ = ("site_hex", "unique_cookie", "session_id", "page_url", "page_path", "page_title", "page_hostname", "device_type", "viewport_res", "screen_res", "referrer", "browser", "browser_version", "os", "os_version", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source_type", "source_name", "first_touch_source_type", "first_touch_source_name", "first_touch_source_url", "first_touch_landing_url", "first_touch_landing_path", "first_touch_at", "first_touch_click_id", "first_touch_utm_source", "first_touch_utm_medium", "first_touch_utm_campaign", "first_touch_utm_content", "first_touch_utm_term", "page_load_time", "dom_interactive_time", "first_paint_time", "first_contentful_paint_time", "interaction_count", "scroll_depth", "is_bounce", "country", "country_code", "region", "city", "latitude", "longitude", "isp", "connection_type", "connection_effective_type", "language", "timezone", "event_type", "event_time", "lamport_ts", "process_id", "received_at")
    SITE_HEX_FIELD_NUMBER: _ClassVar[int]
    UNIQUE_COOKIE_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    PAGE_URL_FIELD_NUMBER: _ClassVar[int]
    PAGE_PATH_FIELD_NUMBER: _ClassVar[int]
    PAGE_TITLE_FIELD_NUMBER: _ClassVar[int]
    PAGE_HOSTNAME_FIELD_NUMBER: _ClassVar[int]
    DEVICE_TYPE_FIELD_NUMBER: _ClassVar[int]
    VIEWPORT_RES_FIELD_NUMBER: _ClassVar[int]
    SCREEN_RES_FIELD_NUMBER: _ClassVar[int]
    REFERRER_FIELD_NUMBER: _ClassVar[int]
    BROWSER_FIELD_NUMBER: _ClassVar[int]
    BROWSER_VERSION_FIELD_NUMBER: _ClassVar[int]
    OS_FIELD_NUMBER: _ClassVar[int]
    OS_VERSION_FIELD_NUMBER: _ClassVar[int]
    UTM_SOURCE_FIELD_NUMBER: _ClassVar[int]
    UTM_MEDIUM_FIELD_NUMBER: _ClassVar[int]
    UTM_CAMPAIGN_FIELD_NUMBER: _ClassVar[int]
    UTM_CONTENT_FIELD_NUMBER: _ClassVar[int]
    UTM_TERM_FIELD_NUMBER: _ClassVar[int]
    REF_FIELD_NUMBER: _ClassVar[int]
    SOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    SOURCE_NAME_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_SOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_SOURCE_NAME_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_SOURCE_URL_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_LANDING_URL_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_LANDING_PATH_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_AT_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_CLICK_ID_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_UTM_SOURCE_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_UTM_MEDIUM_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_UTM_CAMPAIGN_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_UTM_CONTENT_FIELD_NUMBER: _ClassVar[int]
    FIRST_TOUCH_UTM_TERM_FIELD_NUMBER: _ClassVar[int]
    PAGE_LOAD_TIME_FIELD_NUMBER: _ClassVar[int]
    DOM_INTERACTIVE_TIME_FIELD_NUMBER: _ClassVar[int]
    FIRST_PAINT_TIME_FIELD_NUMBER: _ClassVar[int]
    FIRST_CONTENTFUL_PAINT_TIME_FIELD_NUMBER: _ClassVar[int]
    INTERACTION_COUNT_FIELD_NUMBER: _ClassVar[int]
    SCROLL_DEPTH_FIELD_NUMBER: _ClassVar[int]
    IS_BOUNCE_FIELD_NUMBER: _ClassVar[int]
    COUNTRY_FIELD_NUMBER: _ClassVar[int]
    COUNTRY_CODE_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    LATITUDE_FIELD_NUMBER: _ClassVar[int]
    LONGITUDE_FIELD_NUMBER: _ClassVar[int]
    ISP_FIELD_NUMBER: _ClassVar[int]
    CONNECTION_TYPE_FIELD_NUMBER: _ClassVar[int]
    CONNECTION_EFFECTIVE_TYPE_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    TIMEZONE_FIELD_NUMBER: _ClassVar[int]
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    EVENT_TIME_FIELD_NUMBER: _ClassVar[int]
    LAMPORT_TS_FIELD_NUMBER: _ClassVar[int]
    PROCESS_ID_FIELD_NUMBER: _ClassVar[int]
    RECEIVED_AT_FIELD_NUMBER: _ClassVar[int]
    site_hex: str
    unique_cookie: str
    session_id: str
    page_url: str
    page_path: str
    page_title: str
    page_hostname: str
    device_type: str
    viewport_res: str
    screen_res: str
    referrer: str
    browser: str
    browser_version: str
    os: str
    os_version: str
    utm_source: str
    utm_medium: str
    utm_campaign: str
    utm_content: str
    utm_term: str
    ref: str
    source_type: str
    source_name: str
    first_touch_source_type: str
    first_touch_source_name: str
    first_touch_source_url: str
    first_touch_landing_url: str
    first_touch_landing_path: str
    first_touch_at: str
    first_touch_click_id: str
    first_touch_utm_source: str
    first_touch_utm_medium: str
    first_touch_utm_campaign: str
    first_touch_utm_content: str
    first_touch_utm_term: str
    page_load_time: int
    dom_interactive_time: int
    first_paint_time: int
    first_contentful_paint_time: int
    interaction_count: int
    scroll_depth: int
    is_bounce: bool
    country: str
    country_code: str
    region: str
    city: str
    latitude: float
    longitude: float
    isp: str
    connection_type: str
    connection_effective_type: str
    language: str
    timezone: str
    event_type: str
    event_time: str
    lamport_ts: int
    process_id: str
    received_at: str
    def __init__(self, site_hex: _Optional[str] = ..., unique_cookie: _Optional[str] = ..., session_id: _Optional[str] = ..., page_url: _Optional[str] = ..., page_path: _Optional[str] = ..., page_title: _Optional[str] = ..., page_hostname: _Optional[str] = ..., device_type: _Optional[str] = ..., viewport_res: _Optional[str] = ..., screen_res: _Optional[str] = ..., referrer: _Optional[str] = ..., browser: _Optional[str] = ..., browser_version: _Optional[str] = ..., os: _Optional[str] = ..., os_version: _Optional[str] = ..., utm_source: _Optional[str] = ..., utm_medium: _Optional[str] = ..., utm_campaign: _Optional[str] = ..., utm_content: _Optional[str] = ..., utm_term: _Optional[str] = ..., ref: _Optional[str] = ..., source_type: _Optional[str] = ..., source_name: _Optional[str] = ..., first_touch_source_type: _Optional[str] = ..., first_touch_source_name: _Optional[str] = ..., first_touch_source_url: _Optional[str] = ..., first_touch_landing_url: _Optional[str] = ..., first_touch_landing_path: _Optional[str] = ..., first_touch_at: _Optional[str] = ..., first_touch_click_id: _Optional[str] = ..., first_touch_utm_source: _Optional[str] = ..., first_touch_utm_medium: _Optional[str] = ..., first_touch_utm_campaign: _Optional[str] = ..., first_touch_utm_content: _Optional[str] = ..., first_touch_utm_term: _Optional[str] = ..., page_load_time: _Optional[int] = ..., dom_interactive_time: _Optional[int] = ..., first_paint_time: _Optional[int] = ..., first_contentful_paint_time: _Optional[int] = ..., interaction_count: _Optional[int] = ..., scroll_depth: _Optional[int] = ..., is_bounce: _Optional[bool] = ..., country: _Optional[str] = ..., country_code: _Optional[str] = ..., region: _Optional[str] = ..., city: _Optional[str] = ..., latitude: _Optional[float] = ..., longitude: _Optional[float] = ..., isp: _Optional[str] = ..., connection_type: _Optional[str] = ..., connection_effective_type: _Optional[str] = ..., language: _Optional[str] = ..., timezone: _Optional[str] = ..., event_type: _Optional[str] = ..., event_time: _Optional[str] = ..., lamport_ts: _Optional[int] = ..., process_id: _Optional[str] = ..., received_at: _Optional[str] = ...) -> None: ...

class LogEventRequest(_message.Message):
    __slots__ = ("event", "client_ip")
    EVENT_FIELD_NUMBER: _ClassVar[int]
    CLIENT_IP_FIELD_NUMBER: _ClassVar[int]
    event: EventData
    client_ip: str
    def __init__(self, event: _Optional[_Union[EventData, _Mapping]] = ..., client_ip: _Optional[str] = ...) -> None: ...

class LogEventResponse(_message.Message):
    __slots__ = ("success", "message", "site_hex", "event_id", "lamport_ts")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    SITE_HEX_FIELD_NUMBER: _ClassVar[int]
    EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    LAMPORT_TS_FIELD_NUMBER: _ClassVar[int]
    success: bool
    message: str
    site_hex: str
    event_id: int
    lamport_ts: int
    def __init__(self, success: _Optional[bool] = ..., message: _Optional[str] = ..., site_hex: _Optional[str] = ..., event_id: _Optional[int] = ..., lamport_ts: _Optional[int] = ...) -> None: ...

class Site(_message.Message):
    __slots__ = ("id", "hex_share_id", "name", "site_url", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    HEX_SHARE_ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    SITE_URL_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: int
    hex_share_id: str
    name: str
    site_url: str
    created_at: str
    def __init__(self, id: _Optional[int] = ..., hex_share_id: _Optional[str] = ..., name: _Optional[str] = ..., site_url: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class GetSiteRequest(_message.Message):
    __slots__ = ("hex_share_id",)
    HEX_SHARE_ID_FIELD_NUMBER: _ClassVar[int]
    hex_share_id: str
    def __init__(self, hex_share_id: _Optional[str] = ...) -> None: ...

class CreateSiteRequest(_message.Message):
    __slots__ = ("site_name", "site_url", "hex_share_id")
    SITE_NAME_FIELD_NUMBER: _ClassVar[int]
    SITE_URL_FIELD_NUMBER: _ClassVar[int]
    HEX_SHARE_ID_FIELD_NUMBER: _ClassVar[int]
    site_name: str
    site_url: str
    hex_share_id: str
    def __init__(self, site_name: _Optional[str] = ..., site_url: _Optional[str] = ..., hex_share_id: _Optional[str] = ...) -> None: ...

class ListSitesRequest(_message.Message):
    __slots__ = ("limit", "offset")
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    limit: int
    offset: int
    def __init__(self, limit: _Optional[int] = ..., offset: _Optional[int] = ...) -> None: ...

class ListSitesResponse(_message.Message):
    __slots__ = ("sites", "count", "total")
    SITES_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    sites: _containers.RepeatedCompositeFieldContainer[Site]
    count: int
    total: int
    def __init__(self, sites: _Optional[_Iterable[_Union[Site, _Mapping]]] = ..., count: _Optional[int] = ..., total: _Optional[int] = ...) -> None: ...

class TopPage(_message.Message):
    __slots__ = ("path", "views")
    PATH_FIELD_NUMBER: _ClassVar[int]
    VIEWS_FIELD_NUMBER: _ClassVar[int]
    path: str
    views: int
    def __init__(self, path: _Optional[str] = ..., views: _Optional[int] = ...) -> None: ...

class DailyDataPoint(_message.Message):
    __slots__ = ("date", "views")
    DATE_FIELD_NUMBER: _ClassVar[int]
    VIEWS_FIELD_NUMBER: _ClassVar[int]
    date: str
    views: int
    def __init__(self, date: _Optional[str] = ..., views: _Optional[int] = ...) -> None: ...

class Analytics(_message.Message):
    __slots__ = ("site_hex", "period_hours", "total_pageviews", "unique_visitors", "bounce_rate", "sessions", "avg_pages_per_session", "top_pages", "device_breakdown", "mobile_percentage", "desktop_percentage", "daily_data", "generated_at")
    class DeviceBreakdownEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: int
        def __init__(self, key: _Optional[str] = ..., value: _Optional[int] = ...) -> None: ...
    SITE_HEX_FIELD_NUMBER: _ClassVar[int]
    PERIOD_HOURS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_PAGEVIEWS_FIELD_NUMBER: _ClassVar[int]
    UNIQUE_VISITORS_FIELD_NUMBER: _ClassVar[int]
    BOUNCE_RATE_FIELD_NUMBER: _ClassVar[int]
    SESSIONS_FIELD_NUMBER: _ClassVar[int]
    AVG_PAGES_PER_SESSION_FIELD_NUMBER: _ClassVar[int]
    TOP_PAGES_FIELD_NUMBER: _ClassVar[int]
    DEVICE_BREAKDOWN_FIELD_NUMBER: _ClassVar[int]
    MOBILE_PERCENTAGE_FIELD_NUMBER: _ClassVar[int]
    DESKTOP_PERCENTAGE_FIELD_NUMBER: _ClassVar[int]
    DAILY_DATA_FIELD_NUMBER: _ClassVar[int]
    GENERATED_AT_FIELD_NUMBER: _ClassVar[int]
    site_hex: str
    period_hours: int
    total_pageviews: int
    unique_visitors: int
    bounce_rate: int
    sessions: int
    avg_pages_per_session: float
    top_pages: _containers.RepeatedCompositeFieldContainer[TopPage]
    device_breakdown: _containers.ScalarMap[str, int]
    mobile_percentage: int
    desktop_percentage: int
    daily_data: _containers.RepeatedCompositeFieldContainer[DailyDataPoint]
    generated_at: str
    def __init__(self, site_hex: _Optional[str] = ..., period_hours: _Optional[int] = ..., total_pageviews: _Optional[int] = ..., unique_visitors: _Optional[int] = ..., bounce_rate: _Optional[int] = ..., sessions: _Optional[int] = ..., avg_pages_per_session: _Optional[float] = ..., top_pages: _Optional[_Iterable[_Union[TopPage, _Mapping]]] = ..., device_breakdown: _Optional[_Mapping[str, int]] = ..., mobile_percentage: _Optional[int] = ..., desktop_percentage: _Optional[int] = ..., daily_data: _Optional[_Iterable[_Union[DailyDataPoint, _Mapping]]] = ..., generated_at: _Optional[str] = ...) -> None: ...

class GetAnalyticsRequest(_message.Message):
    __slots__ = ("hex_share_id", "hours")
    HEX_SHARE_ID_FIELD_NUMBER: _ClassVar[int]
    HOURS_FIELD_NUMBER: _ClassVar[int]
    hex_share_id: str
    hours: int
    def __init__(self, hex_share_id: _Optional[str] = ..., hours: _Optional[int] = ...) -> None: ...

class HealthCheckRequest(_message.Message):
    __slots__ = ("service",)
    SERVICE_FIELD_NUMBER: _ClassVar[int]
    service: str
    def __init__(self, service: _Optional[str] = ...) -> None: ...

class HealthCheckResponse(_message.Message):
    __slots__ = ("status", "service")
    STATUS_FIELD_NUMBER: _ClassVar[int]
    SERVICE_FIELD_NUMBER: _ClassVar[int]
    status: str
    service: str
    def __init__(self, status: _Optional[str] = ..., service: _Optional[str] = ...) -> None: ...
