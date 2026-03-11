"""
router.py — Aggregates notification and analytics module routers.
Routes: /api/v1/notifications/..., /api/v1/analytics/...
"""
from fastapi import APIRouter
from app.modules.notification.api.router import router as notification_router
from app.modules.analytics.api.router    import router as analytics_router

api_router = APIRouter()
api_router.include_router(notification_router, prefix="/v1")
api_router.include_router(analytics_router,    prefix="/v1")
