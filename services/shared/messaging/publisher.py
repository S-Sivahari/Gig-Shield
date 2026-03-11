"""
publisher.py — Async RabbitMQ event publisher with retry on transient failures.
Usage:
    await publisher.publish(Topics.CLAIM_TRIGGERED, ClaimTriggered(...))
"""
import json
import aio_pika
from ..config.settings import settings

class EventPublisher:
    def __init__(self):
        self._connection = None
        self._channel    = None

    async def connect(self):
        """Open connection and channel. Called in FastAPI lifespan startup."""
        self._connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        self._channel    = await self._connection.channel()

    async def publish(self, topic: str, event) -> None:
        """
        Publish a Pydantic event model as JSON to the given topic (routing key).
        Uses a 'topic' exchange named 'gigshield'.
        """
        exchange = await self._channel.declare_exchange("gigshield", aio_pika.ExchangeType.TOPIC)
        body     = event.model_dump_json().encode()
        message  = aio_pika.Message(body=body, content_type="application/json")
        await exchange.publish(message, routing_key=topic)

    async def close(self):
        """Gracefully close. Called in FastAPI lifespan shutdown."""
        if self._connection:
            await self._connection.close()

publisher = EventPublisher()   # module-level singleton
