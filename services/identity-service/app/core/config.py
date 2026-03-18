"""
config.py — identity-service specific settings.
Extends the shared Settings with service-local overrides.
"""
from services.shared.config.settings import Settings

class IdentitySettings(Settings):
    SERVICE_NAME: str = "identity-service"
    SERVICE_PORT: int = 8001

    # OTP config
    OTP_LENGTH: int = 6
    OTP_TTL_SECONDS: int = 300   # 5 minutes

    # S3 — KYC document storage
    S3_BUCKET_KYC: str = "gigshield-kyc-docs"
    S3_REGION: str = "ap-south-1"

    # External API keys
    AADHAAR_API_URL: str = "https://mock-aadhaar.local/api"
    PENNY_DROP_API_URL: str = "https://mock-pennydrop.local/api"
    MSG91_API_KEY: str = ""

settings = IdentitySettings()
