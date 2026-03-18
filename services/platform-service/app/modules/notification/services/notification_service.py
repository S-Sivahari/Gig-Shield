"""
notification_service.py — Route notifications to the right channel(s).
Decides whether to send SMS, WhatsApp, push or email based on:
  - notification type (otp ? SMS only; claim_approved ? WA + push + SMS)
  - worker preferences
  - channel availability
"""
from app.modules.notification.services.sms_service       import SMSService
from app.modules.notification.services.whatsapp_service  import WhatsAppService
from app.modules.notification.services.push_service      import PushService
from app.modules.notification.services.template_service  import TemplateService

# Which channels to use per notification type
CHANNEL_MAP = {
    "otp":              ["sms"],
    "claim_triggered":  ["sms", "push"],
    "claim_approved":   ["sms", "whatsapp", "push"],
    "payout_sent":      ["sms", "whatsapp", "push"],
    "disruption_alert": ["push", "whatsapp"],
    "kyc_verified":     ["sms"],
    "policy_issued":    ["whatsapp", "sms"],
}

class NotificationService:
    def __init__(self):
        self.sms       = SMSService()
        self.whatsapp  = WhatsAppService()
        self.push      = PushService()
        self.templates = TemplateService()

    async def send(self, notification_type: str, worker_id: str, context: dict, language: str = "en"):
        """
        Send a notification via all mapped channels.
        `context` provides template variables: {worker_name, amount, etc.}
        """
        channels = CHANNEL_MAP.get(notification_type, ["sms"])
        rendered = self.templates.render(notification_type, language, context)

        for channel in channels:
            if channel == "sms":
                await self.sms.send(worker_id, rendered["sms"])
            elif channel == "whatsapp":
                await self.whatsapp.send(worker_id, rendered["whatsapp"])
            elif channel == "push":
                await self.push.send(worker_id, rendered["push_title"], rendered["push_body"])
