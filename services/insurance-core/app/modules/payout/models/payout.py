"""
payout.py — Payout SQLAlchemy model.
One payout record per approved claim. Processed via Razorpay Payout API.
"""
from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from services.shared.database.session import Base
from services.shared.database.base_model import BaseModel
import uuid

class Payout(Base, BaseModel):
    """
    Maps to `payouts` table (schema/010_payouts.sql).
    Status: pending ? processing ? completed | failed
    UTR number is filled once Razorpay confirms the bank transfer.
    """
    __tablename__ = "payouts"

    claim_id:       Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("claims.id"), unique=True)
    worker_id:      Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    amount:         Mapped[float]     = mapped_column(Numeric(10, 2), nullable=False)
    status:         Mapped[str]       = mapped_column(String(20), default="pending")
    razorpay_payout_id: Mapped[str]   = mapped_column(String(100), nullable=True)  # RPY reference
    utr_number:     Mapped[str]       = mapped_column(String(50),  nullable=True)   # bank UTR
    failure_reason: Mapped[str]       = mapped_column(String(255), nullable=True)
    retry_count:    Mapped[int]       = mapped_column(default=0)
