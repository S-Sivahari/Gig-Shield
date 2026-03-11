"""
registration.py — HTTP routes for worker registration and OTP flow.
All routes are unauthenticated (pre-login).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from services.shared.database.session import get_db
from services.shared.schemas.response import ApiResponse
from app.schemas.worker_schema import WorkerCreateSchema, WorkerResponseSchema
from app.services.registration_service import RegistrationService

router = APIRouter(prefix="/auth", tags=["Registration"])

@router.post("/register", response_model=ApiResponse[WorkerResponseSchema], status_code=201)
async def register_worker(payload: WorkerCreateSchema, db: AsyncSession = Depends(get_db)):
    """
    Register a new worker by phone number.
    Triggers an OTP SMS to verify ownership before creating the account.
    """
    svc    = RegistrationService(db)
    worker = await svc.register(payload)
    return ApiResponse(data=worker, message="Registration initiated. Check SMS for OTP.")

@router.post("/otp/verify")
async def verify_otp(phone: str, otp: str, db: AsyncSession = Depends(get_db)):
    """
    Verify the OTP. On success returns a JWT access + refresh token pair.
    The access token must be sent as `Authorization: Bearer <token>` on all subsequent requests.
    """
    svc    = RegistrationService(db)
    tokens = await svc.verify_and_issue_tokens(phone, otp)
    return ApiResponse(data=tokens, message="Login successful")
