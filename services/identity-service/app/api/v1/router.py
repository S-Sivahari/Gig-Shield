# app/api/v1/router.py - Aggregates all v1 routes for identity-service.

from importlib import import_module

from fastapi import APIRouter

api_router = APIRouter()


def include_optional_router(module_path: str) -> None:
	"""Include module.router when available; skip incomplete modules."""
	try:
		module = import_module(module_path)
		router = getattr(module, "router", None)
		if router is not None:
			api_router.include_router(router)
	except Exception:
		pass


include_optional_router("app.api.v1.registration")
include_optional_router("app.api.v1.otp")
include_optional_router("app.api.v1.login")
include_optional_router("app.api.v1.kyc")
include_optional_router("app.api.v1.bank_verification")
include_optional_router("app.api.v1.documents")
