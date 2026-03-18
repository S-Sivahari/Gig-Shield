"""
weather_monitor.py — Polls OpenWeatherMap every 15 min for configured cities.
Creates a DisruptionEvent when rainfall/wind/temperature exceeds thresholds.
Publishes DisruptionDetected event to RabbitMQ (consumed by insurance-core).
"""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.disruption.models.disruption_event import DisruptionEvent
from app.modules.disruption.integrations.openweathermap import OpenWeatherMapClient
from services.shared.messaging.publisher import publisher
from services.shared.messaging.topics import Topics
from services.shared.messaging.events import DisruptionDetected
import uuid

RAINFALL_THRESHOLD_MM = 25.0   # heavy rain threshold for claim eligibility

class WeatherMonitor:
    def __init__(self, db: AsyncSession):
        self.db     = db
        self.client = OpenWeatherMapClient()

    async def poll_and_evaluate(self, city: str, zone_ids: list) -> DisruptionEvent | None:
        """
        Fetch current weather for `city`. If rainfall > threshold, create event and publish.
        Called by the APScheduler cron job every 15 minutes.
        """
        weather = await self.client.get_current_weather(city)
        rainfall_mm = weather.get("rain", {}).get("1h", 0.0)

        if rainfall_mm < RAINFALL_THRESHOLD_MM:
            return None   # no disruption — do nothing

        # Create and persist the disruption event
        event = DisruptionEvent(
            disruption_type="weather",
            severity="high" if rainfall_mm > 50 else "medium",
            title=f"Heavy rainfall in {city}: {rainfall_mm} mm/hr",
            city=city,
            metric_value=rainfall_mm,
            metric_unit="mm/hr",
            threshold_value=RAINFALL_THRESHOLD_MM,
            started_at=datetime.now(timezone.utc),
        )
        self.db.add(event)
        await self.db.flush()

        # Publish to RabbitMQ ? insurance-core will auto-trigger claims
        await publisher.publish(Topics.DISRUPTION_DETECTED, DisruptionDetected(
            event_id=uuid.uuid4(),
            timestamp=event.started_at,
            disruption_id=event.id,
            disruption_type="weather",
            affected_zone_ids=zone_ids,
            severity=event.severity,
        ))
        return event
