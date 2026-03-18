"""
topics.py — RabbitMQ exchange/queue name constants.
Centralised here so renaming a topic updates all services at once.
"""

class Topics:
    # Auth
    WORKER_REGISTERED     = "worker.registered"
    WORKER_KYC_COMPLETED  = "worker.kyc_completed"

    # Policy
    POLICY_ISSUED         = "policy.issued"
    POLICY_LAPSED         = "policy.lapsed"
    POLICY_RENEWED        = "policy.renewed"
    POLICY_CANCELLED      = "policy.cancelled"

    # Disruptions
    DISRUPTION_DETECTED   = "disruption.detected"
    DISRUPTION_ESCALATED  = "disruption.escalated"
    DISRUPTION_RESOLVED   = "disruption.resolved"

    # Claims
    CLAIM_TRIGGERED       = "claim.triggered"
    CLAIM_APPROVED        = "claim.approved"
    CLAIM_REJECTED        = "claim.rejected"
    CLAIM_PAID            = "claim.paid"

    # Fraud
    FRAUD_ASSESSED        = "fraud.assessed"
    FRAUD_HIGH_RISK       = "fraud.high_risk_flagged"

    # Payouts
    PAYOUT_INITIATED      = "payout.initiated"
    PAYOUT_COMPLETED      = "payout.completed"
    PAYOUT_FAILED         = "payout.failed"

    # Notifications (internal)
    NOTIFICATION_SEND     = "notification.send"
