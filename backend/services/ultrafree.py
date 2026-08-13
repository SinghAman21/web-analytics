from core.config import supabase
from core.lamport import get_clock
from typing import Optional
import secrets
import string
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def create_ultrafree(
    site_name: str,
    site_url: str,
    hex_share_id: str,
) -> dict:
    """
    Create an ultrafree site in Supabase.
    
    Args:
        site_name: Name of the site
        site_url: URL of the site
        hex_share_id: The 12-character hex ID generated from frontend
    
    Returns:
        The created site record
    
    Raises:
        Exception: If creation fails
    """
    # Validate inputs
    if not site_name or not site_name.strip():
        raise ValueError("Site name cannot be empty")
    if not site_url or not site_url.strip():
        raise ValueError("Site URL cannot be empty")
    if not hex_share_id or len(hex_share_id) != 12:
        raise ValueError("Hex share ID must be 12 characters")
    
    try:
        logger.info(f"Creating ultrafree site: {site_name}")
        # Insert into ultrafree_sites table
        response = supabase.table("ultrafree").insert({
            "hex_share_id": hex_share_id,
            "name": site_name.strip(),
            "site_url": site_url.strip(),
        }).execute()
        
        logger.info(f"Response data: {response.data}")
        if response.data:
            return response.data[0]
        else:
            raise Exception("Failed to create site in Supabase")
    
    except Exception as e:
        logger.error(f"Error creating ultrafree site: {str(e)}", exc_info=True)
        raise Exception(f"Error creating ultrafree site: {str(e)}")


def get_ultrafree(hex_share_id: str) -> Optional[dict]:
    """
    Retrieve an ultrafree site by its hex_share_id.
    
    Args:
        hex_share_id: The hex ID of the site
    
    Returns:
        The site record or None if not found
    """
    try:
        logger.info(f"Fetching ultrafree site: {hex_share_id}")
        response = supabase.table("ultrafree").select(
            "*"
        ).eq("hex_share_id", hex_share_id).execute()
        
        logger.info(f"Response data: {response.data}")
        return response.data[0] if response.data else None
    
    except Exception as e:
        logger.error(f"Error retrieving ultrafree site: {str(e)}", exc_info=True)
        raise Exception(f"Error retrieving ultrafree site: {str(e)}")


def list_ultrafree(limit: int = 100, offset: int = 0) -> dict:
    """
    List ultrafree sites with pagination.
    
    Args:
        limit: Maximum number of sites to return
        offset: Number of sites to skip
    
    Returns:
        Dictionary with sites list and total count
    """
    try:
        logger.info(f"Listing ultrafree sites: limit={limit}, offset={offset}")
        # Get total count
        count_response = supabase.table("ultrafree").select(
            "id", count="exact"
        ).execute()
        
        total_count = count_response.count or 0
        
        # Get paginated data
        response = supabase.table("ultrafree").select(
            "*"
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        logger.info(f"Retrieved {len(response.data) if response.data else 0} sites")
        return {
            "data": response.data if response.data else [],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        logger.error(f"Error listing ultrafree sites: {str(e)}", exc_info=True)
        raise Exception(f"Error listing ultrafree sites: {str(e)}")

def log_ultrafreeevent(event_data: dict, ip_address: str) -> dict:
    """
    Insert an event into ultrafree_raw_events table
    
    Args:
        event_data: The event data from frontend
        ip_address: User's IP address (from request)
    
    Returns:
        The inserted event record
    """
    try:
        logger.info(f"Logging event for site: {event_data.get('site_hex')}")
        # Hash the IP address for privacy
        ip_hash = hashlib.sha256(ip_address.encode()).hexdigest()
        
        # Stamp with the Lamport logical clock for distributed ordering
        stamp = get_clock().stamp(event_data.get("lamport_ts") or 0)
        
        # Insert into ultrafree_raw_events
        response = supabase.table("ultrafree_raw_events").insert({
            "site_hex": event_data["site_hex"],
            "unique_cookie": event_data["unique_cookie"],
            "session_id": event_data["session_id"],
            "page_path": event_data["page_path"],
            "device_type": event_data["device_type"],
            "ip_hash": ip_hash,
            "screen_res": event_data.get("screen_res"),
            "lamport_ts": stamp["lamport_ts"],
            "process_id": stamp["process_id"],
            "received_at": datetime.utcnow().isoformat(),
        }).execute()
        
        logger.info(f"Event logged successfully")
        if response.data:
            return response.data[0]
        else:
            raise Exception("Failed to log event in Supabase")
    
    except Exception as e:
        logger.error(f"Error logging event: {str(e)}", exc_info=True)
        raise Exception(f"Error logging event: {str(e)}")


def get_site_tier(hex_share_id: str) -> Optional[str]:
    """
    Determine if a hex_share_id belongs to free or ultrafree tier.
    
    Args:
        hex_share_id: The 12-character site identifier
    
    Returns:
        'free' if in free_sites table,
        'ultrafree' if in ultrafree table,
        None if not found in either
    """
    try:
        # Check free_sites first
        free_response = supabase.table("free_sites").select(
            "id"
        ).eq("hex_share_id", hex_share_id).eq("is_active", True).limit(1).execute()
        
        if free_response.data:
            return "free"
        
        # Check ultrafree
        ultrafree_response = supabase.table("ultrafree").select(
            "id"
        ).eq("hex_share_id", hex_share_id).limit(1).execute()
        
        if ultrafree_response.data:
            return "ultrafree"
        
        return None
    
    except Exception as e:
        logger.error(f"Error determining site tier for {hex_share_id}: {str(e)}", exc_info=True)
        return None