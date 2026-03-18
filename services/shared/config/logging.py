"""
logging.py — Structured JSON logging configuration.
Uses structlog for machine-readable logs (friendly with Loki + Grafana).
"""
import logging
import structlog
from .settings import settings

def configure_logging() -> None:
    """Call once at application startup (inside FastAPI lifespan)."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(level=level, format="%(message)s")

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,  # adds request_id etc.
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),      # output as JSON
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Usage: log = structlog.get_logger(__name__)
#        log.info("claim_triggered", claim_id=str(claim_id), worker_id=str(worker_id))
