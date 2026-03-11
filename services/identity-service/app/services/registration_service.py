# services/registration_service.py – Worker registration business logic.

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.worker import Worker
from app.repositories.worker_repository import WorkerRepository
from shared.exceptions.base import ConflictError


class RegistrationService:
    """Orchestrates the worker registration flow."""

    def __init__(self, db: AsyncSession):
        self.repo = WorkerRepository(db)

    async def register(self, payload) -> Worker:
        """
        Register a new worker.
        Raises ConflictError if the phone number is already registered.
        """
        existing = await self.repo.get_by_phone(payload.phone_number)
        if existing:
            raise ConflictError("Phone number already registered")

        # Create a new worker record with pending KYC status
        worker = Worker(
            phone_number=payload.phone_number,
            full_name=payload.full_name,
            city=payload.city,
            primary_platform=payload.primary_platform,
        )
        return await self.repo.create(worker)
