"""
router.py — Aggregates all module routers into one API surface.
Each module (policy / claims / payout) registers under its own prefix
so routes stay clearly separated: /api/v1/policies, /api/v1/claims, etc.
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


include_optional_router("app.modules.policy.api.router")
include_optional_router("app.modules.claims.api.router")
include_optional_router("app.modules.payout.api.router")
