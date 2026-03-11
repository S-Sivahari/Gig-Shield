"""
policy.py — Policy SQLAlchemy model.
One active policy per worker at a time. Tracks plan, status, and coverage period.
"""
from datetime import date
from sqlalchemy import String, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from services.shared.database.session import Base
from services.shared.database.base_model import BaseModel
import uuid

class Policy(Base, BaseModel):
    """
    Maps to `policies` table (schema/006_policies.sql).
    Status flow: active ? lapsed | renewed | cancelled
    """
    __tablename__ = "policies"

    worker_id:   Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    plan_id:     Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plan_configs.id"))
    status:      Mapped[str]       = mapped_column(String(20), default="active")  # active|lapsed|cancelled|renewed
    plan_type:   Mapped[str]       = mapped_column(String(20), nullable=False)    # basic|silver|gold
    start_date:  Mapped[date]      = mapped_column(Date, nullable=False)
    end_date:    Mapped[date]      = mapped_column(Date, nullable=False)
    premium_amount: Mapped[float]  = mapped_column(Numeric(10, 2), nullable=False)
    sum_insured:    Mapped[float]  = mapped_column(Numeric(10, 2), nullable=False)
    risk_multiplier: Mapped[float] = mapped_column(Numeric(4, 3), default=1.0)   # from risk-engine
