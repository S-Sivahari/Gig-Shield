"""
health_check.py — Liveness and readiness endpoints reused by every service.
Mount these under /health in each FastAPI app.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.session import get_db
from ..database.redis_client import get_redis
import redis.asyncio as aioredis

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/live")
async def liveness():
    """Liveness probe — Kubernetes restarts the pod if this fails."""
    return {"status": "alive"}

@router.get("/ready")
async def readiness(db: AsyncSession = Depends(get_db), redis: aioredis.Redis = Depends(get_redis)):
    """
    Readiness probe — checks DB and Redis reachability.
    Kubernetes removes the pod from the load balancer if this fails.
    """
    checks = {}
    try:
        await db.execute("SELECT 1")   # lightweight DB ping
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    try:
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ready" if all_ok else "degraded", "checks": checks}
