-- =============================================================================
-- GigShield — Admin / Agent Management
-- File:    011_admin.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql, 007_claims.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 11.1  admin_profiles  — extended profile for agents and admins
-- ---------------------------------------------------------------------------
CREATE TABLE admin_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_user_id  UUID NOT NULL UNIQUE REFERENCES system_users(id) ON DELETE CASCADE,
  full_name       VARCHAR(120) NOT NULL,
  employee_id     VARCHAR(30) UNIQUE,
  department      VARCHAR(60),
  assigned_zones  UUID[],               -- zones this agent handles (NULL = all)
  max_daily_reviews SMALLINT DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 11.2  verification_queue  — KYC document review queue
-- ---------------------------------------------------------------------------
CREATE TABLE verification_queue (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  queue_type      VARCHAR(30) NOT NULL,   -- kyc_review | claim_review | fraud_review
  priority        SMALLINT NOT NULL DEFAULT 5,   -- 1 (highest) to 10
  assigned_to     UUID REFERENCES system_users(id),
  assigned_at     TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | in_review | resolved | escalated
  resolution      VARCHAR(20),                             -- approved | rejected | escalated
  resolved_by     UUID REFERENCES system_users(id),
  resolved_at     TIMESTAMPTZ,
  notes           TEXT,
  related_claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_verification_queue_status   ON verification_queue (status, priority, created_at);
CREATE INDEX idx_verification_queue_assigned ON verification_queue (assigned_to, status);
CREATE TRIGGER trg_verification_queue_updated_at
  BEFORE UPDATE ON verification_queue
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
