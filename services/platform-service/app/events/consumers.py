"""
consumers.py — Event handlers for platform-service.
The notification module is entirely event-driven:
all notification triggers arrive via RabbitMQ — no direct HTTP calls from other services.
"""
import json
from services.shared.messaging.consumer import EventConsumer
from services.shared.messaging.topics import Topics

async def handle_claim_approved(body: bytes):
    """Worker approved — send claim approved SMS + WhatsApp + push."""
    event = json.loads(body)
    from app.modules.notification.services.notification_service import NotificationService
    svc = NotificationService()
    await svc.send("claim_approved", event["worker_id"], {"amount": event["payout_amount"]})

async def handle_payout_completed(body: bytes):
    """Payout sent — notify worker with UTR number."""
    event = json.loads(body)
    from app.modules.notification.services.notification_service import NotificationService
    svc = NotificationService()
    await svc.send("payout_sent", event["worker_id"], {"utr": event.get("utr_number", "")})

async def handle_disruption_detected(body: bytes):
    """Disruption detected — alert workers in affected zones."""
    event = json.loads(body)
    print(f"[platform-service] Disruption {event['disruption_id']} — sending area alerts.")

# Registered at startup
claim_approved_consumer    = EventConsumer("platform-service", Topics.CLAIM_APPROVED)
payout_completed_consumer  = EventConsumer("platform-service", Topics.PAYOUT_COMPLETED)
disruption_consumer        = EventConsumer("platform-service", Topics.DISRUPTION_DETECTED)
