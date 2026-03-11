-- =============================================================================
-- GigShield — Permissions (Role-Based)
-- File:    017_permissions.sql
-- DB:      PostgreSQL 14+
-- Depends: All previous files
-- =============================================================================

-- Application roles (map to DB roles in production)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gigshield_api') THEN
    CREATE ROLE gigshield_api NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gigshield_readonly') THEN
    CREATE ROLE gigshield_readonly NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gigshield_aiengine') THEN
    CREATE ROLE gigshield_aiengine NOLOGIN;
  END IF;
END
$$;

-- API service: full CRUD on operational tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gigshield_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gigshield_api;

-- Read-only (analysts, BI tools)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gigshield_readonly;

-- AI engine: read workers/zones, write risk profiles and fraud assessments
GRANT SELECT ON workers, delivery_zones, platform_activity_snapshots,
               worker_gps_checkins, claims, policies, disruption_events,
               plan_configs, disruption_thresholds TO gigshield_aiengine;
GRANT SELECT, INSERT, UPDATE ON risk_profiles, fraud_assessments,
                                zone_risk_snapshots, daily_analytics_snapshots,
                                worker_weekly_summaries, zone_disruption_heatmap
                                TO gigshield_aiengine;

-- Audit log: insert only (immutable from app layer)
REVOKE UPDATE, DELETE ON audit_logs FROM gigshield_api;
