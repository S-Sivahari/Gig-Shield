-- =============================================================================
-- GigShield — Disruption Events
-- File:    006_disruption_events.sql
-- DB:      PostgreSQL 14+
-- Depends: 002_reference_tables.sql, 003_user_identity.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 6.1  disruption_events  — real-world events detected by the monitor
-- ---------------------------------------------------------------------------
CREATE TABLE disruption_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_code        VARCHAR(30) UNIQUE NOT NULL
                      DEFAULT ('EVT-' || to_char(NOW(),'YYYY') || '-' ||
                               LPAD(nextval('seq_event_no')::TEXT, 6, '0')),
  disruption_type   disruption_type_enum NOT NULL,
  severity          severity_enum NOT NULL,
  status            event_status_enum NOT NULL DEFAULT 'monitoring',

  -- Spatial scope
  affected_zone_ids UUID[] NOT NULL,          -- array of delivery_zones.id
  affected_cities   TEXT[],
  geom_affected     GEOMETRY(MULTIPOLYGON, 4326),  -- union of zone polygons

  -- Temporal scope
  detected_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  expected_duration INTERVAL,

  -- Trigger data
  trigger_metric    VARCHAR(60),             -- rainfall_mm_per_day
  trigger_value     NUMERIC(12,4),           -- 82.3
  trigger_unit      VARCHAR(20),
  threshold_used    NUMERIC(12,4),           -- 64.5

  -- Source data
  data_source       VARCHAR(80) NOT NULL,    -- openweathermap | cpcb | ndma | news_api
  raw_api_response  JSONB,
  api_fetched_at    TIMESTAMPTZ,

  -- Admin confirmation
  confirmed_by      UUID REFERENCES system_users(id),
  confirmation_notes TEXT,
  is_test_event     BOOLEAN NOT NULL DEFAULT FALSE,

  -- Counts
  workers_affected_count   INTEGER NOT NULL DEFAULT 0,
  claims_triggered_count   INTEGER NOT NULL DEFAULT 0,
  total_payout_inr         NUMERIC(12,2) NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_disruption_events_type    ON disruption_events (disruption_type, status);
CREATE INDEX idx_disruption_events_time    ON disruption_events (detected_at DESC);
CREATE INDEX idx_disruption_events_zones   ON disruption_events USING GIN (affected_zone_ids);
CREATE TRIGGER trg_disruption_events_updated_at
  BEFORE UPDATE ON disruption_events
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 6.2  disruption_event_zones  — explicit many-to-many (for joins)
-- ---------------------------------------------------------------------------
CREATE TABLE disruption_event_zones (
  event_id    UUID NOT NULL REFERENCES disruption_events(id) ON DELETE CASCADE,
  zone_id     UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, zone_id)
);

-- ---------------------------------------------------------------------------
-- 6.3  platform_activity_snapshots  — simulated gig platform data
-- ---------------------------------------------------------------------------
CREATE TABLE platform_activity_snapshots (
  id                        BIGSERIAL PRIMARY KEY,
  worker_id                 UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  platform                  platform_enum NOT NULL,
  snapshot_start            TIMESTAMPTZ NOT NULL,
  snapshot_end              TIMESTAMPTZ NOT NULL,
  deliveries_attempted      SMALLINT NOT NULL DEFAULT 0,
  deliveries_completed      SMALLINT NOT NULL DEFAULT 0,
  deliveries_cancelled      SMALLINT NOT NULL DEFAULT 0,
  app_open_duration_mins    SMALLINT NOT NULL DEFAULT 0,
  online_duration_mins      SMALLINT NOT NULL DEFAULT 0,
  orders_available_in_zone  SMALLINT,
  status_code               VARCHAR(40),  -- WAITING_FOR_ORDERS | DELIVERING | OFFLINE
  zone_id                   UUID REFERENCES delivery_zones(id),
  raw_platform_response     JSONB,
  is_simulated              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (snapshot_start);
CREATE INDEX idx_platform_activity_worker_time
  ON platform_activity_snapshots (worker_id, snapshot_start DESC);

CREATE TABLE platform_activity_snapshots_2024_11 PARTITION OF platform_activity_snapshots
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE platform_activity_snapshots_2024_12 PARTITION OF platform_activity_snapshots
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE platform_activity_snapshots_2025_01 PARTITION OF platform_activity_snapshots
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE platform_activity_snapshots_2025_02 PARTITION OF platform_activity_snapshots
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE platform_activity_snapshots_2025_03 PARTITION OF platform_activity_snapshots
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
