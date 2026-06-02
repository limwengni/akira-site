from fastapi import Header, HTTPException

from .config import get_settings
from .supabase_client import supabase

settings = get_settings()


def require_authenticated_user(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    user_response = supabase.auth.get_user(token)
    user = getattr(user_response, "user", None)

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_email = getattr(user, "email", None)

    if not settings.admin_email:
        raise HTTPException(status_code=500, detail="Admin email not configured")

    if user_email != settings.admin_email:
        raise HTTPException(status_code=403, detail="You are not allowed to perform this action")

    return user
