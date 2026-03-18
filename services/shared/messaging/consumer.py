"""
consumer.py — RabbitMQ event consumer with dead-letter queue support.
Usage:
    consumer = EventConsumer("claims-service", Topics.DISRUPTION_DETECTED)
    await consumer.consume(handle_disruption)
"""
import aio_pika
from typing import Callable, Awaitable
from ..config.settings import settings

class EventConsumer:
    def __init__(self, service_name: str, topic: str):
        self.queue_name = f"{service_name}.{topic}"
        self.topic      = topic

    async def consume(self, handler: Callable[[bytes], Awaitable[None]]):
        """
        Subscribe to a topic and call `handler` for each message.
        Messages that raise an exception are routed to the dead-letter queue.
        """
        connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        channel    = await connection.channel()
        await channel.set_qos(prefetch_count=10)   # process 10 at a time

        exchange   = await channel.declare_exchange("gigshield", aio_pika.ExchangeType.TOPIC)
        queue      = await channel.declare_queue(self.queue_name, durable=True)
        await queue.bind(exchange, routing_key=self.topic)

        async with queue.iterator() as q:
            async for message in q:
                async with message.process(requeue=False):
                    await handler(message.body)
