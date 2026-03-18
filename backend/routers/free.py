from fastapi import APIRouter, Depends

from core.auth import get_current_clerk_user
from models.schemas import SignedInUser, SignedInUserResponse
from services.users import upsert_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.get(
    "/me",
    response_model=SignedInUserResponse,
    summary="Get signed-in user",
    description="Returns normalized user information from the validated Clerk session token. Auto-syncs user to Supabase on sign-in.",
)
async def get_signed_in_user(
    current_user: SignedInUser = Depends(get_current_clerk_user),
):
    # Upsert user to Supabase on every sign-in
    upsert_user(current_user)

    return {
        "authenticated": True,
        "data": current_user,
    }