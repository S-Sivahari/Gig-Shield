"""
disruption_event.py — Disruption event model.
Created when weather/AQI/civic API data crosses a configured threshold.
Publishing this event to RabbitMQ starts the parametric claims pipeline.
"""
from sqlalchemy import String, Float, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from services.shared.database.session import Base
from services.shared.database.base_model import BaseModel
from datetime import datetime

class DisruptionEvent(Base, BaseModel):
    """
    Maps to `disruption_events` table (schema/007_disruption_events.sql).
    severity: low | medium | high | critical
    status:   active | resolved
    """
    __tablename__ = "disruption_events"

    disruption_type: Mapped[str]   = mapped_column(String(30), nullable=False)    # weather|aqi|civic|platform_drop
    severity:        Mapped[str]   = mapped_column(String(20), default="medium")
    status:          Mapped[str]   = mapped_column(String(20), default="active")
    title:           Mapped[str]   = mapped_column(String(255), nullable=False)
    description:     Mapped[str]   = mapped_column(Text, nullable=True)
    city:            Mapped[str]   = mapped_column(String(100), nullable=True)
    metric_value:    Mapped[float] = mapped_column(Float, nullable=True)   # actual reading (e.g. mm of rain)
    metric_unit:     Mapped[str]   = mapped_column(String(30), nullable=True)   # mm | AQI | etc.
    threshold_value: Mapped[float] = mapped_column(Float, nullable=True)   # the configured trigger threshold
    started_at:      Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
