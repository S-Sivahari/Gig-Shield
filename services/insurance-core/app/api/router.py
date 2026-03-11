"""
router.py — Aggregates all module routers into one API surface.
Each module (policy / claims / payout) registers under its own prefix
so routes stay clearly separated: /api/v1/policies, /api/v1/claims, etc.
"""
from fastapi import APIRouter
from app.modules.policy.api.router  import router as policy_router
from app.modules.claims.api.router  import router as claims_router
from app.modules.payout.api.router  import router as payout_router

api_router = APIRouter()
api_router.include_router(policy_router,  prefix="/v1")
api_router.include_router(claims_router,  prefix="/v1")
api_router.include_router(payout_router,  prefix="/v1")
