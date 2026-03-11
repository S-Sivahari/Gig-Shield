"""
redis_client.py — Async Redis connection with connection pooling.
Used for: OTP storage, rate-limit counters, caching, session tokens.
"""
import redis.asyncio as aioredis
from ..config.settings import settings

# Module-level pool — shared across all requests in the process
_redis_pool: aioredis.Redis | None = None

async def get_redis() -> aioredis.Redis:
    """FastAPI dependency — returns the shared Redis client."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,    # return str instead of bytes
        )
    return _redis_pool

async def close_redis():
    """Call during application shutdown to cleanly close connections."""
    global _redis_pool
    if _redis_pool:
        await _redis_pool.aclose()
        _redis_pool = None
