from core.config import supabase
from core.lamport import get_clock
from typing import Optional
import secrets
import string
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def _normalize_site_url(site_url: str) -> str:
    """Ensure URL is stored with scheme for consistent uniqueness checks."""
    value = site_url.strip()
    if not value.startswith("http://") and not value.startswith("https://"):
        return f"https://{value}"
    return value


def _generate_share_id(length: int = 12) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _generate_unique_share_id() -> str:
    """Generate a unique 12-char share ID across free_sites."""
    for _ in range(10):
        candidate = _generate_share_id(12)
        users_match = supabase.table("free_sites").select("id").eq("hex_share_id", candidate).limit(1).execute()
        if not users_match.data:
            return candidate
    raise Exception("Unable to generate unique share ID. Please retry.")

def create_free_site(
    user_id: int,
    site_name: str,
    site_url: str,
) -> dict:
    """Create an authenticated free-site record for a specific user."""
    if not site_name or not site_name.strip():
        raise ValueError("Site name cannot be empty")
    if not site_url or not site_url.strip():
        raise ValueError("Site URL cannot be empty")

    normalized_url = _normalize_site_url(site_url)
    share_id = _generate_unique_share_id()

    try:
        existing = (
            supabase.table("free_sites")
            .select("id")
            .eq("user_id", user_id)
            .eq("site_url", normalized_url)
            .limit(1)
            .execute()
        )
        if existing.data:
            raise ValueError("You already created a dashboard for this site URL")

        users_site = (
            supabase.table("free_sites")
            .insert(
                {
                    "user_id": user_id,
                    "site_name": site_name.strip(),
                    "site_url": normalized_url,
                    "hex_share_id": share_id,
                    "is_active": True,
                }
            )
            .execute()
        )

        if not users_site.data:
            raise Exception("Failed to create user-owned site")

        return users_site.data[0]
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error creating user site: {str(e)}", exc_info=True)
        raise Exception(f"Error creating user site: {str(e)}")


