"""
worker.py — Worker SQLAlchemy model.
Represents a gig worker registered on the GigShield platform.
"""
from sqlalchemy import String, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from services.shared.database.session import Base
from services.shared.database.base_model import BaseModel

class Worker(Base, BaseModel):
    """
    Maps to the `workers` table created by schema/004_user_identity.sql.
    PII fields (aadhaar_number, pan_number) must be AES-encrypted at rest.
    """
    __tablename__ = "workers"

    phone: Mapped[str]        = mapped_column(String(15), unique=True, nullable=False, index=True)
    full_name: Mapped[str]    = mapped_column(String(100), nullable=True)
    email: Mapped[str]        = mapped_column(String(255), unique=True, nullable=True)
    aadhaar_number: Mapped[str] = mapped_column(String(255), nullable=True)   # encrypted
    pan_number: Mapped[str]   = mapped_column(String(255), nullable=True)     # encrypted
    kyc_status: Mapped[str]   = mapped_column(String(20), default="pending")  # pending|verified|rejected
    is_active: Mapped[bool]   = mapped_column(Boolean, default=True)
    preferred_language: Mapped[str] = mapped_column(String(5), default="en")  # en|hi|ta|te|kn|bn
    city: Mapped[str]         = mapped_column(String(100), nullable=True)
    platform: Mapped[str]     = mapped_column(String(50), nullable=True)      # swiggy|zomato|uber|ola

    def __repr__(self) -> str:
        return f"<Worker phone={self.phone} kyc={self.kyc_status}>"
