"""
session.py — Async SQLAlchemy engine and session factory.
Each microservice imports `AsyncSessionLocal` for DB access
and `get_db` as a FastAPI dependency.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from ..config.settings import settings

# Create async engine (connection pool shared across requests)
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DEBUG,   # log SQL in dev mode
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,   # keep objects accessible after commit
)

class Base(DeclarativeBase):
    """All SQLAlchemy models inherit from this base."""
    pass

async def get_db():
    """FastAPI dependency — yields a DB session, always closes it after."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
