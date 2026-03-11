"""
router.py — Aggregates fraud, risk, and disruption module routers.
Routes: /api/v1/fraud/..., /api/v1/risk/..., /api/v1/disruptions/...
"""
from fastapi import APIRouter
from app.modules.fraud.api.router      import router as fraud_router
from app.modules.risk.api.router       import router as risk_router
from app.modules.disruption.api.router import router as disruption_router

api_router = APIRouter()
api_router.include_router(fraud_router,      prefix="/v1")
api_router.include_router(risk_router,       prefix="/v1")
api_router.include_router(disruption_router, prefix="/v1")
