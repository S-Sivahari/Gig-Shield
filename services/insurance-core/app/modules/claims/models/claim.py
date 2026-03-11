"""
claim.py — Claim SQLAlchemy model.
Claims can be auto-triggered (parametric) or manually filed by the worker.
Every claim goes through a multi-step validation pipeline before payout.
"""
from sqlalchemy import String, Numeric, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from services.shared.database.session import Base
from services.shared.database.base_model import BaseModel
import uuid

class Claim(Base, BaseModel):
    """
    Maps to `claims` table (schema/008_claims.sql).
    Status machine: triggered ? validating ? approved | rejected | manual_review ? paid
    """
    __tablename__ = "claims"

    worker_id:      Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    policy_id:      Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("policies.id"))
    disruption_id:  Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)  # null for manual claims
    trigger_type:   Mapped[str]       = mapped_column(String(20), default="auto")          # auto | manual
    status:         Mapped[str]       = mapped_column(String(25), default="triggered")
    payout_amount:  Mapped[float]     = mapped_column(Numeric(10, 2), nullable=True)       # set after validation
    fraud_score:    Mapped[float]     = mapped_column(Numeric(5, 4), nullable=True)        # 0.0 – 1.0
    is_flagged:     Mapped[bool]      = mapped_column(Boolean, default=False)
    rejection_reason: Mapped[str]     = mapped_column(Text, nullable=True)
