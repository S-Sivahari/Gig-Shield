"""
claim_trigger_service.py — Auto-triggers claims when a disruption is detected.
Listens to DisruptionDetected events from intelligence-service via RabbitMQ.
For each affected zone: find active workers, check eligibility, create claim records.
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.policy.repositories.policy_repository import PolicyRepository
from app.modules.claims.models.claim import Claim
from app.modules.claims.repositories.claim_repository import ClaimRepository

class ClaimTriggerService:
    def __init__(self, db: AsyncSession):
        self.policy_repo = PolicyRepository(db)
        self.claim_repo  = ClaimRepository(db)

    async def trigger_for_disruption(self, disruption_id: UUID, zone_ids: list[UUID]) -> int:
        """
        Find all workers with active policies in affected zones and create claims.
        Returns the count of claims triggered.
        """
        triggered = 0
        # 1. Get all active policies in disruption zones
        policies = await self.policy_repo.get_active_in_zones(zone_ids)
        for policy in policies:
            # 2. Skip if worker already has a pending/approved claim for this disruption
            existing = await self.claim_repo.get_by_worker_and_disruption(policy.worker_id, disruption_id)
            if existing:
                continue
            # 3. Create a new auto-triggered claim
            claim = Claim(
                worker_id=policy.worker_id,
                policy_id=policy.id,
                disruption_id=disruption_id,
                trigger_type="auto",
                status="triggered",
            )
            await self.claim_repo.create(claim)
            triggered += 1
        return triggered
