"""
Session-based authentication module.
Sessions expire after 15 days and are reset on each login.
"""

import secrets
import hashlib
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

from models.schemas import SignedInUser
from core.config import supabase

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

bearer_scheme = HTTPBearer(auto_error=False)

# Session expiry: 15 days
SESSION_EXPIRY_DAYS = 15


def _utc_now() -> datetime:
	"""Return the current UTC time as a timezone-aware datetime."""
	return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
	"""Hash a password using PBKDF2."""
	salt = secrets.token_hex(16)
	pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
	return f"{salt}${pwd_hash.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
	"""Verify a password against its hash."""
	try:
		salt, pwd_hash = password_hash.split("$")
		computed_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
		return computed_hash.hex() == pwd_hash
	except Exception:
		return False


def generate_session_token() -> str:
	"""Generate a secure random session token."""
	return secrets.token_urlsafe(32)


def create_session(user_id: int, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> str:
	"""
	Create a new session token for a user.
	Expires in 15 days. Resets expiry if user already has sessions.

	Args:
		user_id: The user ID
		ip_address: Optional IP address for security tracking
		user_agent: Optional user agent for security tracking

	Returns:
		The session token

	Raises:
		Exception: If session creation fails
	"""
	session_token = generate_session_token()
	expires_at = _utc_now() + timedelta(days=SESSION_EXPIRY_DAYS)

	try:
		response = supabase.table("free_user_sessions").insert({
			"user_id": user_id,
			"session_token": session_token,
			"ip_address": ip_address,
			"user_agent": user_agent,
			"expires_at": expires_at.isoformat(),
		}).execute()

		# Update user's last_signin_at
		supabase.table("free_users").update({
			"last_signin_at": _utc_now().isoformat()
		}).eq("id", user_id).execute()

		return session_token
	except Exception as e:
		raise Exception(f"Failed to create session: {str(e)}")


def validate_session(session_token: str) -> Optional[int]:
	"""
	Validate a session token and return the user ID.
	Also updates the last_activity_at timestamp and extends expiry to 15 days.

	Args:
		session_token: The session token to validate

	Returns:
		User ID if valid, None if invalid or expired

	Raises:
		Exception: If session lookup fails
	"""
	try:
		response = supabase.table("free_user_sessions").select("*").eq(
			"session_token", session_token
		).execute()

		if not response.data:
			return None

		session = response.data[0]

		# Check if session is expired
		expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
		if expires_at.tzinfo is None:
			expires_at = expires_at.replace(tzinfo=timezone.utc)
		if _utc_now() > expires_at:
			# Session expired, delete it
			try:
				supabase.table("free_user_sessions").delete().eq("session_token", session_token).execute()
			except Exception:
				pass  # Ignore errors during cleanup
			return None

		# Reset expiry to 15 days from now and update last activity
		new_expires_at = _utc_now() + timedelta(days=SESSION_EXPIRY_DAYS)
		try:
			supabase.table("free_user_sessions").update({
				"last_activity_at": _utc_now().isoformat(),
				"expires_at": new_expires_at.isoformat()
			}).eq("session_token", session_token).execute()
		except Exception:
			pass  # Ignore errors updating activity (session still valid)

		return session["user_id"]

	except Exception as e:
		# Return None for any database errors (treat as invalid session)
		return None


def get_current_user(
	request: Request,
	credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> SignedInUser:
	"""
	Dependency to get the current authenticated user from session token.

	Args:
		credentials: Bearer token from Authorization header

	Returns:
		SignedInUser object with user data

	Raises:
		HTTPException: If authentication fails
	"""
	session_token = None
	if credentials and credentials.scheme.lower() == "bearer":
		session_token = credentials.credentials
	else:
		session_token = request.cookies.get("auth-token")

	if not session_token:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Missing authentication token",
		)

	user_id = validate_session(session_token)
	if not user_id:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired session token",
		)

	# Fetch user details
	try:
		response = supabase.table("free_users").select("*").eq("id", user_id).execute()

		if not response.data:
			raise HTTPException(
				status_code=status.HTTP_401_UNAUTHORIZED,
				detail="User not found",
			)

		user_data = response.data[0]
		return SignedInUser(
			id=user_data["id"],
			email=user_data["email"],
			first_name=user_data.get("first_name"),
			last_name=user_data.get("last_name"),
			username=user_data.get("username"),
			image_url=user_data.get("image_url"),
			created_at=user_data.get("created_at"),
		)

	except HTTPException:
		raise
	except Exception as e:
		# Log the error but return 401 (treat DB errors as auth failure)
		import logging
		logging.error(f"Failed to fetch user {user_id}: {str(e)}")
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Authentication failed",
		)


def extract_session_token(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
	"""Read the session token from bearer header or the auth cookie."""
	if credentials and credentials.scheme.lower() == "bearer":
		return credentials.credentials
	auth_header = request.headers.get("authorization")
	if auth_header and auth_header.lower().startswith("bearer "):
		return auth_header.split(" ", 1)[1].strip()
	return request.cookies.get("auth-token")


def invalidate_session(session_token: str) -> bool:
	"""
	Invalidate a session token (logout).

	Args:
		session_token: The session token to invalidate

	Returns:
		True if successful

	Raises:
		Exception: If session deletion fails
	"""
	try:
		supabase.table("free_user_sessions").delete().eq("session_token", session_token).execute()
		return True
	except Exception as e:
		raise Exception(f"Failed to invalidate session: {str(e)}")
