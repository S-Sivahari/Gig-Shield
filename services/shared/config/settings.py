"""
settings.py — Centralised application configuration.
Reads all values from environment variables using Pydantic BaseSettings.
Import `settings` wherever config values are needed.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # -- Application --
    APP_NAME: str = "GigShield"
    APP_ENV: str = "development"          # development | staging | production
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # -- PostgreSQL --
    DATABASE_URL: str = "postgresql+asyncpg://gigshield:secret@localhost:5432/gigshield"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # -- Redis --
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_TTL_SECONDS: int = 3600         # default cache TTL (1 hour)

    # -- JWT --
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    # -- RabbitMQ / Messaging --
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()          # singleton — parsed once per process
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
