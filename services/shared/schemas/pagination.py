"""
pagination.py — Query params for paginated list endpoints.
Usage:
    @router.get("/workers")
    async def list_workers(params: PaginationParams = Depends()):
        workers = await repo.list(limit=params.page_size, offset=params.offset)
"""
from fastapi import Query
from dataclasses import dataclass

@dataclass
class PaginationParams:
    page: int      = Query(default=1, ge=1,   description="Page number (1-indexed)")
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        """Calculate SQL OFFSET from page + page_size."""
        return (self.page - 1) * self.page_size
