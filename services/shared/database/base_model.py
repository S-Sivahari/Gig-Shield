"""
base_model.py — Mixin that auto-adds id, created_at, updated_at to every table.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

class TimestampMixin:
    """Adds created_at and updated_at columns automatically updated by DB triggers."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

class UUIDMixin:
    """Adds a UUID primary key (stored as PostgreSQL UUID type)."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

class BaseModel(UUIDMixin, TimestampMixin):
    """Combine both mixins — use on all domain models."""
    pass
