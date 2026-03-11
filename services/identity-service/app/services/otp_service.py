"""
otp_service.py — Generate, store, send, and verify OTPs.
OTPs are stored in Redis with a TTL so they auto-expire.
"""
import random
import redis.asyncio as aioredis
from app.core.config import settings
from app.integrations.sms_provider import SMSProvider

OTP_PREFIX = "otp:"   # Redis key prefix: otp:<phone>

class OTPService:
    def __init__(self, redis: aioredis.Redis, sms: SMSProvider):
        self.redis = redis
        self.sms   = sms

    def _generate_otp(self) -> str:
        """Return a zero-padded N-digit OTP string."""
        return str(random.randint(0, 10**settings.OTP_LENGTH - 1)).zfill(settings.OTP_LENGTH)

    async def send_otp(self, phone: str) -> bool:
        """Generate OTP, persist to Redis with TTL, dispatch SMS. Returns True on success."""
        otp = self._generate_otp()
        await self.redis.setex(f"{OTP_PREFIX}{phone}", settings.OTP_TTL_SECONDS, otp)
        return await self.sms.send(phone, f"Your GigShield OTP is {otp}. Valid for 5 minutes.")

    async def verify_otp(self, phone: str, otp: str) -> bool:
        """Compare submitted OTP with stored value. Deletes key after first use."""
        stored = await self.redis.get(f"{OTP_PREFIX}{phone}")
        if stored and stored == otp:
            await self.redis.delete(f"{OTP_PREFIX}{phone}")   # single-use
            return True
        return False
