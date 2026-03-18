"""
router.py — Aggregates notification and analytics module routers.
Routes: /api/v1/notifications/..., /api/v1/analytics/...
"""
from importlib import import_module

from fastapi import APIRouter

api_router = APIRouter()


def include_optional_router(module_path: str) -> None:
	try:
		module = import_module(module_path)
		router = getattr(module, "router", None)
		if router is not None:
			api_router.include_router(router, prefix="/v1")
	except Exception:
		pass


include_optional_router("app.modules.notification.api.router")
include_optional_router("app.modules.analytics.api.router")
