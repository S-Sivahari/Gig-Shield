"""
base.py — Custom exception hierarchy for GigShield services.
The global error handler converts these into consistent JSON responses.
"""
from fastapi import HTTPException, status

class AppError(HTTPException):
    """Base exception for all application errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)

class NotFoundError(AppError):
    """Resource does not exist (404)."""
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} with id '{id}' not found", status.HTTP_404_NOT_FOUND)

class ValidationError(AppError):
    """Business rule or input validation failed (422)."""
    def __init__(self, detail: str):
        super().__init__(detail, status.HTTP_422_UNPROCESSABLE_ENTITY)

class UnauthorizedError(AppError):
    """Authentication required or token invalid (401)."""
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(detail, status.HTTP_401_UNAUTHORIZED)

class ForbiddenError(AppError):
    """Authenticated but insufficient permissions (403)."""
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(detail, status.HTTP_403_FORBIDDEN)

class ConflictError(AppError):
    """Duplicate resource or conflicting state (409)."""
    def __init__(self, detail: str):
        super().__init__(detail, status.HTTP_409_CONFLICT)
