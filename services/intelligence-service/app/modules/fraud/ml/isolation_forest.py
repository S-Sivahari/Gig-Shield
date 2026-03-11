"""
isolation_forest.py — Isolation Forest wrapper for fraud scoring.
Isolation Forest is unsupervised — it detects anomalies without labelled fraud data,
making it ideal for the early-stage GigShield launch with limited historical data.

Score interpretation:
    > 0.7  ? high fraud risk (flag for manual review)
    0.4–0.7 ? moderate (proceed with extra checks)
    < 0.4  ? low risk (auto-approve)
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from app.modules.fraud.ml.model_registry import ModelRegistry

class FraudIsolationForest:
    def __init__(self):
        self.model    = None
        self.registry = ModelRegistry()

    def load(self):
        """Load the latest trained model from disk. Call once at service startup."""
        self.model = self.registry.load_latest("fraud_isolation_forest")

    def score(self, features: dict) -> float:
        """
        Compute a fraud probability score 0.0–1.0 from a feature dict.
        Higher = more likely fraudulent.
        Features: claim_frequency_7d, gps_accuracy, activity_drop_pct, claim_hour, etc.
        """
        if self.model is None:
            raise RuntimeError("Fraud model not loaded. Call load() first.")

        feature_vector = np.array([[
            features.get("claim_frequency_7d", 0),
            features.get("gps_accuracy", 100),
            features.get("activity_drop_pct", 0),
            features.get("claim_hour", 12),
            features.get("zone_risk_level", 1),
        ]])
        # IsolationForest returns -1 (anomaly) or 1 (normal)
        # decision_function returns negative = anomaly; convert to 0-1 probability
        raw_score = self.model.decision_function(feature_vector)[0]
        return float(np.clip(1 - (raw_score + 0.5), 0.0, 1.0))