def list_free_sites(user_id: int, limit: int = 100, offset: int = 0) -> dict:
    """Return sites for a specific authenticated user only."""
    try:
        count_response = (
            supabase.table("free_sites")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .execute()
        )
        total_count = count_response.count or 0

        response = (
            supabase.table("free_sites")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return {
            "data": response.data if response.data else [],
            "count": len(response.data) if response.data else 0,
            "total": total_count,
        }
    except Exception as e:
        logger.error(f"Error listing user sites: {str(e)}", exc_info=True)
        raise Exception(f"Error listing user sites: {str(e)}")


def get_free_site_by_hex(hex_share_id: str) -> Optional[dict]:
    """Return the authenticated free-site record for a share hex, if it exists."""
    try:
        response = (
            supabase.table("free_sites")
            .select("*")
            .eq("hex_share_id", hex_share_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Error fetching free site by hex: {str(e)}", exc_info=True)
        raise Exception(f"Error fetching free site by hex: {str(e)}")


    # Backward-compatible aliases while routes/services are being renamed.
    create_user_site = create_free_site
    list_user_sites = list_free_sites


def log_free_event(event_data: dict, ip_address: Optional[str] = None) -> dict:
    """
    Log an analytics event for a free-tier site.
    
    Args:
        event_data: Dictionary containing event fields from the tracker payload.
                   Must include 'site_hex', 'unique_cookie', 'session_id', 'page_path', etc.
        ip_address: Optional client IP address for tracking (will be hashed for privacy)
    
    Returns:
        The inserted event record
    """
    try:
        if not event_data or not event_data.get("site_hex"):
            raise ValueError("Event data must include site_hex")
        
        # Hash IP for privacy
        ip_hash = hashlib.sha256(ip_address.encode()).hexdigest()[:16] if ip_address else None
        
        # Stamp with the Lamport logical clock for distributed ordering
        stamp = get_clock().stamp(event_data.get("lamport_ts") or 0)
        
        # Prepare event record with all fields from tracker
        page_url = event_data.get("page_url") or event_data.get("page_path") or "/"

        event_record = {
            "site_hex": event_data.get("site_hex"),
            "unique_cookie": event_data.get("unique_cookie"),
            "session_id": event_data.get("session_id"),
            "page_url": page_url,
            "page_path": event_data.get("page_path", "/"),
            "page_title": event_data.get("page_title"),
            "page_hostname": event_data.get("page_hostname"),
            "device_type": event_data.get("device_type"),
            "viewport_res": event_data.get("viewport_res"),
            "screen_res": event_data.get("screen_res"),
            "browser": event_data.get("browser"),
            "browser_version": event_data.get("browser_version"),
            "os": event_data.get("os"),
            "os_version": event_data.get("os_version"),
            "utm_source": event_data.get("utm_source"),
            "utm_medium": event_data.get("utm_medium"),
            "utm_campaign": event_data.get("utm_campaign"),
            "utm_content": event_data.get("utm_content"),
            "utm_term": event_data.get("utm_term"),
            "referrer": event_data.get("referrer"),
            "page_load_time": event_data.get("page_load_time"),
            "dom_interactive_time": event_data.get("dom_interactive_time"),
            "first_paint_time": event_data.get("first_paint_time"),
            "first_contentful_paint_time": event_data.get("first_contentful_paint_time"),
            "interaction_count": event_data.get("interaction_count", 0),
            "scroll_depth": event_data.get("scroll_depth", 0),
            "is_bounce": event_data.get("is_bounce", False),
            "country": event_data.get("country"),
            "country_code": event_data.get("country_code"),
            "region": event_data.get("region"),
            "city": event_data.get("city"),
            "latitude": event_data.get("latitude"),
            "longitude": event_data.get("longitude"),
            "isp": event_data.get("isp"),
            "connection_type": event_data.get("connection_type"),
            "connection_effective_type": event_data.get("connection_effective_type"),
            "language": event_data.get("language"),
            "timezone": event_data.get("timezone"),
            "ref": event_data.get("ref"),
            "source_type": event_data.get("source_type"),
            "source_name": event_data.get("source_name"),
            "first_touch_source_type": event_data.get("first_touch_source_type"),
            "first_touch_source_name": event_data.get("first_touch_source_name"),
            "first_touch_source_url": event_data.get("first_touch_source_url"),
            "first_touch_landing_url": event_data.get("first_touch_landing_url"),
            "first_touch_landing_path": event_data.get("first_touch_landing_path"),
            "first_touch_at": event_data.get("first_touch_at"),
            "first_touch_click_id": event_data.get("first_touch_click_id"),
            "first_touch_utm_source": event_data.get("first_touch_utm_source"),
            "first_touch_utm_medium": event_data.get("first_touch_utm_medium"),
            "first_touch_utm_campaign": event_data.get("first_touch_utm_campaign"),
            "first_touch_utm_content": event_data.get("first_touch_utm_content"),
            "first_touch_utm_term": event_data.get("first_touch_utm_term"),
            "event_type": event_data.get("event_type", "page_view"),
            "event_time": event_data.get("event_time") or datetime.utcnow().isoformat(),
            "lamport_ts": stamp["lamport_ts"],
            "process_id": stamp["process_id"],
            "received_at": datetime.utcnow().isoformat(),
            "ip_hash": ip_hash,
        }
        
        response = (
            supabase.table("free_sites_raw_event")
            .insert(event_record)
            .execute()
        )
        
        if not response.data:
            raise Exception("Failed to log event to free_sites_raw_event")
        
        logger.debug(f"Event logged for site_hex={event_data.get('site_hex')}")
        return response.data[0]
    
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error logging free event: {str(e)}", exc_info=True)
        raise Exception(f"Error logging free event: {str(e)}")
