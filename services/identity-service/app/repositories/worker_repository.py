# repositories/worker_repository.py – Data-access layer for the Worker model.

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.database.repository import BaseRepository
from app.models.worker import Worker


class WorkerRepository(BaseRepository[Worker]):
    """Worker-specific queries extending the generic CRUD repository."""

    def __init__(self, db: AsyncSession):
        super().__init__(Worker, db)

    async def get_by_phone(self, phone_number: str) -> Optional[Worker]:
        """Look up a worker by phone number (used during OTP login)."""
        result = await self.db.execute(
            select(Worker).where(Worker.phone_number == phone_number)
        )
        return result.scalar_one_or_none()

    async def get_verified_workers(self) -> list[Worker]:
        """Return all workers with completed KYC – used by policy service."""
        result = await self.db.execute(
            select(Worker).where(Worker.kyc_status == "verified")
        )
        return result.scalars().all()
