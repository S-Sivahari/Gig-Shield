# schemas/worker_schema.py – Pydantic schemas for worker API request/response.

from pydantic import BaseModel, field_validator
from shared.utils.validators import validate_phone


class WorkerCreateRequest(BaseModel):
    """Payload for POST /api/v1/auth/register"""
    phone_number: str
    full_name:    str
    city:         str
    primary_platform: str   # e.g. "swiggy", "zomato", "uber"

    @field_validator("phone_number")
    @classmethod
    def phone_must_be_valid(cls, v: str) -> str:
        if not validate_phone(v):
            raise ValueError("Invalid Indian phone number")
        return v


class WorkerResponse(BaseModel):
    """Returned after registration or profile fetch."""
    id:           str
    phone_number: str
    full_name:    str
    kyc_status:   str
    city:         str

    model_config = {"from_attributes": True}   # Allow SQLAlchemy model → schema
