"""
identity-service — main.py
Handles worker identity: registration, OTP auth, KYC, and bank verification.
Exposed on port 8001 via the API Gateway.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.router import api_router
from app.core.config import settings
from app.core.events import startup_event, shutdown_event

@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_event()   # connect DB, Redis, RabbitMQ
    yield
    await shutdown_event()  # graceful shutdown

app = FastAPI(
    title="GigShield — Identity Service",
    description="Worker registration, OTP authentication, KYC & bank verification.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI accessible in dev
    redoc_url="/redoc",
)

# Mount all v1 routes (registration, otp, kyc, bank_verification, documents)
app.include_router(api_router, prefix="/api")
