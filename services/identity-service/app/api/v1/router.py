# app/api/v1/router.py – Aggregates all v1 routes for the auth service.

from fastapi import APIRouter
from app.api.v1.endpoints import registration, otp, kyc, bank_verification, documents

api_router = APIRouter()

# POST /api/v1/auth/register, /login
api_router.include_router(registration.router,      prefix="/auth",  tags=["Auth"])

# POST /api/v1/auth/otp/send, /otp/verify
api_router.include_router(otp.router,               prefix="/auth",  tags=["OTP"])

# POST/GET /api/v1/kyc/*
api_router.include_router(kyc.router,               prefix="/kyc",   tags=["KYC"])

# POST /api/v1/kyc/bank
api_router.include_router(bank_verification.router, prefix="/kyc",   tags=["Bank"])

# POST/GET /api/v1/kyc/documents
api_router.include_router(documents.router,         prefix="/kyc",   tags=["Documents"])
