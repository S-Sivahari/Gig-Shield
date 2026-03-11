# middleware/error_handler.py
# Global exception handler – converts all unhandled exceptions to JSON responses.
# Registered in main.py of each microservice via app.add_exception_handler().

from fastapi import Request
from fastapi.responses import JSONResponse
from shared.exceptions.base import AppError
import logging

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler – prevents stack traces leaking to API consumers."""

    # Our own typed errors – return structured response
    if isinstance(exc, AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.error_code, "message": exc.message},
        )

    # Unexpected errors – log full traceback, return generic 500
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"error": "INTERNAL_SERVER_ERROR", "message": "Something went wrong"},
    )
