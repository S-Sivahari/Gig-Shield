-- =============================================================================
-- GigShield — Risk Profiling Tables
-- File:    004_risk_profiling.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 4.1  risk_profiles  — AI-computed risk profiles per worker
-- ---------------------------------------------------------------------------
CREATE TABLE risk_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,

  -- Component scores (0-100)
  zone_flood_risk       NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_heat_risk        NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_aqi_risk         NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_civic_risk       NUMERIC(5,2) NOT NULL DEFAULT 0,
  platform_density_risk NUMERIC(5,2) NOT NULL DEFAULT 0,
  delivery_hours_risk   NUMERIC(5,2) NOT NULL DEFAULT 0,  -- night shift = higher
  historical_freq_risk  NUMERIC(5,2) NOT NULL DEFAULT 0,  -- past disruptions

  -- Composite
  composite_risk_score  NUMERIC(5,2) NOT NULL,
  risk_tier             risk_tier_enum NOT NULL,

  -- Premium recommendation
  recommended_plan      plan_enum NOT NULL,
  recommended_premium   NUMERIC(8,2) NOT NULL,
  weather_multiplier    NUMERIC(4,2) NOT NULL DEFAULT 1.00,  -- 1.0 / 1.3 / 1.5 from live weather
  vehicle_multiplier    NUMERIC(4,2) NOT NULL DEFAULT 1.00,  -- 0.9 (4W) / 1.2 (2W)
  gear_discount_pct     NUMERIC(4,2) NOT NULL DEFAULT 0.00,  -- 0 or 5 (safety gear %)

  -- Model metadata
  model_version         VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  feature_vector        JSONB,             -- raw features sent to model
  model_output          JSONB,             -- raw model response
  calculated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until           TIMESTAMPTZ NOT NULL
                          DEFAULT (NOW() + INTERVAL '30 days'),
  is_current            BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_risk_profiles_worker ON risk_profiles (worker_id, is_current);

-- ---------------------------------------------------------------------------
-- 4.2  zone_risk_snapshots  — periodic zone-level risk captures (for heatmap)
-- ---------------------------------------------------------------------------
CREATE TABLE zone_risk_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  zone_id         UUID NOT NULL REFERENCES delivery_zones(id),
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  flood_score     NUMERIC(5,2),
  heat_score      NUMERIC(5,2),
  aqi_score       NUMERIC(5,2),
  civic_score     NUMERIC(5,2),
  composite_score NUMERIC(5,2),
  active_workers  INTEGER,
  active_policies INTEGER,
  raw_weather     JSONB,    -- raw API response snapshot
  raw_aqi         JSONB
) PARTITION BY RANGE (snapshot_at);
CREATE INDEX idx_zone_snapshots_zone_time ON zone_risk_snapshots (zone_id, snapshot_at DESC);

CREATE TABLE zone_risk_snapshots_2024_11 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE zone_risk_snapshots_2024_12 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE zone_risk_snapshots_2025_01 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE zone_risk_snapshots_2025_02 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE zone_risk_snapshots_2025_03 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
