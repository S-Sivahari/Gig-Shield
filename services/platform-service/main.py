"""
platform-service — main.py
Cross-cutting platform capabilities: notifications (SMS/WA/push/email) + analytics (KPIs/reports).
Modules: notification (channel routing, templates), analytics (dashboards, zone heatmaps, reports)
Exposed on port 8004 via the API Gateway.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.events import startup_event, shutdown_event
    await startup_event()   # start analytics aggregation scheduler
    yield
    await shutdown_event()

app = FastAPI(
    title="GigShield — Platform Service",
    description="Multi-channel notifications and analytics dashboards.",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(api_router, prefix="/api")
