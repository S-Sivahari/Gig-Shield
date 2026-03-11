-- =============================================================================
-- GigShield — Master Migration Runner
-- File:    run_all.sql
-- DB:      PostgreSQL 14+
-- Usage:   psql -U postgres -d gigshield -f schema/run_all.sql
--
-- Runs all schema files in dependency order within a single transaction.
-- =============================================================================

BEGIN;

\ir 000_extensions_and_helpers.sql
\ir 001_enumerations.sql
\ir 002_reference_tables.sql
\ir 003_user_identity.sql
\ir 004_risk_profiling.sql
\ir 005_policies.sql
\ir 006_disruption_events.sql
\ir 007_claims.sql
\ir 008_fraud_detection.sql
\ir 009_payouts.sql
\ir 010_notifications.sql
\ir 011_admin.sql
\ir 012_audit_logs.sql
\ir 013_analytics.sql
\ir 014_triggers.sql
\ir 015_views.sql
\ir 016_seed_data.sql
\ir 017_permissions.sql
\ir 018_schema_version.sql

COMMIT;
