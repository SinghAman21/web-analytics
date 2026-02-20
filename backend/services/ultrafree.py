from core.config import supabase
from typing import Optional
import secrets
import string


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
        # Insert into ultrafree_sites table
        response = supabase.table("ultrafree").insert({
            "hex_share_id": hex_share_id,
            "name": site_name.strip(),
            "site_url": site_url.strip(),
        }).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise Exception("Failed to create site in Supabase")
    
    except Exception as e:
        # Re-raise with more context
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
        response = supabase.table("ultrafree").select(
            "*"
        ).eq("hex_share_id", hex_share_id).execute()
        
        return response.data[0] if response.data else None
    
    except Exception as e:
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
        # Get total count
        count_response = supabase.table("ultrafree").select(
            "id", count="exact"
        ).execute()
        
        total_count = count_response.count or 0
        
        # Get paginated data
        response = supabase.table("ultrafree").select(
            "*"
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "data": response.data if response.data else [],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        raise Exception(f"Error listing ultrafree sites: {str(e)}")
