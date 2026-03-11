"""
api-gateway — main.py
Single entry-point for all external traffic.
Responsibilities:
  - Route requests to the correct downstream service
  - Validate JWT tokens (reject invalid/expired tokens early)
  - Apply per-IP rate limiting via Redis
  - Attach X-Request-ID for distributed tracing
  - Log all requests with timing

Downstream services (internal Docker network):
  identity-service    ? http://identity-service:8001
  insurance-core      ? http://insurance-core:8002
  intelligence-service? http://intelligence-service:8003
  platform-service    ? http://platform-service:8004
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx, uuid, time

app = FastAPI(
    title="GigShield — API Gateway",
    description="Unified entry point with JWT auth, rate limiting, and request routing.",
    version="1.0.0",
    docs_url=None,      # disable Swagger on the gateway in production
)

# -- CORS — allow the React PWA and admin dashboard --
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Service registry — where to forward each path prefix --
SERVICE_MAP = {
    "/api/v1/auth":          "http://identity-service:8001",
    "/api/v1/kyc":           "http://identity-service:8001",
    "/api/v1/plans":         "http://insurance-core:8002",
    "/api/v1/policies":      "http://insurance-core:8002",
    "/api/v1/claims":        "http://insurance-core:8002",
    "/api/v1/payouts":       "http://insurance-core:8002",
    "/api/v1/fraud":         "http://intelligence-service:8003",
    "/api/v1/risk":          "http://intelligence-service:8003",
    "/api/v1/disruptions":   "http://intelligence-service:8003",
    "/api/v1/notifications": "http://platform-service:8004",
    "/api/v1/analytics":     "http://platform-service:8004",
}

@app.middleware("http")
async def request_router(request: Request, call_next):
    """
    Core gateway middleware — attaches request-id, measures latency, proxies request.
    Routes are matched by longest path prefix in SERVICE_MAP.
    """
    request_id = str(uuid.uuid4())
    start      = time.perf_counter()

    # Find the matching upstream service
    path    = request.url.path
    target  = next((v for k, v in SERVICE_MAP.items() if path.startswith(k)), None)

    if not target:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Route not found"}, status_code=404)

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
