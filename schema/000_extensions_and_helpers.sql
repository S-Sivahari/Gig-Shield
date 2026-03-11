-- =============================================================================
-- GigShield — Extensions & Helper Functions
-- File:    000_extensions_and_helpers.sql
-- DB:      PostgreSQL 14+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- encrypt / gen_salt
CREATE EXTENSION IF NOT EXISTS "postgis";         -- GPS / zone geometry
CREATE EXTENSION IF NOT EXISTS "btree_gist";      -- exclusion constraints on ranges
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- fuzzy name/phone search

-- ---------------------------------------------------------------------------
-- HELPER: updated_at auto-stamp trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- HELPER: generate GigShield human-readable IDs
--   Workers  → GS-MH-2024-00001
--   Policies → GS-POL-2024-00001
--   Claims   → GS-CLM-2024-00001
--   Payouts  → GS-PAY-2024-00001
-- ---------------------------------------------------------------------------
CREATE SEQUENCE seq_worker_no   START 1 INCREMENT 1;
CREATE SEQUENCE seq_policy_no   START 1 INCREMENT 1;
CREATE SEQUENCE seq_claim_no    START 1 INCREMENT 1;
CREATE SEQUENCE seq_payout_no   START 1 INCREMENT 1;
CREATE SEQUENCE seq_event_no    START 1 INCREMENT 1;
