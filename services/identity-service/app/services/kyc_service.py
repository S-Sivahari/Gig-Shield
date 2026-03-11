# services/kyc_service.py – Aadhaar KYC orchestration.

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.worker_repository import WorkerRepository
from app.integrations.aadhaar_gateway import AadhaarGatewayClient
from shared.utils.validators import validate_aadhaar
from shared.exceptions.base import ValidationError


class KycService:
    """Orchestrates KYC: validates input → calls Aadhaar gateway → updates status."""

    def __init__(self, db: AsyncSession):
        self.worker_repo = WorkerRepository(db)
        self.aadhaar     = AadhaarGatewayClient()

    async def initiate_aadhaar_kyc(self, worker_id: str, aadhaar_number: str) -> dict:
        """Submit Aadhaar for verification. Returns gateway reference ID."""
        if not validate_aadhaar(aadhaar_number):
            raise ValidationError("Invalid Aadhaar number format")

        # Call external Aadhaar gateway (mocked in dev)
        result = await self.aadhaar.verify(aadhaar_number)

        # Update worker KYC status based on gateway response
        worker = await self.worker_repo.get_by_id(worker_id)
        worker.kyc_status = "verified" if result.get("verified") else "rejected"
        worker.aadhaar_number = aadhaar_number    # Store encrypted

        return {"reference_id": result.get("reference_id"), "status": worker.kyc_status}

    async def get_kyc_status(self, worker_id: str) -> dict:
        worker = await self.worker_repo.get_by_id(worker_id)
        return {"kyc_status": worker.kyc_status, "worker_id": worker_id}
