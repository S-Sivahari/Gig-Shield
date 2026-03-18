"""
intelligence-service — main.py
AI/ML and real-time monitoring service.
Modules: fraud (Isolation Forest), risk (risk scoring + premium calc), disruption (weather/AQI/civic monitoring)
Exposed on port 8003 via the API Gateway.
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
    await startup_event()   # start disruption polling schedulers
    yield
    await shutdown_event()

app = FastAPI(
    title="GigShield — Intelligence Service",
    description="Fraud detection, risk scoring, and real-time disruption monitoring.",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(api_router, prefix="/api")
