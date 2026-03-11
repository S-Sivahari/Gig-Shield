-- =============================================================================
-- GigShield — Schema Version Tracking
-- File:    018_schema_version.sql
-- DB:      PostgreSQL 14+
-- Depends: All previous files
-- =============================================================================

CREATE TABLE schema_migrations (
  version         VARCHAR(40) PRIMARY KEY,
  description     TEXT NOT NULL,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by      VARCHAR(80) DEFAULT CURRENT_USER,
  checksum        VARCHAR(64)
);

INSERT INTO schema_migrations (version, description) VALUES
  ('001', 'Initial complete GigShield schema — all layers');

-- Post-migration verification queries (run manually to confirm)
-- SELECT COUNT(*) FROM delivery_zones;          → 20
-- SELECT COUNT(*) FROM plan_configs;            → 3
-- SELECT COUNT(*) FROM disruption_thresholds;   → 22
-- SELECT COUNT(*) FROM notification_templates;  → 9
-- SELECT COUNT(*) FROM fraud_flag_catalog;      → 12
-- SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
