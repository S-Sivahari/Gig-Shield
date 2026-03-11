-- =============================================================================
-- GigShield — Claims
-- File:    007_claims.sql
-- DB:      PostgreSQL 14+
-- Depends: 005_policies.sql, 006_disruption_events.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 7.1  claims  — core claims table
-- ---------------------------------------------------------------------------
CREATE TABLE claims (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number          VARCHAR(25) UNIQUE NOT NULL
                          DEFAULT ('GS-CLM-' || to_char(NOW(),'YYYY') || '-' ||
                                   LPAD(nextval('seq_claim_no')::TEXT, 5, '0')),
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  policy_id             UUID NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,
  event_id              UUID NOT NULL REFERENCES disruption_events(id),

  -- Claim basics
  status                claim_status_enum NOT NULL DEFAULT 'auto_triggered',
  source                claim_source_enum NOT NULL DEFAULT 'auto_parametric',
  disruption_type       disruption_type_enum NOT NULL,
  severity              severity_enum NOT NULL,
  disruption_date       DATE NOT NULL,
  disruption_zone_id    UUID NOT NULL REFERENCES delivery_zones(id),

  -- Impact assessment
  hours_affected        NUMERIC(4,1),
  deliveries_lost_est   SMALLINT,
  income_loss_est_inr   NUMERIC(8,2),

  -- Payout calculation
  plan_at_claim         plan_enum NOT NULL,
  payout_amount         NUMERIC(8,2),
  payout_calculation    JSONB,              -- breakdown: severity_mult, hours_adj, plan_rate

  -- Validation results
  location_validated    BOOLEAN,
  activity_validated    BOOLEAN,
  policy_valid          BOOLEAN,
  event_confirmed       BOOLEAN,
  all_validations_passed BOOLEAN GENERATED ALWAYS AS (
    COALESCE(location_validated, FALSE) AND
    COALESCE(activity_validated, FALSE) AND
    COALESCE(policy_valid, FALSE) AND
    COALESCE(event_confirmed, FALSE)
  ) STORED,

  -- GPS at time of disruption
  worker_lat            NUMERIC(10,7),
  worker_lng            NUMERIC(10,7),
  worker_zone_id        UUID REFERENCES delivery_zones(id),
  gps_zone_match        BOOLEAN,
  gps_distance_from_zone_km NUMERIC(6,3),

  -- Manual review
  reviewed_by           UUID REFERENCES system_users(id),
  reviewed_at           TIMESTAMPTZ,
  rejection_reason      TEXT,

  -- Worker notes (manual claims)
  worker_description    TEXT,
  worker_submitted_at   TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_claims_worker        ON claims (worker_id, disruption_date DESC);
CREATE INDEX idx_claims_policy        ON claims (policy_id);
CREATE INDEX idx_claims_event         ON claims (event_id);
CREATE INDEX idx_claims_status        ON claims (status);
CREATE INDEX idx_claims_date          ON claims (disruption_date DESC);
CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Prevent duplicate auto-claims: one claim per worker per event
CREATE UNIQUE INDEX idx_claims_no_duplicate
  ON claims (worker_id, event_id)
  WHERE source = 'auto_parametric';

-- ---------------------------------------------------------------------------
-- 7.2  claim_validation_steps  — detailed log of each validation check
-- ---------------------------------------------------------------------------
CREATE TABLE claim_validation_steps (
  id              BIGSERIAL PRIMARY KEY,
  claim_id        UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  step_name       VARCHAR(60) NOT NULL,   -- location_check | activity_check | policy_check | event_check
  step_order      SMALLINT NOT NULL,
  passed          BOOLEAN NOT NULL,
  details         JSONB,
  executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_claim_validation_claim ON claim_validation_steps (claim_id);
