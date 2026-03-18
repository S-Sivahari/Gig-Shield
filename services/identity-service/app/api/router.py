"""
app/api/router.py - Top-level API router for identity-service.
Mounts v1 routes under /api/v1.
"""

from fastapi import APIRouter

api_router = APIRouter()

try:
	from app.api.v1.router import api_router as v1_router
	api_router.include_router(v1_router, prefix="/v1")
except Exception:
	# Keep service bootable even if v1 modules are incomplete.
	pass

