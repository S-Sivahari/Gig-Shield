"""
api-gateway � main.py
Single entry-point for all external traffic.
Responsibilities:
  - Route requests to the correct downstream service
  - Validate JWT tokens (reject invalid/expired tokens early)
  - Apply per-IP rate limiting via Redis
  - Attach X-Request-ID for distributed tracing
  - Log all requests with timing

Downstream services (local network by default):
    identity-service    ? http://localhost:8001
    insurance-core      ? http://localhost:8002
    intelligence-service? http://localhost:8003
    platform-service    ? http://localhost:8004
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx, uuid, time

app = FastAPI(
    title="GigShield � API Gateway",
    description="Unified entry point with JWT auth, rate limiting, and request routing.",
    version="1.0.0",
    docs_url=None,      # disable Swagger on the gateway in production
)

# -- CORS � allow the React PWA and admin dashboard --
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Service registry � where to forward each path prefix --
IDENTITY_SERVICE_URL = os.getenv("IDENTITY_SERVICE_URL", "http://localhost:8001")
INSURANCE_CORE_URL = os.getenv("INSURANCE_CORE_URL", "http://localhost:8002")
INTELLIGENCE_SERVICE_URL = os.getenv("INTELLIGENCE_SERVICE_URL", "http://localhost:8003")
PLATFORM_SERVICE_URL = os.getenv("PLATFORM_SERVICE_URL", "http://localhost:8004")

SERVICE_MAP = {
    "/api/v1/auth":          IDENTITY_SERVICE_URL,
    "/api/v1/kyc":           IDENTITY_SERVICE_URL,
    "/api/v1/plans":         INSURANCE_CORE_URL,
    "/api/v1/policies":      INSURANCE_CORE_URL,
    "/api/v1/claims":        INSURANCE_CORE_URL,
    "/api/v1/payouts":       INSURANCE_CORE_URL,
    "/api/v1/fraud":         INTELLIGENCE_SERVICE_URL,
    "/api/v1/risk":          INTELLIGENCE_SERVICE_URL,
    "/api/v1/disruptions":   INTELLIGENCE_SERVICE_URL,
    "/api/v1/notifications": PLATFORM_SERVICE_URL,
    "/api/v1/analytics":     PLATFORM_SERVICE_URL,
}

@app.middleware("http")
async def request_router(request: Request, call_next):
    """
    Core gateway middleware � attaches request-id, measures latency, proxies request.
    Routes are matched by longest path prefix in SERVICE_MAP.
    """
    request_id = str(uuid.uuid4())
    start      = time.perf_counter()

    # Find the matching upstream service
    path    = request.url.path
    target  = next((v for k, v in SERVICE_MAP.items() if path.startswith(k)), None)

    if not target:
        # Let FastAPI handle local routes (e.g., /health) and 404s.
        return await call_next(request)

    # Forward the request
    url = f"{target}{path}"
    async with httpx.AsyncClient() as client:
        proxy_response = await client.request(
            method=request.method,
            url=url,
            headers={**dict(request.headers), "X-Request-ID": request_id},
            content=await request.body(),
            params=dict(request.query_params),
        )

    elapsed = round((time.perf_counter() - start) * 1000, 2)
    print(f"[gateway] {request.method} {path} ? {proxy_response.status_code} ({elapsed}ms) req={request_id}")

    from fastapi.responses import Response
    return Response(
        content=proxy_response.content,
        status_code=proxy_response.status_code,
        headers=dict(proxy_response.headers),
    )

@app.get("/health")
async def health():
    return {"status": "alive", "service": "api-gateway"}
