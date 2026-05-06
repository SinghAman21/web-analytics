"""
User management service - handles registration, login, and session management.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from core.config import supabase
from core.auth import hash_password, verify_password, create_session
from models.schemas import SignedInUser

logger = logging.getLogger(__name__)


def create_user(email: str, password: str, first_name: Optional[str] = None, 
                last_name: Optional[str] = None) -> Dict[str, Any]:
	"""
	Create a new user account.

	Args:
		email: User email (must be unique)
		password: User password (will be hashed)
		first_name: Optional first name
		last_name: Optional last name

	Returns:
		The created user record

	Raises:
		Exception: If user creation fails or email already exists
	"""
	try:
		logger.info(f"Creating user: {email}")

		# Check if user already exists
		existing = supabase.table("users").select("*").eq("email", email).execute()
		if existing.data:
			raise Exception("User with this email already exists")

		password_hash = hash_password(password)

		response = supabase.table("users").insert({
			"email": email,
			"password_hash": password_hash,
			"auth_provider": "local",
			"first_name": first_name,
			"last_name": last_name,
		}).execute()

		if response.data:
			logger.info(f"User created successfully: {email}")
			return response.data[0]
		else:
			raise Exception("Failed to create user")

	except Exception as e:
		logger.error(f"Error creating user: {str(e)}", exc_info=True)
		raise


def upsert_google_user(
	email: str,
	google_sub: str,
	first_name: Optional[str] = None,
	last_name: Optional[str] = None,
	image_url: Optional[str] = None,
) -> Dict[str, Any]:
	"""Create or update a Supabase user record for a Google account."""
	try:
		logger.info(f"Upserting Google user: {email}")
		now = datetime.utcnow().isoformat()

		google_match = supabase.table("users").select("*").eq("google_sub", google_sub).execute()
		if google_match.data:
			user_id = google_match.data[0]["id"]
			update_data = {
				"email": email,
				"google_sub": google_sub,
				"auth_provider": "google",
				"first_name": first_name,
				"last_name": last_name,
				"image_url": image_url,
				"last_signin_at": now,
				"updated_at": now,
			}
			response = supabase.table("users").update(update_data).eq("id", user_id).execute()
			if response.data:
				return response.data[0]
			raise Exception("Failed to update Google user")

		email_match = supabase.table("users").select("*").eq("email", email).execute()
		if email_match.data:
			user_id = email_match.data[0]["id"]
			update_data = {
				"google_sub": google_sub,
				"auth_provider": "google",
				"first_name": first_name,
				"last_name": last_name,
				"image_url": image_url,
				"last_signin_at": now,
				"updated_at": now,
			}
			response = supabase.table("users").update(update_data).eq("id", user_id).execute()
			if response.data:
				return response.data[0]
			raise Exception("Failed to update existing user with Google profile")

		response = supabase.table("users").insert({
			"email": email,
			"password_hash": None,
			"auth_provider": "google",
			"google_sub": google_sub,
			"first_name": first_name,
			"last_name": last_name,
			"image_url": image_url,
			"last_signin_at": now,
		}).execute()

		if response.data:
			return response.data[0]
		raise Exception("Failed to create Google user")

	except Exception as e:
		logger.error(f"Error upserting Google user: {str(e)}", exc_info=True)
		raise


def login_user(email: str, password: str, ip_address: Optional[str] = None,
			   user_agent: Optional[str] = None) -> tuple[SignedInUser, str]:
	"""
	Authenticate a user and create a session.
	Session expires in 15 days and resets on each login.

	Args:
		email: User email
		password: User password
		ip_address: Optional IP address for session tracking
		user_agent: Optional user agent for session tracking

	Returns:
		Tuple of (SignedInUser, session_token)

	Raises:
		Exception: If login fails
	"""
	try:
		logger.info(f"Login attempt: {email}")

		# Find user by email
		response = supabase.table("users").select("*").eq("email", email).execute()
		if not response.data:
			raise Exception("Invalid email or password")

		user = response.data[0]

		# Verify password
		if not verify_password(password, user["password_hash"]):
			raise Exception("Invalid email or password")

		# Create session (expires in 15 days)
		session_token = create_session(user["id"], ip_address, user_agent)

		# Return user info and session token
		signed_in_user = SignedInUser(
			id=user["id"],
			email=user["email"],
			first_name=user.get("first_name"),
			last_name=user.get("last_name"),
			username=user.get("username"),
			image_url=user.get("image_url"),
			created_at=user.get("created_at"),
		)

		logger.info(f"User logged in successfully: {email}")
		return signed_in_user, session_token

	except Exception as e:
		logger.error(f"Login error: {str(e)}", exc_info=True)
		raise


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
	"""
	Fetch a user by ID.

	Args:
		user_id: The user ID

	Returns:
		User record or None if not found
	"""
	try:
		logger.info(f"Fetching user: {user_id}")
		response = supabase.table("users").select("*").eq("id", user_id).execute()

		if response.data:
			logger.info(f"User found: {user_id}")
			return response.data[0]
		else:
			logger.warning(f"User not found: {user_id}")
			return None

	except Exception as e:
		logger.error(f"Error fetching user: {str(e)}", exc_info=True)
		raise


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
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
			logger.info(f"User found: {email}")
			return response.data[0]
		else:
			logger.warning(f"User not found by email: {email}")
			return None

	except Exception as e:
		logger.error(f"Error fetching user by email: {str(e)}", exc_info=True)
		raise


def update_user_last_signin(user_id: int) -> Optional[Dict[str, Any]]:
	"""
	Update the last_signin_at timestamp for a user.

	Args:
		user_id: The user ID

	Returns:
		Updated user record
	"""
	try:
		logger.info(f"Updating last signin for user: {user_id}")
		response = (
			supabase.table("users")
			.update({"last_signin_at": datetime.now(timezone.utc).isoformat()})
			.eq("id", user_id)
			.execute()
		)

		if response.data:
			logger.info(f"Last signin updated: {user_id}")
			return response.data[0]
		else:
			logger.warning(f"User not found: {user_id}")
			return None

	except Exception as e:
		logger.error(f"Error updating last signin: {str(e)}", exc_info=True)
		raise


def delete_user(user_id: int) -> bool:
	"""
	Delete a user and all associated sessions.

	Args:
		user_id: The user ID

	Returns:
		True if deleted
	"""
	try:
		logger.info(f"Deleting user: {user_id}")
		supabase.table("users").delete().eq("id", user_id).execute()
		logger.info(f"User deleted: {user_id}")
		return True

	except Exception as e:
		logger.error(f"Error deleting user: {str(e)}", exc_info=True)
		raise


def update_user_profile(user_id: int, first_name: Optional[str] = None, 
                        last_name: Optional[str] = None, username: Optional[str] = None,
                        image_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
	"""
	Update user profile information.

	Args:
		user_id: The user ID
		first_name: Optional first name
		last_name: Optional last name
		username: Optional username
		image_url: Optional image URL

	Returns:
		Updated user record
	"""
	try:
		logger.info(f"Updating profile for user: {user_id}")

		update_data = {"updated_at": datetime.utcnow().isoformat()}
		if first_name is not None:
			update_data["first_name"] = first_name
		if last_name is not None:
			update_data["last_name"] = last_name
		if username is not None:
			update_data["username"] = username
		if image_url is not None:
			update_data["image_url"] = image_url

		response = supabase.table("users").update(update_data).eq("id", user_id).execute()

		if response.data:
			logger.info(f"Profile updated: {user_id}")
			return response.data[0]
		else:
			logger.warning(f"User not found: {user_id}")
			return None

	except Exception as e:
		logger.error(f"Error updating profile: {str(e)}", exc_info=True)
		raise
