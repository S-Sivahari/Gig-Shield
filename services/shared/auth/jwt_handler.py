"""
jwt_handler.py — JWT creation and verification for worker and admin tokens.
All services use the same secret key so tokens work across the gateway.
"""
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from ..config.settings import settings

def create_access_token(payload: dict) -> str:
    """Create a short-lived access token (default 60 min)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    return jwt.encode({**payload, "exp": expire}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(payload: dict) -> str:
    """Create a long-lived refresh token (default 30 days)."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    return jwt.encode({**payload, "exp": expire, "type": "refresh"}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """
    Decode and verify a JWT. Raises JWTError on invalid/expired tokens.
    Returns the decoded payload dict (includes worker_id, role, etc.).
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
