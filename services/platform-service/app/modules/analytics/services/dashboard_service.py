"""
dashboard_service.py — Real-time KPI aggregation for the admin dashboard.
Queries are read-only and cached in Redis with a 5-minute TTL to reduce DB load.
"""
import json
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as aioredis

CACHE_TTL = 300   # 5 minutes

class DashboardService:
    def __init__(self, db: AsyncSession, redis: aioredis.Redis):
        self.db    = db
        self.redis = redis

    async def get_kpis(self) -> dict:
        """
        Return live KPI snapshot. Served from Redis cache; refreshed on miss.
        KPIs: total_workers, active_policies, claims_today, payouts_today, loss_ratio
        """
        cached = await self.redis.get("dashboard:kpis")
        if cached:
            return json.loads(cached)

        # -- Live DB aggregation --
        result = await self.db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM workers WHERE is_active = TRUE)         AS total_workers,
                (SELECT COUNT(*) FROM policies WHERE status = 'active')       AS active_policies,
                (SELECT COUNT(*) FROM claims   WHERE DATE(created_at) = CURRENT_DATE) AS claims_today,
                (SELECT COALESCE(SUM(amount), 0) FROM payouts
                    WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE)   AS payouts_today
        """))
        row  = result.mappings().one()
        kpis = dict(row)

        await self.redis.setex("dashboard:kpis", CACHE_TTL, json.dumps(kpis))
        return kpis
