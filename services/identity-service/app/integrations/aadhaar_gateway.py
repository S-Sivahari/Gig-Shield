# integrations/aadhaar_gateway.py – Client for the Aadhaar eKYC gateway.
# In development, this calls the mock service at mocks/aadhaar-api.

import httpx
from app.core.config import settings


class AadhaarGatewayClient:
    """HTTP client wrapping the Aadhaar verification API."""

    def __init__(self):
        self.base_url = settings.aadhaar_api_url
        self.api_key  = settings.aadhaar_api_key

    async def verify(self, aadhaar_number: str) -> dict:
        """
        Verify an Aadhaar number against the gateway.
        Returns: { "verified": True/False, "reference_id": "..." }
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{self.base_url}/verify",
                json={"aadhaar": aadhaar_number},
                headers={"X-API-Key": self.api_key},
            )
            response.raise_for_status()
            return response.json()
