"""
events.py — Pydantic schemas for all domain events published over RabbitMQ.
Every service imports these to ensure a consistent event contract.
"""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class BaseEvent(BaseModel):
    event_id: UUID        # unique message id for deduplication
    timestamp: datetime   # UTC time the event was produced

# -- Auth events --
class WorkerRegistered(BaseEvent):
    worker_id: UUID
    phone: str

class WorkerKycCompleted(BaseEvent):
    worker_id: UUID
    status: str   # "verified" | "rejected"

# -- Policy events --
class PolicyIssued(BaseEvent):
    policy_id: UUID
    worker_id: UUID
    plan_type: str

class PolicyLapsed(BaseEvent):
    policy_id: UUID
    worker_id: UUID

# -- Disruption events --
class DisruptionDetected(BaseEvent):
    disruption_id: UUID
    disruption_type: str    # weather | aqi | civic
    affected_zone_ids: list[UUID]
    severity: str           # low | medium | high | critical

# -- Claim events --
class ClaimTriggered(BaseEvent):
    claim_id: UUID
    worker_id: UUID
    policy_id: UUID
    disruption_id: UUID

class ClaimApproved(BaseEvent):
    claim_id: UUID
    worker_id: UUID
    payout_amount: float

class ClaimRejected(BaseEvent):
    claim_id: UUID
    worker_id: UUID
    reason: str

# -- Payout events --
class PayoutCompleted(BaseEvent):
    payout_id: UUID
    worker_id: UUID
    amount: float
    utr_number: str          # Unique Transaction Reference from Razorpay

class PayoutFailed(BaseEvent):
    payout_id: UUID
    worker_id: UUID
    error: str
