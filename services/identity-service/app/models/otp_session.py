# models/otp_session.py – Tracks active OTP sessions in the database.
# Redis is the primary store (TTL-driven); this table provides an audit trail.

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from shared.database.base_model import BaseModel


class OtpSession(BaseModel):
    """OTP session record – one row per send attempt."""
    __tablename__ = "otp_sessions"

    phone_number = Column(String(15), nullable=False, index=True)
    otp_hash     = Column(String(64), nullable=False)   # bcrypt hash, never plaintext
    is_verified  = Column(Boolean, default=False)
    expires_at   = Column(DateTime(timezone=True), nullable=False)
    attempts     = Column(String(1), default="0")       # Max 3 attempts before lockout
