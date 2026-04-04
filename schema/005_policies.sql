-- =============================================================================
-- GigShield — Policy Tables
-- File:    005_policies.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql, 004_risk_profiling.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5.1  policies  — insurance policies
-- ---------------------------------------------------------------------------
CREATE TABLE policies (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_number         VARCHAR(25) UNIQUE NOT NULL
                          DEFAULT ('GS-POL-' || to_char(NOW(),'YYYY') || '-' ||
                                   LPAD(nextval('seq_policy_no')::TEXT, 5, '0')),
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  plan                  plan_enum NOT NULL,
  status                policy_status_enum NOT NULL DEFAULT 'draft',

  -- Dates
  effective_from        DATE NOT NULL,
  effective_to          DATE,                        -- NULL = perpetual until termination
  last_renewed_on       DATE,
  next_renewal_due      DATE NOT NULL,
  grace_period_until    DATE,

  -- Financials
  weekly_premium        NUMERIC(8,2) NOT NULL,
  total_premiums_paid   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_payouts_issued  NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Dynamic premium snapshot (Earn-Lock engine output at time of issuance)
  weather_multiplier_at_issue NUMERIC(4,2),                -- weather risk at policy creation
  premium_breakdown_json      JSONB,                        -- full calculation trace for "Why this price?"

  -- Coverage snapshot (denormalised from plan_configs at time of issue)
  covered_disruptions   disruption_type_enum[] NOT NULL,
  max_payout_per_event  NUMERIC(8,2) NOT NULL,
  max_payout_per_week   NUMERIC(8,2) NOT NULL,
  max_payout_per_month  NUMERIC(8,2) NOT NULL,
  max_claims_per_month  SMALLINT NOT NULL,
  min_active_days_per_week SMALLINT NOT NULL DEFAULT 3,
  min_severity_trigger  severity_enum NOT NULL,

  -- Administration
  auto_renew            BOOLEAN NOT NULL DEFAULT TRUE,
  issued_by             UUID REFERENCES system_users(id),
  terminated_by         UUID REFERENCES system_users(id),
  termination_reason    TEXT,
  terminated_at         TIMESTAMPTZ,

  -- Mandate (UPI auto-debit)
  upi_mandate_id        VARCHAR(80),
  mandate_status        VARCHAR(20),                 -- created | active | cancelled

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_policies_worker      ON policies (worker_id);
CREATE INDEX idx_policies_status      ON policies (status);
CREATE INDEX idx_policies_renewal     ON policies (next_renewal_due) WHERE status = 'active';
CREATE INDEX idx_policies_plan        ON policies (plan);
CREATE TRIGGER trg_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Enforce: worker can have at most one ACTIVE or GRACE policy at a time
CREATE UNIQUE INDEX idx_policies_one_active_per_worker
  ON policies (worker_id)
  WHERE status IN ('active', 'grace_period', 'draft');

-- ---------------------------------------------------------------------------
-- 5.2  premium_payments  — weekly premium payment ledger
-- ---------------------------------------------------------------------------
CREATE TABLE premium_payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id           UUID NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,
  worker_id           UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  week_start_date     DATE NOT NULL,
  week_end_date       DATE NOT NULL,
  amount              NUMERIC(8,2) NOT NULL,
  status              premium_payment_status_enum NOT NULL DEFAULT 'pending',
  payment_method      payout_channel_enum,
  razorpay_order_id   VARCHAR(80),
  razorpay_payment_id VARCHAR(80),
  razorpay_signature  TEXT,
  paid_at             TIMESTAMPTZ,
  failure_reason      TEXT,
  retry_count         SMALLINT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_id, week_start_date)
);
CREATE INDEX idx_premium_payments_policy ON premium_payments (policy_id, week_start_date);
CREATE INDEX idx_premium_payments_status ON premium_payments (status);
CREATE TRIGGER trg_premium_payments_updated_at
  BEFORE UPDATE ON premium_payments
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 5.3  policy_change_log  — every state change on a policy
-- ---------------------------------------------------------------------------
CREATE TABLE policy_change_log (
  id              BIGSERIAL PRIMARY KEY,
  policy_id       UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES system_users(id),
  change_type     VARCHAR(40) NOT NULL,   -- activated | renewed | suspended | upgraded | terminated
  old_status      policy_status_enum,
  new_status      policy_status_enum,
  old_plan        plan_enum,
  new_plan        plan_enum,
  notes           TEXT,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_policy_change_log_policy ON policy_change_log (policy_id);
