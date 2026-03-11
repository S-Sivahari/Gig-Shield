# integrations/sms_provider.py – SMS client using MSG91.
# Used to send OTPs and notification messages to workers.

import httpx
from app.core.config import settings


class SmsProvider:
    """MSG91 SMS API wrapper."""

    MSG91_BASE = "https://api.msg91.com/api/v5"

    async def send_otp(self, phone: str, otp: str) -> bool:
        """
        Send an OTP SMS via MSG91.
        Returns True on success, False on failure.
        """
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{self.MSG91_BASE}/otp",
                json={
                    "mobile":    phone,
                    "authkey":   settings.msg91_auth_key,
                    "otp":       otp,
                    "sender":    settings.msg91_sender_id,
                    "template_id": "gigshield_otp",
                },
            )
        return resp.status_code == 200
