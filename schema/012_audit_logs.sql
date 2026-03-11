-- =============================================================================
-- GigShield — Audit Logs
-- File:    012_audit_logs.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 12.1  audit_logs  — immutable record of all sensitive actions
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id              BIGSERIAL PRIMARY KEY,
  performed_by    UUID REFERENCES system_users(id) ON DELETE SET NULL,
  action          audit_action_enum NOT NULL,
  entity_type     VARCHAR(60) NOT NULL,    -- worker | policy | claim | payout | fraud_assessment
  entity_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  changed_fields  TEXT[],
  ip_address      INET,
  user_agent      TEXT,
  session_id      VARCHAR(120),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_audit_entity    ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_performer ON audit_logs (performed_by, created_at DESC);
CREATE INDEX idx_audit_action    ON audit_logs (action, created_at DESC);

CREATE TABLE audit_logs_2024_11 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
