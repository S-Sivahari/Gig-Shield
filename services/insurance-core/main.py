"""
insurance-core — main.py
Handles all insurance operations in one deployment unit.
Modules: policy (plans/renewal/mandates), claims (auto-trigger/validation), payout (Razorpay/ledger)
Exposed on port 8002 via the API Gateway.
"""
from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI

try:
    from app.api.router import api_router
except Exception:
    api_router = APIRouter()

try:
    from app.core.events import startup_event, shutdown_event
except Exception:
    async def startup_event():
        return None

    async def shutdown_event():
        return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_event()
    yield
    await shutdown_event()

app = FastAPI(
    title="GigShield — Insurance Core",
    description="Policy management, claims lifecycle, and payout processing.",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(api_router, prefix="/api")
