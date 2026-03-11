"""
response.py — Standardised JSON response envelope used by all API endpoints.
Ensures consistent shape: { success, data, message, meta }
"""
from typing import Generic, TypeVar, Any
from pydantic import BaseModel

DataType = TypeVar("DataType")

class ApiResponse(BaseModel, Generic[DataType]):
    """
    Standard API response wrapper.
    Example:
        return ApiResponse(success=True, data=worker, message="Worker created")
    """
    success: bool = True
    data: DataType | None = None
    message: str = "OK"
    meta: dict[str, Any] | None = None   # optional pagination info, counts, etc.

class PaginatedResponse(ApiResponse[list[DataType]], Generic[DataType]):
    """Wraps a list with pagination meta. total, page, page_size are in .meta."""
    pass
