"""
User management service - handles Clerk user sync to Supabase.
"""

import logging
from datetime import datetime

from core.config import supabase
from models.schemas import SignedInUser

logger = logging.getLogger(__name__)


def upsert_user(user: SignedInUser) -> dict:
    """
    Create or update a user from Clerk token claims.
    Called on every /api/auth/me request to keep data in sync.

    Args:
        user: Normalized signed-in user from Clerk JWT

    Returns:
        The upserted user record from Supabase

    Raises:
        Exception: If upsert fails
    """
    try:
        logger.info(f"Upserting user: {user.clerk_user_id}")

        response = supabase.table("users").upsert(
            {
                "clerk_user_id": user.clerk_user_id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "image_url": user.image_url,
                "role": user.role,
                "updated_at": datetime.utcnow().isoformat(),
                "last_signin_at": datetime.utcnow().isoformat(),
            },
            on_conflict="clerk_user_id",
        ).execute()

        if response.data:
            logger.info(f"User upserted successfully: {response.data[0]}")
            return response.data[0]
        else:
            raise Exception("Failed to upsert user in Supabase")

    except Exception as e:
        logger.error(f"Error upserting user: {str(e)}", exc_info=True)
        raise


def get_user_by_clerk_id(clerk_user_id: str) -> dict | None:
    """
    Fetch a user by their Clerk user ID.

    Args:
        clerk_user_id: The Clerk user identifier

    Returns:
        User record or None if not found
    """
    try:
        logger.info(f"Fetching user: {clerk_user_id}")
        response = supabase.table("users").select("*").eq(
            "clerk_user_id", clerk_user_id
        ).execute()

        if response.data:
            logger.info(f"User found: {response.data[0]}")
            return response.data[0]
        else:
            logger.warning(f"User not found: {clerk_user_id}")
            return None

    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}", exc_info=True)
        raise


def get_user_by_email(email: str) -> dict | None:
    """
    Fetch a user by email address.

    Args:
        email: The user's email

    Returns:
        User record or None if not found
    """
    try:
        logger.info(f"Fetching user by email: {email}")
        response = supabase.table("users").select("*").eq("email", email).execute()

        if response.data:
            logger.info(f"User found: {response.data[0]}")
            return response.data[0]
        else:
            logger.warning(f"User not found by email: {email}")
            return None

    except Exception as e:
        logger.error(f"Error fetching user by email: {str(e)}", exc_info=True)
        raise


def update_user_last_signin(clerk_user_id: str) -> dict | None:
    """
    Update the last_signin_at timestamp for a user.

    Args:
        clerk_user_id: The Clerk user identifier

    Returns:
        Updated user record
    """
    try:
        logger.info(f"Updating last signin for user: {clerk_user_id}")
        response = (
            supabase.table("users")
            .update({"last_signin_at": datetime.utcnow().isoformat()})
            .eq("clerk_user_id", clerk_user_id)
            .execute()
        )

        if response.data:
            logger.info(f"Last signin updated: {response.data[0]}")
            return response.data[0]
        else:
            logger.warning(f"User not found: {clerk_user_id}")
            return None

    except Exception as e:
        logger.error(f"Error updating last signin: {str(e)}", exc_info=True)
        raise


def delete_user(clerk_user_id: str) -> bool:
    """
    Delete a user and all associated data (cascading).

    Args:
        clerk_user_id: The Clerk user identifier

    Returns:
        True if deleted, False if not found
    """
    try:
        logger.info(f"Deleting user: {clerk_user_id}")
        response = supabase.table("users").delete().eq(
            "clerk_user_id", clerk_user_id
        ).execute()

        logger.info(f"User deleted: {clerk_user_id}")
        return True

    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}", exc_info=True)
        raise
