"""
dependencies.py — FastAPI dependencies for authentication and role enforcement.
Usage:
    @router.get("/admin")
    async def admin_only(user = Depends(require_admin)):
        ...
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import verify_token

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    """Extract and validate JWT from Authorization header. Returns token payload."""
    try:
        return verify_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Deny access unless the token carries role='admin'."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user

def require_worker(user: dict = Depends(get_current_user)) -> dict:
    """Deny access unless the token carries role='worker'."""
    if user.get("role") not in ("worker", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Worker role required")
    return user
