import os

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from core.auth import create_session, extract_session_token, get_current_user, invalidate_session
from core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
from models.schemas import (
    SignedInUser,
    SignedInUserResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    GoogleAuthRequest,
    GoogleAuthResponse,
)
from services.users import create_user, login_user, get_user_by_email, upsert_google_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _set_session_cookie(response: Response, session_token: str) -> None:
    secure_cookie = os.getenv("ENV") == "production"
    response.set_cookie(
        key="auth-token",
        value=session_token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        path="/",
        max_age=15 * 24 * 60 * 60,
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key="auth-token", path="/")


@router.post(
    "/register",
    response_model=RegisterResponse,
    summary="Register new user",
    description="Create a new user account. Returns session token on success.",
)
async def register(request: RegisterRequest, response: Response):
    """Register a new user account."""
    try:
        # Check if user already exists
        existing = get_user_by_email(request.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Create user
        create_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
        )

        # Create session (15 days)
        user_signed_in, session_token = login_user(request.email, request.password)
        _set_session_cookie(response, session_token)

        return {
            "authenticated": True,
            "session_token": session_token,
            "user": user_signed_in,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login user",
    description="Authenticate user with email and password. Session expires in 15 days.",
)
async def login(request: LoginRequest, response: Response):
    """Login with email and password."""
    try:
        user, session_token = login_user(request.email, request.password)
        _set_session_cookie(response, session_token)

        return {
            "authenticated": True,
            "session_token": session_token,
            "user": user,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )


@router.get(
    "/me",
    response_model=SignedInUserResponse,
    summary="Get current user",
    description="Get the profile of the currently authenticated user.",
)
async def get_signed_in_user(current_user: SignedInUser = Depends(get_current_user)):
    """Get current authenticated user info."""
    return {
        "authenticated": True,
        "data": current_user,
    }


@router.post(
    "/logout",
    summary="Logout user",
    description="Invalidate the session token and logout.",
)
async def logout(request: Request, response: Response):
    """Logout and invalidate session."""
    try:
        session_token = extract_session_token(request)
        if session_token:
            invalidate_session(session_token)
        _clear_session_cookie(response)
        return {
            "success": True,
            "message": "Logged out successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}",
        )


@router.post(
    "/google",
    response_model=GoogleAuthResponse,
    summary="Google OAuth sign in",
    description="Exchange a Google authorization code for a backend session and create or update the Supabase user.",
)
async def google_login(request: GoogleAuthRequest, response: Response):
    """Authenticate a user with Google OAuth2 and create a backend session."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured on the backend",
        )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": request.code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": "postmessage",
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange Google authorization code",
                )

            token_data = token_response.json()
            google_token = token_data.get("id_token")
            if not google_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google did not return an ID token",
                )

            id_info = google_id_token.verify_oauth2_token(
                google_token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )

            if id_info.get("aud") != GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google token audience mismatch",
                )

            if not id_info.get("email"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google account did not return an email address",
                )

            user_record = upsert_google_user(
                email=id_info["email"],
                google_sub=id_info["sub"],
                first_name=id_info.get("given_name"),
                last_name=id_info.get("family_name"),
                image_url=id_info.get("picture"),
            )

            session_token = create_session(user_record["id"])
            _set_session_cookie(response, session_token)

            signed_in_user = SignedInUser(
                id=user_record["id"],
                email=user_record["email"],
                first_name=user_record.get("first_name"),
                last_name=user_record.get("last_name"),
                username=user_record.get("username"),
                image_url=user_record.get("image_url"),
                created_at=user_record.get("created_at"),
            )

            return {
                "authenticated": True,
                "user": signed_in_user,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}",
        )