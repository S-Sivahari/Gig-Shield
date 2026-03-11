"""
constants.py — App-wide constant values shared across all microservices.
Use these instead of hard-coding strings in business logic.
"""

# -- Policy Plan Types --
class PlanType:
    BASIC   = "basic"      # ?99 / month
    SILVER  = "silver"     # ?199 / month
    GOLD    = "gold"       # ?399 / month

# -- Claim Statuses (state machine) --
class ClaimStatus:
    TRIGGERED        = "triggered"
    VALIDATING       = "validating"
    APPROVED         = "approved"
    REJECTED         = "rejected"
    PAID             = "paid"
    MANUAL_REVIEW    = "manual_review"
    EXPIRED          = "expired"

# -- Payout Statuses --
class PayoutStatus:
    PENDING    = "pending"
    PROCESSING = "processing"
    COMPLETED  = "completed"
    FAILED     = "failed"

# -- KYC Statuses --
class KycStatus:
    PENDING   = "pending"
    VERIFIED  = "verified"
    REJECTED  = "rejected"

# -- Disruption Types --
class DisruptionType:
    WEATHER   = "weather"
    AQI       = "aqi"
    CIVIC     = "civic"
    PLATFORM  = "platform_drop"

# -- Notification Channels --
class NotificationChannel:
    SMS       = "sms"
    WHATSAPP  = "whatsapp"
    PUSH      = "push"
    EMAIL     = "email"

# -- Pagination --
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE     = 100
