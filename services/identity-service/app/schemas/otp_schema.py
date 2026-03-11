# schemas/otp_schema.py – Pydantic schemas for OTP endpoints.

from pydantic import BaseModel


class OtpSendRequest(BaseModel):
    """POST /api/v1/auth/otp/send"""
    phone_number: str


class OtpVerifyRequest(BaseModel):
    """POST /api/v1/auth/otp/verify"""
    phone_number: str
    otp: str           # 6-digit code sent to the mobile


class TokenResponse(BaseModel):
    """JWT tokens returned after successful OTP verification."""
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    worker_id:     str
