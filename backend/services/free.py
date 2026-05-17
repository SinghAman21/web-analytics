from core.config import supabase
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


    # Backward-compatible aliases while routes/services are being renamed.
    create_user_site = create_free_site
    list_user_sites = list_free_sites
