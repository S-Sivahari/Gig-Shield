-- =============================================================================
-- GigShield — Analytics Snapshot Tables
-- File:    013_analytics.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql, 005_policies.sql, 006_disruption_events.sql,
--          007_claims.sql, 009_payouts.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 13.1  daily_analytics_snapshots  — pre-computed daily metrics for dashboards
-- ---------------------------------------------------------------------------
CREATE TABLE daily_analytics_snapshots (
  id                        BIGSERIAL PRIMARY KEY,
  snapshot_date             DATE NOT NULL UNIQUE,

  -- Policy metrics
  total_active_policies     INTEGER NOT NULL DEFAULT 0,
  new_policies_today        INTEGER NOT NULL DEFAULT 0,
  terminated_policies_today INTEGER NOT NULL DEFAULT 0,
  policies_basic            INTEGER NOT NULL DEFAULT 0,
  policies_standard         INTEGER NOT NULL DEFAULT 0,
  policies_pro              INTEGER NOT NULL DEFAULT 0,

  -- Premium metrics
  premiums_collected_inr    NUMERIC(12,2) NOT NULL DEFAULT 0,
  premiums_failed_inr       NUMERIC(12,2) NOT NULL DEFAULT 0,
  renewal_success_rate_pct  NUMERIC(5,2),

  -- Worker metrics
  total_registered_workers  INTEGER NOT NULL DEFAULT 0,
  kyc_verified_workers      INTEGER NOT NULL DEFAULT 0,
  new_registrations_today   INTEGER NOT NULL DEFAULT 0,

  -- Disruption metrics
  disruption_events_active  SMALLINT NOT NULL DEFAULT 0,
  disruption_events_resolved SMALLINT NOT NULL DEFAULT 0,
  zones_affected_count      SMALLINT NOT NULL DEFAULT 0,

  -- Claims metrics
  claims_triggered_today    INTEGER NOT NULL DEFAULT 0,
  claims_approved_today     INTEGER NOT NULL DEFAULT 0,
  claims_rejected_today     INTEGER NOT NULL DEFAULT 0,
  claims_manual_review      INTEGER NOT NULL DEFAULT 0,
  auto_trigger_rate_pct     NUMERIC(5,2),

  -- Payout metrics
  payouts_initiated_inr     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payouts_completed_inr     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payouts_failed_inr        NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_payout_inr            NUMERIC(8,2),
  payout_count              INTEGER NOT NULL DEFAULT 0,

  -- Fraud metrics
  fraud_flags_raised        INTEGER NOT NULL DEFAULT 0,
  fraud_auto_blocks         INTEGER NOT NULL DEFAULT 0,
  fraud_manual_reviews      INTEGER NOT NULL DEFAULT 0,

  -- Financial health
  loss_ratio_pct            NUMERIC(6,2),  -- (payouts / premiums) * 100

  computed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_daily_analytics_date ON daily_analytics_snapshots (snapshot_date DESC);

-- ---------------------------------------------------------------------------
-- 13.2  worker_weekly_summaries  — per-worker weekly stats
-- ---------------------------------------------------------------------------
CREATE TABLE worker_weekly_summaries (
  id                    BIGSERIAL PRIMARY KEY,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  week_start_date       DATE NOT NULL,
  week_end_date         DATE NOT NULL,
  plan                  plan_enum,
  premium_paid_inr      NUMERIC(8,2) NOT NULL DEFAULT 0,
  active_delivery_days  SMALLINT NOT NULL DEFAULT 0,
  disruption_days       SMALLINT NOT NULL DEFAULT 0,
  claims_triggered      SMALLINT NOT NULL DEFAULT 0,
  claims_paid           SMALLINT NOT NULL DEFAULT 0,
  payout_received_inr   NUMERIC(8,2) NOT NULL DEFAULT 0,
  income_protected_inr  NUMERIC(8,2) NOT NULL DEFAULT 0,  -- payout / estimated loss %
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (worker_id, week_start_date)
);
CREATE INDEX idx_worker_weekly_worker ON worker_weekly_summaries (worker_id, week_start_date DESC);

-- ---------------------------------------------------------------------------
-- 13.3  zone_disruption_heatmap  — aggregated for map visualization
-- ---------------------------------------------------------------------------
CREATE TABLE zone_disruption_heatmap (
  id              BIGSERIAL PRIMARY KEY,
  zone_id         UUID NOT NULL REFERENCES delivery_zones(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  disruption_type disruption_type_enum,    -- NULL = all types
  event_count     SMALLINT NOT NULL DEFAULT 0,
  total_hours     NUMERIC(7,2) NOT NULL DEFAULT 0,
  workers_hit     INTEGER NOT NULL DEFAULT 0,
  claims_raised   INTEGER NOT NULL DEFAULT 0,
  payout_inr      NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_severity    NUMERIC(3,2),
  heat_intensity  NUMERIC(5,2),            -- 0-100 normalised for map colour
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (zone_id, period_start, period_end, disruption_type)
);
CREATE INDEX idx_heatmap_zone_period ON zone_disruption_heatmap (zone_id, period_start DESC);
