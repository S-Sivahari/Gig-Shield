"""
risk_scoring_service.py — Computes a worker risk score used to personalise premiums.
Risk factors: location zone history, claim frequency, platform, weather exposure.
Score range: 1 (very low risk) ? 5 (very high risk).
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.risk.repositories.risk_repository import RiskRepository
from app.modules.risk.ml.risk_model import RiskModel

class RiskScoringService:
    def __init__(self, db: AsyncSession):
        self.repo  = RiskRepository(db)
        self.model = RiskModel()
        self.model.load()

    async def score_worker(self, worker_id: UUID) -> float:
        """
        Build feature vector for the worker and run the risk model.
        Saves the result back to risk_profiles table.
        Returns risk score 1.0–5.0.
        """
        profile  = await self.repo.get_by_worker(worker_id)
        features = {
            "zone_disruption_count_90d": profile.zone_disruption_count if profile else 0,
            "claim_count_90d":           profile.claim_count if profile else 0,
            "platform_activity_ratio":   profile.activity_ratio if profile else 1.0,
        }
        score = self.model.predict(features)
        await self.repo.upsert_score(worker_id, score)
        return score
