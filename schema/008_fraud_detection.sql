-- =============================================================================
-- GigShield — Fraud Detection
-- File:    008_fraud_detection.sql
-- DB:      PostgreSQL 14+
-- Depends: 007_claims.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 8.1  fraud_assessments  — per-claim fraud analysis result
-- ---------------------------------------------------------------------------
CREATE TABLE fraud_assessments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id              UUID NOT NULL UNIQUE REFERENCES claims(id) ON DELETE CASCADE,
  worker_id             UUID NOT NULL REFERENCES workers(id),

  -- Scores (0.0 – 1.0)
  overall_fraud_score   NUMERIC(5,4) NOT NULL,
  gps_spoof_score       NUMERIC(5,4) NOT NULL DEFAULT 0,
  duplicate_score       NUMERIC(5,4) NOT NULL DEFAULT 0,
  activity_anomaly_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  behavioral_anomaly_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  claim_freq_score      NUMERIC(5,4) NOT NULL DEFAULT 0,

  -- Decision
  decision              fraud_decision_enum NOT NULL,
  flags                 TEXT[],                           -- list of triggered flag codes
  model_version         VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  feature_vector        JSONB,
  model_output          JSONB,

  -- Manual override
  overridden            BOOLEAN NOT NULL DEFAULT FALSE,
  overridden_by         UUID REFERENCES system_users(id),
  override_decision     fraud_decision_enum,
  override_reason       TEXT,
  overridden_at         TIMESTAMPTZ,

  assessed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fraud_worker    ON fraud_assessments (worker_id);
CREATE INDEX idx_fraud_decision  ON fraud_assessments (decision);
CREATE INDEX idx_fraud_score     ON fraud_assessments (overall_fraud_score DESC);

-- ---------------------------------------------------------------------------
-- 8.2  fraud_flag_catalog  — catalog of fraud flag types
-- ---------------------------------------------------------------------------
CREATE TABLE fraud_flag_catalog (
  code            VARCHAR(40) PRIMARY KEY,
  description     TEXT NOT NULL,
  weight          NUMERIC(4,3) NOT NULL,    -- contribution to score
  auto_block      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fraud_flag_catalog (code, description, weight, auto_block) VALUES
  ('GPS_ZONE_MISMATCH',       'Worker GPS not in claimed disruption zone',         0.40, FALSE),
  ('GPS_TELEPORTATION',       'Physically impossible GPS movement detected',        0.80, TRUE),
  ('GPS_SPOOFING_DETECTED',   'Mock GPS / VPN-routed coordinates detected',         0.90, TRUE),
  ('DUPLICATE_CLAIM',         'Claim already submitted for same event',             1.00, TRUE),
  ('ACTIVE_DURING_DISRUPTION','Platform shows completed deliveries during event',   0.50, FALSE),
  ('BEHAVIORAL_ANOMALY',      'Isolation Forest anomaly score below threshold',     0.30, FALSE),
  ('EXCESS_CLAIM_FREQUENCY',  'Monthly claim count exceeds plan limit',             0.40, FALSE),
  ('POLICY_INACTIVE',         'Policy not active at time of disruption',            1.00, TRUE),
  ('PREMIUM_UNPAID',          'Last premium payment failed or pending',             0.70, FALSE),
  ('KYC_INCOMPLETE',          'Worker KYC not fully verified',                      1.00, TRUE),
  ('PLATFORM_ID_MISMATCH',    'Platform worker ID does not match registration',     0.60, FALSE),
  ('CLAIM_TIME_SUSPICIOUS',   'Claim filed within minutes of event creation',       0.20, FALSE);

-- ---------------------------------------------------------------------------
-- 8.3  worker_fraud_watch_history  — running watch list
-- ---------------------------------------------------------------------------
CREATE TABLE worker_fraud_watch_history (
  id              BIGSERIAL PRIMARY KEY,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  flagged_by      UUID REFERENCES system_users(id),
  reason          TEXT NOT NULL,
  fraud_score     NUMERIC(5,4),
  watch_level     VARCHAR(20) NOT NULL DEFAULT 'soft',  -- soft | hard | blacklisted
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by     UUID REFERENCES system_users(id),
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  flagged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fraud_watch_worker ON worker_fraud_watch_history (worker_id, resolved);
