"""
consumers.py — RabbitMQ event consumers for insurance-core.
Listens for events from other services and triggers appropriate business logic.
"""
import json
from services.shared.messaging.consumer import EventConsumer
from services.shared.messaging.topics import Topics

async def handle_disruption_detected(body: bytes):
    """
    Triggered when intelligence-service publishes a DisruptionDetected event.
    Starts the parametric claim auto-trigger workflow.
    """
    event = json.loads(body)
    from app.modules.claims.services.claim_trigger_service import ClaimTriggerService
    # Note: DB session injected by the task handler context
    # trigger_service.trigger_for_disruption(event["disruption_id"], event["affected_zone_ids"])
    print(f"[insurance-core] DisruptionDetected received: {event['disruption_id']}")

async def handle_worker_kyc_completed(body: bytes):
    """
    Triggered when identity-service completes KYC.
    Initialises the worker risk profile for premium calculation.
    """
    event = json.loads(body)
    print(f"[insurance-core] KYC completed for worker: {event['worker_id']}")

# Register consumers at startup (called in core/events.py)
disruption_consumer = EventConsumer("insurance-core", Topics.DISRUPTION_DETECTED)
kyc_consumer        = EventConsumer("insurance-core", Topics.WORKER_KYC_COMPLETED)
