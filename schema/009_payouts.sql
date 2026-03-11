-- =============================================================================
-- GigShield — Payouts
-- File:    009_payouts.sql
-- DB:      PostgreSQL 14+
-- Depends: 007_claims.sql, 008_fraud_detection.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 9.1  payouts  — payout disbursements
-- ---------------------------------------------------------------------------
CREATE TABLE payouts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_number         VARCHAR(25) UNIQUE NOT NULL
                          DEFAULT ('GS-PAY-' || to_char(NOW(),'YYYY') || '-' ||
                                   LPAD(nextval('seq_payout_no')::TEXT, 5, '0')),
  claim_id              UUID NOT NULL UNIQUE REFERENCES claims(id) ON DELETE RESTRICT,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  policy_id             UUID NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,

  -- Amount
  amount_inr            NUMERIC(10,2) NOT NULL,
  amount_paise          BIGINT GENERATED ALWAYS AS
                          (ROUND(amount_inr * 100)::BIGINT) STORED,
  currency              CHAR(3) NOT NULL DEFAULT 'INR',

  -- Channel
  channel               payout_channel_enum NOT NULL DEFAULT 'upi',
  upi_id                VARCHAR(60),
  bank_account_last4    CHAR(4),
  bank_ifsc             VARCHAR(11),
  razorpay_fund_account_id VARCHAR(80),

  -- Razorpay
  razorpay_payout_id    VARCHAR(80) UNIQUE,
  razorpay_reference_id VARCHAR(80),
  razorpay_status       VARCHAR(30),
  razorpay_raw_response JSONB,

  -- Status
  status                payout_status_enum NOT NULL DEFAULT 'initiated',
  initiated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_at         TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,
  failure_reason        TEXT,
  reversed_at           TIMESTAMPTZ,
  reversal_reason       TEXT,

  -- Retry
  retry_count           SMALLINT NOT NULL DEFAULT 0,
  max_retries           SMALLINT NOT NULL DEFAULT 3,
  next_retry_at         TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payouts_worker   ON payouts (worker_id, initiated_at DESC);
CREATE INDEX idx_payouts_status   ON payouts (status);
CREATE INDEX idx_payouts_rz_id    ON payouts (razorpay_payout_id);
CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 9.2  payout_webhooks  — Razorpay webhook events received
-- ---------------------------------------------------------------------------
CREATE TABLE payout_webhooks (
  id                  BIGSERIAL PRIMARY KEY,
  razorpay_payout_id  VARCHAR(80),
  event_type          VARCHAR(80) NOT NULL,   -- payout.processed | payout.failed
  payload             JSONB NOT NULL,
  signature_valid     BOOLEAN NOT NULL DEFAULT FALSE,
  processed           BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at        TIMESTAMPTZ,
  error_message       TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payout_webhooks_payout ON payout_webhooks (razorpay_payout_id);

-- ---------------------------------------------------------------------------
-- 9.3  payout_ledger  — immutable double-entry style financial log
-- ---------------------------------------------------------------------------
CREATE TABLE payout_ledger (
  id              BIGSERIAL PRIMARY KEY,
  payout_id       UUID NOT NULL REFERENCES payouts(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  entry_type      VARCHAR(20) NOT NULL,   -- debit (insurer) | credit (worker)
  amount_inr      NUMERIC(10,2) NOT NULL,
  balance_after   NUMERIC(12,2),
  description     TEXT NOT NULL,
  reference_id    VARCHAR(80),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payout_ledger_worker ON payout_ledger (worker_id, created_at DESC);
