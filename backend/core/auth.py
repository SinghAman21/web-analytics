import os
from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from models.schemas import SignedInUser

bearer_scheme = HTTPBearer(auto_error=False)


def _normalize_issuer(issuer: Optional[str]) -> Optional[str]:
	if not issuer:
		return None
	return issuer.rstrip("/")


def _resolve_jwks_url() -> str:
	configured = os.getenv("CLERK_JWKS_URL")
	if configured:
		return configured.strip()

	issuer = _normalize_issuer(os.getenv("CLERK_ISSUER"))
	if issuer:
		return f"{issuer}/.well-known/jwks.json"

	raise RuntimeError(
		"Missing Clerk configuration. Set CLERK_JWKS_URL or CLERK_ISSUER in backend environment variables."
	)


def _resolve_issuer_for_verification() -> Optional[list[str]]:
	issuer = _normalize_issuer(os.getenv("CLERK_ISSUER"))
	if not issuer:
		return None
	# Clerk issuer can appear with or without trailing slash depending on token template.
	return [issuer, f"{issuer}/"]


def _decode_clerk_token(token: str) -> Dict[str, Any]:
	try:
		jwks_client = jwt.PyJWKClient(_resolve_jwks_url())
		signing_key = jwks_client.get_signing_key_from_jwt(token).key

		issuer = _resolve_issuer_for_verification()
		audience = os.getenv("CLERK_AUDIENCE")

		options = {
			"verify_aud": bool(audience),
			"verify_iss": bool(issuer),
		}
		return jwt.decode(
			token,
			signing_key,
			algorithms=["RS256"],
			issuer=issuer,
			audience=audience,
			options=options,
		)
	except RuntimeError:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired Clerk token",
		) from exc


def _extract_email(claims: Dict[str, Any]) -> Optional[str]:
	if isinstance(claims.get("email"), str):
		return claims["email"]

	if isinstance(claims.get("email_address"), str):
		return claims["email_address"]

	email_addresses = claims.get("email_addresses")
	if isinstance(email_addresses, list) and email_addresses:
		first = email_addresses[0]
		if isinstance(first, dict) and isinstance(first.get("email_address"), str):
			return first["email_address"]

	return None


def _extract_name(claims: Dict[str, Any], field: str) -> Optional[str]:
	if isinstance(claims.get(field), str):
		return claims[field]

	if field == "first_name" and isinstance(claims.get("given_name"), str):
		return claims["given_name"]

	if field == "last_name" and isinstance(claims.get("family_name"), str):
		return claims["family_name"]

	return None


def _to_signed_in_user(claims: Dict[str, Any]) -> SignedInUser:
	clerk_user_id = claims.get("sub")
	if not isinstance(clerk_user_id, str) or not clerk_user_id:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid Clerk token payload",
		)

	claim_subset = {
		"iss": claims.get("iss"),
		"aud": claims.get("aud"),
		"azp": claims.get("azp"),
		"org_id": claims.get("org_id"),
		"org_slug": claims.get("org_slug"),
	}

	return SignedInUser(
		clerk_user_id=clerk_user_id,
		session_id=claims.get("sid"),
		email=_extract_email(claims),
		first_name=_extract_name(claims, "first_name"),
		last_name=_extract_name(claims, "last_name"),
		username=claims.get("username"),
		image_url=claims.get("image_url"),
		role=claims.get("org_role"),
		claims=claim_subset,
	)


def get_current_clerk_user(
	credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> SignedInUser:
	"""Validate Clerk bearer token and return normalized signed-in user data."""
	if not credentials or credentials.scheme.lower() != "bearer":
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Missing bearer token",
		)

	claims = _decode_clerk_token(credentials.credentials)
	return _to_signed_in_user(claims)
