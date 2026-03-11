-- =============================================================================
-- GigShield — Complete Database Migration
-- File:    001_gigshield_complete_schema.sql
-- DB:      PostgreSQL 14+
-- Covers:  ALL layers — Auth/KYC, Workers, Risk Profiles, Policies,
--          Disruption Events, Claims, Fraud Detection, Payouts,
--          Notifications, Audit Logs, Analytics Snapshots, Admin/Agent Roles
-- Run:     psql -U postgres -d gigshield -f 001_gigshield_complete_schema.sql
-- =============================================================================

BEGIN;

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

-- =============================================================================
-- SECTION 1 — ENUMERATIONS
-- =============================================================================

-- Delivery platforms
CREATE TYPE platform_enum AS ENUM (
  'zomato', 'swiggy', 'zepto', 'amazon', 'dunzo', 'blinkit',
  'bigbasket', 'jiomart', 'shadowfax', 'other'
);

-- KYC / onboarding states
CREATE TYPE kyc_status_enum AS ENUM (
  'pending_docs',
  'docs_submitted',
  'under_review',
  'verified',
  'rejected',
  'suspended'
);

-- Insurance plan tiers
CREATE TYPE plan_enum AS ENUM ('basic', 'standard', 'pro');

-- Policy lifecycle
CREATE TYPE policy_status_enum AS ENUM (
  'draft',
  'active',
  'grace_period',
  'suspended',
  'terminated',
  'expired'
);

-- Claim lifecycle
CREATE TYPE claim_status_enum AS ENUM (
  'auto_triggered',
  'manually_filed',
  'pending_validation',
  'pending_fraud_check',
  'approved',
  'rejected',
  'paid',
  'under_manual_review',
  'cancelled'
);

-- Disruption types (parametric triggers)
CREATE TYPE disruption_type_enum AS ENUM (
  'heavy_rain',
  'extreme_heat',
  'flood',
  'cyclone',
  'severe_aqi',
  'dense_fog',
  'hailstorm',
  'civic_curfew',
  'platform_strike',
  'local_market_closure',
  'earthquake_alert',
  'thunderstorm'
);

-- Disruption severity
CREATE TYPE severity_enum AS ENUM ('low', 'moderate', 'high', 'extreme');

-- Disruption event status
CREATE TYPE event_status_enum AS ENUM ('monitoring', 'active', 'resolved', 'cancelled');

-- Payout channel
CREATE TYPE payout_channel_enum AS ENUM ('upi', 'imps', 'neft', 'rtgs');

-- Payout status
CREATE TYPE payout_status_enum AS ENUM (
  'initiated',
  'processing',
  'success',
  'failed',
  'reversed',
  'on_hold'
);

-- Fraud decision
CREATE TYPE fraud_decision_enum AS ENUM (
  'auto_approve',
  'soft_flag',
  'hard_flag',
  'blocked'
);

-- Notification channels
CREATE TYPE notification_channel_enum AS ENUM (
  'sms', 'whatsapp', 'push', 'email', 'ussd'
);

-- Notification status
CREATE TYPE notification_status_enum AS ENUM (
  'queued', 'sent', 'delivered', 'failed', 'read'
);

-- Document types
CREATE TYPE document_type_enum AS ENUM (
  'aadhaar_front',
  'aadhaar_back',
  'driving_license',
  'vehicle_registration',
  'bike_insurance',
  'platform_id_screenshot',
  'bank_passbook',
  'cancelled_cheque',
  'selfie_with_id'
);

-- Document verification status
CREATE TYPE doc_status_enum AS ENUM (
  'uploaded', 'under_review', 'verified', 'rejected'
);

-- User roles in the system
CREATE TYPE user_role_enum AS ENUM (
  'worker',
  'verification_agent',
  'insurance_admin',
  'super_admin',
  'readonly_analyst'
);

-- Claim trigger source
CREATE TYPE claim_source_enum AS ENUM (
  'auto_parametric',
  'worker_manual',
  'agent_initiated'
);

-- Premium payment status
CREATE TYPE premium_payment_status_enum AS ENUM (
  'pending', 'success', 'failed', 'refunded', 'waived'
);

-- Risk tier
CREATE TYPE risk_tier_enum AS ENUM ('low', 'medium', 'high', 'very_high');

-- Audit action types
CREATE TYPE audit_action_enum AS ENUM (
  'create', 'update', 'delete', 'approve', 'reject',
  'login', 'logout', 'export', 'flag', 'override'
);

-- =============================================================================
-- SECTION 2 — REFERENCE / LOOKUP TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1  delivery_zones  — geographic delivery zones (cities / pin-code clusters)
-- ---------------------------------------------------------------------------
CREATE TABLE delivery_zones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_code           VARCHAR(60) UNIQUE NOT NULL,     -- e.g. mumbai_andheri
  zone_name           VARCHAR(120) NOT NULL,
  city                VARCHAR(80) NOT NULL,
  state               VARCHAR(80) NOT NULL,
  state_code          CHAR(2) NOT NULL,                -- MH, KA, TN …
  country             CHAR(2) NOT NULL DEFAULT 'IN',
  pincode_list        TEXT[],                          -- array of pin codes in zone
  centroid_lat        NUMERIC(10,7),
  centroid_lng        NUMERIC(10,7),
  boundary_geom       GEOMETRY(MULTIPOLYGON, 4326),    -- PostGIS polygon
  flood_risk_score    NUMERIC(5,2) DEFAULT 0,          -- 0-100
  heat_risk_score     NUMERIC(5,2) DEFAULT 0,
  aqi_risk_score      NUMERIC(5,2) DEFAULT 0,
  civic_risk_score    NUMERIC(5,2) DEFAULT 0,
  composite_risk_score NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((flood_risk_score * 0.25 +
           heat_risk_score  * 0.25 +
           aqi_risk_score   * 0.20 +
           civic_risk_score * 0.15), 2)
  ) STORED,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  weather_station_id  VARCHAR(50),                     -- OpenWeatherMap station
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2.2  plan_configs  — plan definitions and payout rules
-- ---------------------------------------------------------------------------
CREATE TABLE plan_configs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan                    plan_enum UNIQUE NOT NULL,
  display_name            VARCHAR(40) NOT NULL,
  weekly_premium_inr      NUMERIC(8,2) NOT NULL,
  payout_per_day_low      NUMERIC(8,2) NOT NULL,       -- severity=low
  payout_per_day_moderate NUMERIC(8,2) NOT NULL,
  payout_per_day_high     NUMERIC(8,2) NOT NULL,
  payout_per_day_extreme  NUMERIC(8,2) NOT NULL,
  max_payout_per_event    NUMERIC(8,2) NOT NULL,
  max_payout_per_week     NUMERIC(8,2) NOT NULL,
  max_payout_per_month    NUMERIC(8,2) NOT NULL,
  max_claims_per_month    SMALLINT NOT NULL,
  min_active_days_per_week SMALLINT NOT NULL DEFAULT 3,
  claim_response_hours    SMALLINT NOT NULL,            -- SLA hours
  covered_disruptions     disruption_type_enum[] NOT NULL,
  min_severity_trigger    severity_enum NOT NULL DEFAULT 'moderate',
  support_channels        TEXT[] NOT NULL,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to            DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_plan_configs_updated_at
  BEFORE UPDATE ON plan_configs
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed canonical plan data
INSERT INTO plan_configs (
  plan, display_name,
  weekly_premium_inr,
  payout_per_day_low, payout_per_day_moderate,
  payout_per_day_high, payout_per_day_extreme,
  max_payout_per_event, max_payout_per_week, max_payout_per_month,
  max_claims_per_month, min_active_days_per_week, claim_response_hours,
  covered_disruptions, min_severity_trigger, support_channels
) VALUES
(
  'basic', 'Basic',
  29.00, 100.00, 100.00, 100.00, 100.00,
  100.00, 300.00, 900.00,
  3, 3, 24,
  ARRAY['heavy_rain','flood','cyclone','hailstorm']::disruption_type_enum[],
  'moderate',
  ARRAY['sms']
),
(
  'standard', 'Standard',
  49.00, 120.00, 150.00, 150.00, 150.00,
  150.00, 450.00, 1350.00,
  5, 3, 4,
  ARRAY['heavy_rain','flood','cyclone','hailstorm','extreme_heat',
        'severe_aqi','civic_curfew','dense_fog','thunderstorm']::disruption_type_enum[],
  'low',
  ARRAY['sms','whatsapp']
),
(
  'pro', 'Pro',
  79.00, 200.00, 250.00, 300.00, 300.00,
  300.00, 750.00, 2250.00,
  999, 3, 2,
  ARRAY['heavy_rain','flood','cyclone','hailstorm','extreme_heat',
        'severe_aqi','civic_curfew','dense_fog','thunderstorm',
        'platform_strike','local_market_closure','earthquake_alert']::disruption_type_enum[],
  'low',
  ARRAY['sms','whatsapp','push']
);

-- ---------------------------------------------------------------------------
-- 2.3  disruption_thresholds  — per-type trigger thresholds
-- ---------------------------------------------------------------------------
CREATE TABLE disruption_thresholds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disruption_type disruption_type_enum NOT NULL,
  severity        severity_enum NOT NULL,
  metric_name     VARCHAR(60) NOT NULL,    -- e.g. rainfall_mm_per_day
  operator        VARCHAR(10) NOT NULL,    -- >, >=, <, <=, =
  threshold_value NUMERIC(10,4) NOT NULL,
  unit            VARCHAR(30),             -- mm, celsius, aqi_index, km/h
  data_source     VARCHAR(80) NOT NULL,    -- openweathermap, cpcb, ndma, imd
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (disruption_type, severity, metric_name)
);

INSERT INTO disruption_thresholds
  (disruption_type, severity, metric_name, operator, threshold_value, unit, data_source, description)
VALUES
  ('heavy_rain','low',      'rainfall_mm_per_day',  '>=', 35.5,  'mm',      'openweathermap', 'IMD Moderate rain'),
  ('heavy_rain','moderate', 'rainfall_mm_per_day',  '>=', 64.5,  'mm',      'openweathermap', 'IMD Heavy rain'),
  ('heavy_rain','high',     'rainfall_mm_per_day',  '>=', 115.5, 'mm',      'openweathermap', 'IMD Very heavy rain'),
  ('heavy_rain','extreme',  'rainfall_mm_per_day',  '>=', 204.5, 'mm',      'openweathermap', 'IMD Extremely heavy'),
  ('extreme_heat','low',    'temp_celsius',          '>=', 40.0,  'celsius', 'openweathermap', 'Heat warning'),
  ('extreme_heat','moderate','temp_celsius',         '>=', 43.0,  'celsius', 'openweathermap', 'Severe heat'),
  ('extreme_heat','high',   'temp_celsius',          '>=', 45.0,  'celsius', 'openweathermap', 'Extreme heat'),
  ('extreme_heat','extreme','heat_index_celsius',    '>=', 54.0,  'celsius', 'openweathermap', 'Danger level heat index'),
  ('severe_aqi','low',      'aqi_index',             '>=', 201.0, 'aqi',     'cpcb',           'Very poor air quality'),
  ('severe_aqi','moderate', 'aqi_index',             '>=', 251.0, 'aqi',     'cpcb',           'Severe air quality'),
  ('severe_aqi','high',     'aqi_index',             '>=', 301.0, 'aqi',     'cpcb',           'Hazardous AQI'),
  ('severe_aqi','extreme',  'aqi_index',             '>=', 401.0, 'aqi',     'cpcb',           'Emergency AQI'),
  ('dense_fog', 'moderate', 'visibility_meters',     '<=', 200.0, 'meters',  'openweathermap', 'Dense fog advisory'),
  ('dense_fog', 'high',     'visibility_meters',     '<=', 50.0,  'meters',  'openweathermap', 'Very dense fog'),
  ('cyclone',   'moderate', 'wind_speed_kmh',        '>=', 89.0,  'kmh',     'imd',            'Cyclone warning'),
  ('cyclone',   'high',     'wind_speed_kmh',        '>=', 118.0, 'kmh',     'imd',            'Severe cyclone'),
  ('thunderstorm','low',    'weather_code',          '=',  2.0,   'code_prefix', 'openweathermap', 'OWM 2xx = thunderstorm'),
  ('hailstorm', 'high',     'imd_alert_level',       '>=', 2.0,   'level',   'imd',            'IMD orange/red alert'),
  ('flood',     'moderate', 'ndma_alert_level',      '>=', 2.0,   'level',   'ndma',           'NDMA flood alert'),
  ('civic_curfew','high',   'section_144_active',    '=',  1.0,   'boolean', 'news_api',       'Section 144 in zone'),
  ('platform_strike','high','platform_halt_pct',     '>=', 80.0,  'percent', 'platform_api',   'Zone-wide delivery halt'),
  ('local_market_closure','moderate','closure_verified','=',1.0,  'boolean', 'news_api',       'Verified market closure');

-- =============================================================================
-- SECTION 3 — USER & IDENTITY TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1  system_users  — unified login table for all roles
-- ---------------------------------------------------------------------------
CREATE TABLE system_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(15) UNIQUE NOT NULL,
  email           VARCHAR(180) UNIQUE,
  password_hash   TEXT,                              -- bcrypt for agents/admins
  role            user_role_enum NOT NULL DEFAULT 'worker',
  preferred_lang  CHAR(2) NOT NULL DEFAULT 'en',    -- en, hi, ta, te, kn, bn
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   INET,
  failed_login_attempts SMALLINT NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_system_users_phone ON system_users (phone);
CREATE INDEX idx_system_users_role  ON system_users (role);
CREATE TRIGGER trg_system_users_updated_at
  BEFORE UPDATE ON system_users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.2  otp_sessions  — OTP verification (registration, login, bank verify)
-- ---------------------------------------------------------------------------
CREATE TABLE otp_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(15) NOT NULL,
  purpose         VARCHAR(40) NOT NULL,   -- register | login | bank_verify | aadhaar
  otp_hash        TEXT NOT NULL,          -- SHA-256 of OTP (never store plain)
  expires_at      TIMESTAMPTZ NOT NULL,
  attempts        SMALLINT NOT NULL DEFAULT 0,
  max_attempts    SMALLINT NOT NULL DEFAULT 5,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_otp_phone_purpose ON otp_sessions (phone, purpose, verified);
-- Auto-expire rows after 24h via pg_cron (or application cleanup)

-- ---------------------------------------------------------------------------
-- 3.3  workers  — delivery worker profiles
-- ---------------------------------------------------------------------------
CREATE TABLE workers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_user_id        UUID NOT NULL REFERENCES system_users(id) ON DELETE RESTRICT,
  gigshield_id          VARCHAR(25) UNIQUE NOT NULL
                          DEFAULT ('GS-' || to_char(NOW(),'YYYY') || '-' ||
                                   LPAD(nextval('seq_worker_no')::TEXT, 5, '0')),
  full_name             VARCHAR(120) NOT NULL,
  date_of_birth         DATE,
  gender                CHAR(1) CHECK (gender IN ('M','F','O')),

  -- Contact
  phone                 VARCHAR(15) NOT NULL,            -- denormalised for speed
  whatsapp_number       VARCHAR(15),
  email                 VARCHAR(180),

  -- Identity (sensitive — app layer encrypts before insert)
  aadhaar_last4         CHAR(4),                        -- last 4 digits only
  aadhaar_hash          CHAR(64),                       -- SHA-256 of full number
  driving_license_no    TEXT,                           -- pgcrypto encrypted
  vehicle_reg_no        VARCHAR(20),

  -- Delivery platform
  primary_platform      platform_enum NOT NULL,
  platform_worker_id    VARCHAR(80),
  platform_joined_date  DATE,
  secondary_platforms   platform_enum[],

  -- Location
  home_zone_id          UUID REFERENCES delivery_zones(id),
  primary_city          VARCHAR(80),
  state_code            CHAR(2),

  -- Bank / Payment
  upi_id                VARCHAR(60),
  bank_account_encrypted TEXT,                          -- pgcrypto AES-256
  bank_ifsc             VARCHAR(11),
  bank_name             VARCHAR(80),
  razorpay_contact_id   VARCHAR(80),                    -- Razorpay fund-account
  razorpay_fund_account_id VARCHAR(80),
  payment_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  penny_drop_verified_at TIMESTAMPTZ,

  -- KYC
  kyc_status            kyc_status_enum NOT NULL DEFAULT 'pending_docs',
  kyc_reviewed_by       UUID REFERENCES system_users(id),
  kyc_reviewed_at       TIMESTAMPTZ,
  kyc_rejection_reason  TEXT,

  -- Risk
  risk_score            NUMERIC(5,2),                   -- 0-100, from AI engine
  risk_tier             risk_tier_enum,
  risk_calculated_at    TIMESTAMPTZ,

  -- Flags
  is_active             BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE after KYC verified
  is_test_account       BOOLEAN NOT NULL DEFAULT FALSE,
  fraud_watch           BOOLEAN NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_workers_gigshield_id   ON workers (gigshield_id);
CREATE INDEX idx_workers_phone          ON workers (phone);
CREATE INDEX idx_workers_kyc_status     ON workers (kyc_status);
CREATE INDEX idx_workers_zone           ON workers (home_zone_id);
CREATE INDEX idx_workers_platform       ON workers (primary_platform);
CREATE INDEX idx_workers_risk_tier      ON workers (risk_tier);
CREATE TRIGGER trg_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.4  worker_documents  — KYC document uploads
-- ---------------------------------------------------------------------------
CREATE TABLE worker_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  doc_type        document_type_enum NOT NULL,
  s3_bucket       VARCHAR(120) NOT NULL,
  s3_key          TEXT NOT NULL,
  file_name       VARCHAR(255),
  mime_type       VARCHAR(80),
  file_size_bytes BIGINT,
  status          doc_status_enum NOT NULL DEFAULT 'uploaded',
  reviewed_by     UUID REFERENCES system_users(id),
  reviewed_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_on      DATE,                     -- DL / bike insurance expiry
  metadata        JSONB DEFAULT '{}',       -- OCR extracted fields
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (worker_id, doc_type)
);
CREATE INDEX idx_worker_docs_worker    ON worker_documents (worker_id);
CREATE INDEX idx_worker_docs_status    ON worker_documents (status);
CREATE TRIGGER trg_worker_documents_updated_at
  BEFORE UPDATE ON worker_documents
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 3.5  worker_gps_checkins  — periodic location pings for claim validation
-- ---------------------------------------------------------------------------
CREATE TABLE worker_gps_checkins (
  id              BIGSERIAL PRIMARY KEY,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lat             NUMERIC(10,7) NOT NULL,
  lng             NUMERIC(10,7) NOT NULL,
  accuracy_meters NUMERIC(6,2),
  zone_id         UUID REFERENCES delivery_zones(id),
  app_state       VARCHAR(20),   -- foreground | background | offline
  is_spoofed      BOOLEAN,       -- filled by fraud engine
  spoofing_reason TEXT
) PARTITION BY RANGE (checked_at);
CREATE INDEX idx_gps_worker_time ON worker_gps_checkins (worker_id, checked_at DESC);

-- Monthly partitions (add more as needed)
CREATE TABLE worker_gps_checkins_2024_11 PARTITION OF worker_gps_checkins
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE worker_gps_checkins_2024_12 PARTITION OF worker_gps_checkins
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE worker_gps_checkins_2025_01 PARTITION OF worker_gps_checkins
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE worker_gps_checkins_2025_02 PARTITION OF worker_gps_checkins
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE worker_gps_checkins_2025_03 PARTITION OF worker_gps_checkins
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- =============================================================================
-- SECTION 4 — RISK PROFILING TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 4.1  risk_profiles  — AI-computed risk profiles per worker
-- ---------------------------------------------------------------------------
CREATE TABLE risk_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,

  -- Component scores (0-100)
  zone_flood_risk       NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_heat_risk        NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_aqi_risk         NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone_civic_risk       NUMERIC(5,2) NOT NULL DEFAULT 0,
  platform_density_risk NUMERIC(5,2) NOT NULL DEFAULT 0,
  delivery_hours_risk   NUMERIC(5,2) NOT NULL DEFAULT 0,  -- night shift = higher
  historical_freq_risk  NUMERIC(5,2) NOT NULL DEFAULT 0,  -- past disruptions

  -- Composite
  composite_risk_score  NUMERIC(5,2) NOT NULL,
  risk_tier             risk_tier_enum NOT NULL,

  -- Premium recommendation
  recommended_plan      plan_enum NOT NULL,
  recommended_premium   NUMERIC(8,2) NOT NULL,

  -- Model metadata
  model_version         VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  feature_vector        JSONB,             -- raw features sent to model
  model_output          JSONB,             -- raw model response
  calculated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until           TIMESTAMPTZ NOT NULL
                          DEFAULT (NOW() + INTERVAL '30 days'),
  is_current            BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_risk_profiles_worker ON risk_profiles (worker_id, is_current);

-- ---------------------------------------------------------------------------
-- 4.2  zone_risk_snapshots  — periodic zone-level risk captures (for heatmap)
-- ---------------------------------------------------------------------------
CREATE TABLE zone_risk_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  zone_id         UUID NOT NULL REFERENCES delivery_zones(id),
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  flood_score     NUMERIC(5,2),
  heat_score      NUMERIC(5,2),
  aqi_score       NUMERIC(5,2),
  civic_score     NUMERIC(5,2),
  composite_score NUMERIC(5,2),
  active_workers  INTEGER,
  active_policies INTEGER,
  raw_weather     JSONB,    -- raw API response snapshot
  raw_aqi         JSONB
) PARTITION BY RANGE (snapshot_at);
CREATE INDEX idx_zone_snapshots_zone_time ON zone_risk_snapshots (zone_id, snapshot_at DESC);

CREATE TABLE zone_risk_snapshots_2024_11 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE zone_risk_snapshots_2024_12 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE zone_risk_snapshots_2025_01 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE zone_risk_snapshots_2025_02 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE zone_risk_snapshots_2025_03 PARTITION OF zone_risk_snapshots
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- =============================================================================
-- SECTION 5 — POLICY TABLES
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

-- =============================================================================
-- SECTION 6 — DISRUPTION EVENTS
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

-- =============================================================================
-- SECTION 7 — CLAIMS
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

-- =============================================================================
-- SECTION 8 — FRAUD DETECTION
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 8.1  fraud_assessments  — per-claim fraud analysis result
-- ---------------------------------------------------------------------------
CREATE TABLE fraud_assessments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id              UUID NOT NULL UNIQUE REFERENCES claims(id) ON DELETE CASCADE,
  worker_id             UUID NOT NULL REFERENCES workers(id),

  -- Scores (0.0 – 1.0)
  overall_fraud_score   NUMERIC(5,4) NOT NULL,
  gps_spoof_score       NUMERIC(5,4) NOT NULL DEFAULT 0,
  duplicate_score       NUMERIC(5,4) NOT NULL DEFAULT 0,
  activity_anomaly_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  behavioral_anomaly_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  claim_freq_score      NUMERIC(5,4) NOT NULL DEFAULT 0,

  -- Decision
  decision              fraud_decision_enum NOT NULL,
  flags                 TEXT[],                           -- list of triggered flag codes
  model_version         VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  feature_vector        JSONB,
  model_output          JSONB,

  -- Manual override
  overridden            BOOLEAN NOT NULL DEFAULT FALSE,
  overridden_by         UUID REFERENCES system_users(id),
  override_decision     fraud_decision_enum,
  override_reason       TEXT,
  overridden_at         TIMESTAMPTZ,

  assessed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fraud_worker    ON fraud_assessments (worker_id);
CREATE INDEX idx_fraud_decision  ON fraud_assessments (decision);
CREATE INDEX idx_fraud_score     ON fraud_assessments (overall_fraud_score DESC);

-- ---------------------------------------------------------------------------
-- 8.2  fraud_flags  — catalog of fraud flag types
-- ---------------------------------------------------------------------------
CREATE TABLE fraud_flag_catalog (
  code            VARCHAR(40) PRIMARY KEY,
  description     TEXT NOT NULL,
  weight          NUMERIC(4,3) NOT NULL,    -- contribution to score
  auto_block      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fraud_flag_catalog (code, description, weight, auto_block) VALUES
  ('GPS_ZONE_MISMATCH',       'Worker GPS not in claimed disruption zone',         0.40, FALSE),
  ('GPS_TELEPORTATION',       'Physically impossible GPS movement detected',        0.80, TRUE),
  ('GPS_SPOOFING_DETECTED',   'Mock GPS / VPN-routed coordinates detected',         0.90, TRUE),
  ('DUPLICATE_CLAIM',         'Claim already submitted for same event',             1.00, TRUE),
  ('ACTIVE_DURING_DISRUPTION','Platform shows completed deliveries during event',   0.50, FALSE),
  ('BEHAVIORAL_ANOMALY',      'Isolation Forest anomaly score below threshold',     0.30, FALSE),
  ('EXCESS_CLAIM_FREQUENCY',  'Monthly claim count exceeds plan limit',             0.40, FALSE),
  ('POLICY_INACTIVE',         'Policy not active at time of disruption',            1.00, TRUE),
  ('PREMIUM_UNPAID',          'Last premium payment failed or pending',             0.70, FALSE),
  ('KYC_INCOMPLETE',          'Worker KYC not fully verified',                      1.00, TRUE),
  ('PLATFORM_ID_MISMATCH',    'Platform worker ID does not match registration',     0.60, FALSE),
  ('CLAIM_TIME_SUSPICIOUS',   'Claim filed within minutes of event creation',       0.20, FALSE);

-- ---------------------------------------------------------------------------
-- 8.3  worker_fraud_watch_history  — running watch list
-- ---------------------------------------------------------------------------
CREATE TABLE worker_fraud_watch_history (
  id              BIGSERIAL PRIMARY KEY,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  flagged_by      UUID REFERENCES system_users(id),
  reason          TEXT NOT NULL,
  fraud_score     NUMERIC(5,4),
  watch_level     VARCHAR(20) NOT NULL DEFAULT 'soft',  -- soft | hard | blacklisted
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by     UUID REFERENCES system_users(id),
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  flagged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fraud_watch_worker ON worker_fraud_watch_history (worker_id, resolved);

-- =============================================================================
-- SECTION 9 — PAYOUTS
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

-- =============================================================================
-- SECTION 10 — NOTIFICATIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 10.1  notifications  — all outbound messages
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id           UUID REFERENCES workers(id) ON DELETE SET NULL,
  recipient_phone     VARCHAR(15) NOT NULL,
  channel             notification_channel_enum NOT NULL,
  template_code       VARCHAR(60) NOT NULL,  -- e.g. CLAIM_TRIGGERED | PAYOUT_CREDITED | POLICY_RENEWED
  language            CHAR(2) NOT NULL DEFAULT 'en',

  -- Content
  subject             VARCHAR(200),
  body                TEXT NOT NULL,
  variables           JSONB DEFAULT '{}',   -- template variable substitutions

  -- Delivery
  status              notification_status_enum NOT NULL DEFAULT 'queued',
  provider            VARCHAR(30),          -- msg91 | twilio | whatsapp_business
  provider_message_id VARCHAR(120),
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,
  retry_count         SMALLINT NOT NULL DEFAULT 0,

  -- Context
  related_claim_id    UUID REFERENCES claims(id) ON DELETE SET NULL,
  related_policy_id   UUID REFERENCES policies(id) ON DELETE SET NULL,
  related_payout_id   UUID REFERENCES payouts(id) ON DELETE SET NULL,
  related_event_id    UUID REFERENCES disruption_events(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_worker  ON notifications (worker_id, created_at DESC);
CREATE INDEX idx_notifications_status  ON notifications (status);
CREATE INDEX idx_notifications_channel ON notifications (channel);

-- ---------------------------------------------------------------------------
-- 10.2  notification_templates  — localised message templates
-- ---------------------------------------------------------------------------
CREATE TABLE notification_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_code   VARCHAR(60) NOT NULL,
  channel         notification_channel_enum NOT NULL,
  language        CHAR(2) NOT NULL DEFAULT 'en',
  subject         VARCHAR(200),
  body            TEXT NOT NULL,
  variables_used  TEXT[],    -- e.g. {worker_name, payout_amount, disruption_type}
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_code, channel, language)
);
CREATE TRIGGER trg_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed core templates
INSERT INTO notification_templates (template_code, channel, language, subject, body, variables_used) VALUES
('REGISTRATION_OTP',     'sms',       'en', NULL,
 'Your GigShield OTP is {otp}. Valid for 10 minutes. Do not share.',
 ARRAY['{otp}']),

('KYC_APPROVED',         'whatsapp',  'en', NULL,
 'Hi {worker_name}! Your GigShield KYC is approved. You are now protected. Policy: {policy_number}',
 ARRAY['{worker_name}','{policy_number}']),

('POLICY_ACTIVATED',     'sms',       'en', NULL,
 'GigShield policy {policy_number} is ACTIVE. Plan: {plan}. Weekly premium: Rs {premium}. Stay safe!',
 ARRAY['{policy_number}','{plan}','{premium}']),

('POLICY_RENEWAL_REMINDER','sms',     'en', NULL,
 'GigShield: Your policy renews on {renewal_date}. Premium Rs {premium} will be debited. Keep UPI active.',
 ARRAY['{renewal_date}','{premium}']),

('DISRUPTION_ALERT',     'whatsapp',  'en', NULL,
 'ALERT: {disruption_type} detected in {zone_name}. Severity: {severity}. Your policy covers this. Stay safe!',
 ARRAY['{disruption_type}','{zone_name}','{severity}']),

('CLAIM_TRIGGERED',      'whatsapp',  'en', NULL,
 'Claim {claim_number} auto-raised for {disruption_type} on {date}. Processing payout of Rs {amount}.',
 ARRAY['{claim_number}','{disruption_type}','{date}','{amount}']),

('PAYOUT_CREDITED',      'whatsapp',  'en', NULL,
 'Rs {amount} credited to your {channel} ({upi_or_account}). Claim: {claim_number}. GigShield',
 ARRAY['{amount}','{channel}','{upi_or_account}','{claim_number}']),

('CLAIM_REJECTED',       'sms',       'en', NULL,
 'Claim {claim_number} could not be processed: {reason}. Contact support if you disagree.',
 ARRAY['{claim_number}','{reason}']),

('FRAUD_HOLD',           'sms',       'en', NULL,
 'Your claim {claim_number} is under manual review. We will update you within 48 hours.',
 ARRAY['{claim_number}']);

-- =============================================================================
-- SECTION 11 — ADMIN / AGENT MANAGEMENT
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

-- =============================================================================
-- SECTION 12 — AUDIT LOGS
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

-- =============================================================================
-- SECTION 13 — ANALYTICS SNAPSHOT TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 13.1  daily_analytics_snapshots  — pre-computed daily metrics for dashboards
-- ---------------------------------------------------------------------------
CREATE TABLE daily_analytics_snapshots (
  id                        BIGSERIAL PRIMARY KEY,
  snapshot_date             DATE NOT NULL UNIQUE,

  -- Policy metrics
  total_active_policies     INTEGER NOT NULL DEFAULT 0,
  new_policies_today        INTEGER NOT NULL DEFAULT 0,
  terminated_policies_today INTEGER NOT NULL DEFAULT 0,
  policies_basic            INTEGER NOT NULL DEFAULT 0,
  policies_standard         INTEGER NOT NULL DEFAULT 0,
  policies_pro              INTEGER NOT NULL DEFAULT 0,

  -- Premium metrics
  premiums_collected_inr    NUMERIC(12,2) NOT NULL DEFAULT 0,
  premiums_failed_inr       NUMERIC(12,2) NOT NULL DEFAULT 0,
  renewal_success_rate_pct  NUMERIC(5,2),

  -- Worker metrics
  total_registered_workers  INTEGER NOT NULL DEFAULT 0,
  kyc_verified_workers      INTEGER NOT NULL DEFAULT 0,
  new_registrations_today   INTEGER NOT NULL DEFAULT 0,

  -- Disruption metrics
  disruption_events_active  SMALLINT NOT NULL DEFAULT 0,
  disruption_events_resolved SMALLINT NOT NULL DEFAULT 0,
  zones_affected_count      SMALLINT NOT NULL DEFAULT 0,

  -- Claims metrics
  claims_triggered_today    INTEGER NOT NULL DEFAULT 0,
  claims_approved_today     INTEGER NOT NULL DEFAULT 0,
  claims_rejected_today     INTEGER NOT NULL DEFAULT 0,
  claims_manual_review      INTEGER NOT NULL DEFAULT 0,
  auto_trigger_rate_pct     NUMERIC(5,2),

  -- Payout metrics
  payouts_initiated_inr     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payouts_completed_inr     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payouts_failed_inr        NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_payout_inr            NUMERIC(8,2),
  payout_count              INTEGER NOT NULL DEFAULT 0,

  -- Fraud metrics
  fraud_flags_raised        INTEGER NOT NULL DEFAULT 0,
  fraud_auto_blocks         INTEGER NOT NULL DEFAULT 0,
  fraud_manual_reviews      INTEGER NOT NULL DEFAULT 0,

  -- Financial health
  loss_ratio_pct            NUMERIC(6,2),  -- (payouts / premiums) * 100

  computed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_daily_analytics_date ON daily_analytics_snapshots (snapshot_date DESC);

-- ---------------------------------------------------------------------------
-- 13.2  worker_weekly_summaries  — per-worker weekly stats
-- ---------------------------------------------------------------------------
CREATE TABLE worker_weekly_summaries (
  id                    BIGSERIAL PRIMARY KEY,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  week_start_date       DATE NOT NULL,
  week_end_date         DATE NOT NULL,
  plan                  plan_enum,
  premium_paid_inr      NUMERIC(8,2) NOT NULL DEFAULT 0,
  active_delivery_days  SMALLINT NOT NULL DEFAULT 0,
  disruption_days       SMALLINT NOT NULL DEFAULT 0,
  claims_triggered      SMALLINT NOT NULL DEFAULT 0,
  claims_paid           SMALLINT NOT NULL DEFAULT 0,
  payout_received_inr   NUMERIC(8,2) NOT NULL DEFAULT 0,
  income_protected_inr  NUMERIC(8,2) NOT NULL DEFAULT 0,  -- payout / estimated loss %
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (worker_id, week_start_date)
);
CREATE INDEX idx_worker_weekly_worker ON worker_weekly_summaries (worker_id, week_start_date DESC);

-- ---------------------------------------------------------------------------
-- 13.3  zone_disruption_heatmap  — aggregated for map visualization
-- ---------------------------------------------------------------------------
CREATE TABLE zone_disruption_heatmap (
  id              BIGSERIAL PRIMARY KEY,
  zone_id         UUID NOT NULL REFERENCES delivery_zones(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  disruption_type disruption_type_enum,    -- NULL = all types
  event_count     SMALLINT NOT NULL DEFAULT 0,
  total_hours     NUMERIC(7,2) NOT NULL DEFAULT 0,
  workers_hit     INTEGER NOT NULL DEFAULT 0,
  claims_raised   INTEGER NOT NULL DEFAULT 0,
  payout_inr      NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_severity    NUMERIC(3,2),
  heat_intensity  NUMERIC(5,2),            -- 0-100 normalised for map colour
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (zone_id, period_start, period_end, disruption_type)
);
CREATE INDEX idx_heatmap_zone_period ON zone_disruption_heatmap (zone_id, period_start DESC);

-- =============================================================================
-- SECTION 14 — TRIGGERS FOR BUSINESS LOGIC
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 14.1  Auto-update worker.risk_score when risk_profile is inserted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_worker_risk_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Mark old profiles as not current
  UPDATE risk_profiles
     SET is_current = FALSE
   WHERE worker_id = NEW.worker_id
     AND id <> NEW.id;

  -- Sync score back to worker row
  UPDATE workers
     SET risk_score          = NEW.composite_risk_score,
         risk_tier           = NEW.risk_tier,
         risk_calculated_at  = NEW.calculated_at
   WHERE id = NEW.worker_id;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_sync_worker_risk_score
  AFTER INSERT ON risk_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_sync_worker_risk_score();

-- ---------------------------------------------------------------------------
-- 14.2  Auto-activate worker when KYC reaches 'verified'
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_activate_worker_on_kyc()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.kyc_status = 'verified' AND OLD.kyc_status <> 'verified' THEN
    UPDATE workers SET is_active = TRUE WHERE id = NEW.id;
  END IF;
  IF NEW.kyc_status = 'suspended' THEN
    UPDATE workers SET is_active = FALSE WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_activate_worker_on_kyc
  AFTER UPDATE OF kyc_status ON workers
  FOR EACH ROW EXECUTE FUNCTION fn_activate_worker_on_kyc();

-- ---------------------------------------------------------------------------
-- 14.3  Update disruption_events counts when a claim is inserted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_event_claim_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE disruption_events
     SET claims_triggered_count = claims_triggered_count + 1
   WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_update_event_claim_count
  AFTER INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_update_event_claim_count();

-- ---------------------------------------------------------------------------
-- 14.4  Update disruption_events total_payout_inr when payout completes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_event_payout_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_event_id UUID;
BEGIN
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status <> 'success') THEN
    SELECT c.event_id INTO v_event_id
      FROM claims c WHERE c.id = NEW.claim_id;

    UPDATE disruption_events
       SET total_payout_inr = total_payout_inr + NEW.amount_inr
     WHERE id = v_event_id;

    -- Update policy totals
    UPDATE policies
       SET total_payouts_issued = total_payouts_issued + NEW.amount_inr
     WHERE id = NEW.policy_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_update_event_payout_total
  AFTER UPDATE OF status ON payouts
  FOR EACH ROW EXECUTE FUNCTION fn_update_event_payout_total();

-- ---------------------------------------------------------------------------
-- 14.5  Update policy total_premiums_paid when premium payment succeeds
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_policy_premium_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status <> 'success') THEN
    UPDATE policies
       SET total_premiums_paid = total_premiums_paid + NEW.amount,
           last_renewed_on     = NEW.week_start_date,
           next_renewal_due    = NEW.week_start_date + INTERVAL '7 days',
           status              = CASE WHEN status = 'grace_period' THEN 'active' ELSE status END
     WHERE id = NEW.policy_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_update_policy_premium_total
  AFTER UPDATE OF status ON premium_payments
  FOR EACH ROW EXECUTE FUNCTION fn_update_policy_premium_total();

-- ---------------------------------------------------------------------------
-- 14.6  Log policy state changes automatically
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_log_policy_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.plan IS DISTINCT FROM NEW.plan THEN
    INSERT INTO policy_change_log
      (policy_id, change_type, old_status, new_status, old_plan, new_plan)
    VALUES
      (NEW.id,
       CASE
         WHEN NEW.status = 'active'    AND OLD.status = 'draft'         THEN 'activated'
         WHEN NEW.status = 'active'    AND OLD.status = 'grace_period'  THEN 'reinstated'
         WHEN NEW.status = 'suspended'                                   THEN 'suspended'
         WHEN NEW.status = 'terminated'                                  THEN 'terminated'
         WHEN OLD.plan IS DISTINCT FROM NEW.plan                         THEN 'plan_changed'
         ELSE 'updated'
       END,
       OLD.status, NEW.status, OLD.plan, NEW.plan);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_log_policy_change
  AFTER UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION fn_log_policy_change();

-- ---------------------------------------------------------------------------
-- 14.7  Prevent claims on non-active policies (enforcement at DB level)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validate_claim_policy()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_policy_status policy_status_enum;
BEGIN
  SELECT status INTO v_policy_status FROM policies WHERE id = NEW.policy_id;
  IF v_policy_status NOT IN ('active') THEN
    RAISE EXCEPTION 'Cannot create claim: policy % is in status %',
      NEW.policy_id, v_policy_status;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_claim_policy
  BEFORE INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_validate_claim_policy();

-- =============================================================================
-- SECTION 15 — VIEWS (for application & reporting use)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 15.1  v_active_worker_policies  — single query for worker dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_worker_policies AS
SELECT
  w.id                    AS worker_id,
  w.gigshield_id,
  w.full_name,
  w.phone,
  w.primary_platform,
  w.home_zone_id,
  dz.zone_name,
  dz.city,
  p.id                    AS policy_id,
  p.policy_number,
  p.plan,
  p.status                AS policy_status,
  p.weekly_premium,
  p.effective_from,
  p.next_renewal_due,
  p.total_premiums_paid,
  p.total_payouts_issued,
  p.max_payout_per_week,
  p.covered_disruptions,
  p.auto_renew,
  w.risk_score,
  w.risk_tier
FROM workers w
JOIN policies p ON p.worker_id = w.id AND p.status IN ('active','grace_period')
LEFT JOIN delivery_zones dz ON dz.id = w.home_zone_id
WHERE w.is_active = TRUE;

-- ---------------------------------------------------------------------------
-- 15.2  v_claim_full_detail  — full claim pipeline status
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_claim_full_detail AS
SELECT
  c.id                    AS claim_id,
  c.claim_number,
  c.worker_id,
  w.gigshield_id,
  w.full_name,
  w.phone,
  w.primary_platform,
  c.policy_id,
  p.policy_number,
  p.plan                  AS policy_plan,
  c.event_id,
  de.event_code,
  de.disruption_type,
  c.severity,
  c.disruption_date,
  dz.zone_name            AS disruption_zone,
  dz.city                 AS disruption_city,
  c.status                AS claim_status,
  c.source                AS claim_source,
  c.payout_amount,
  c.all_validations_passed,
  c.gps_zone_match,
  fa.overall_fraud_score,
  fa.decision             AS fraud_decision,
  fa.flags                AS fraud_flags,
  py.payout_number,
  py.status               AS payout_status,
  py.channel              AS payout_channel,
  py.completed_at         AS payout_completed_at,
  c.created_at            AS claim_created_at
FROM claims c
JOIN workers w            ON w.id = c.worker_id
JOIN policies p           ON p.id = c.policy_id
JOIN disruption_events de ON de.id = c.event_id
JOIN delivery_zones dz    ON dz.id = c.disruption_zone_id
LEFT JOIN fraud_assessments fa ON fa.claim_id = c.id
LEFT JOIN payouts py       ON py.claim_id = c.id;

-- ---------------------------------------------------------------------------
-- 15.3  v_admin_dashboard_summary  — top-line KPIs for admin
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_admin_dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM policies WHERE status = 'active')           AS active_policies,
  (SELECT COUNT(*) FROM workers WHERE kyc_status = 'verified')      AS verified_workers,
  (SELECT COUNT(*) FROM workers WHERE kyc_status = 'under_review')  AS pending_kyc,
  (SELECT COUNT(*) FROM disruption_events WHERE status = 'active')  AS active_disruptions,
  (SELECT COUNT(*) FROM claims WHERE disruption_date = CURRENT_DATE) AS claims_today,
  (SELECT COALESCE(SUM(amount_inr),0) FROM payouts
    WHERE status = 'success'
      AND DATE(completed_at) = CURRENT_DATE)                         AS payouts_today_inr,
  (SELECT COUNT(*) FROM fraud_assessments
    WHERE decision IN ('hard_flag','blocked')
      AND DATE(assessed_at) = CURRENT_DATE)                          AS fraud_blocks_today,
  (SELECT COUNT(*) FROM verification_queue
    WHERE status = 'pending')                                        AS pending_review_queue;

-- ---------------------------------------------------------------------------
-- 15.4  v_fraud_alert_feed  — real-time fraud alerts for admin dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_fraud_alert_feed AS
SELECT
  fa.id               AS assessment_id,
  fa.claim_id,
  c.claim_number,
  c.worker_id,
  w.gigshield_id,
  w.full_name,
  w.phone,
  fa.overall_fraud_score,
  fa.decision,
  fa.flags,
  fa.overridden,
  c.payout_amount,
  c.disruption_type,
  c.disruption_date,
  fa.assessed_at
FROM fraud_assessments fa
JOIN claims c ON c.id = fa.claim_id
JOIN workers w ON w.id = fa.claim_id
WHERE fa.decision IN ('soft_flag','hard_flag','blocked')
  AND fa.overridden = FALSE
ORDER BY fa.overall_fraud_score DESC, fa.assessed_at DESC;

-- ---------------------------------------------------------------------------
-- 15.5  v_zone_live_risk  — current risk status of all zones (for heatmap)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_zone_live_risk AS
SELECT
  dz.id           AS zone_id,
  dz.zone_code,
  dz.zone_name,
  dz.city,
  dz.state_code,
  dz.centroid_lat,
  dz.centroid_lng,
  dz.composite_risk_score,
  (SELECT COUNT(*) FROM policies p
   JOIN workers w ON w.id = p.worker_id
   WHERE w.home_zone_id = dz.id AND p.status = 'active')    AS active_policies,
  (SELECT COUNT(*) FROM disruption_events de
   WHERE dz.id = ANY(de.affected_zone_ids) AND de.status = 'active') AS active_events,
  (SELECT de.disruption_type FROM disruption_events de
   WHERE dz.id = ANY(de.affected_zone_ids) AND de.status = 'active'
   ORDER BY de.detected_at DESC LIMIT 1)                     AS latest_disruption_type,
  dz.is_active
FROM delivery_zones dz;

-- ---------------------------------------------------------------------------
-- 15.6  v_worker_claim_history  — worker's personal claim timeline
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_worker_claim_history AS
SELECT
  c.worker_id,
  c.claim_number,
  c.disruption_type,
  c.severity,
  c.disruption_date,
  c.status          AS claim_status,
  c.payout_amount,
  py.status         AS payout_status,
  py.completed_at   AS credited_at,
  py.channel        AS paid_via,
  c.source          AS claim_source,
  fa.overall_fraud_score,
  c.rejection_reason,
  c.created_at
FROM claims c
LEFT JOIN payouts py           ON py.claim_id = c.id
LEFT JOIN fraud_assessments fa ON fa.claim_id = c.id
ORDER BY c.disruption_date DESC;

-- =============================================================================
-- SECTION 16 — SEED DATA (cities & zones for demo)
-- =============================================================================

INSERT INTO delivery_zones
  (zone_code, zone_name, city, state, state_code,
   centroid_lat, centroid_lng,
   flood_risk_score, heat_risk_score, aqi_risk_score, civic_risk_score)
VALUES
  ('mumbai_andheri',    'Andheri',         'Mumbai',    'Maharashtra',    'MH', 19.1136, 72.8697, 75, 45, 60, 40),
  ('mumbai_bandra',     'Bandra',          'Mumbai',    'Maharashtra',    'MH', 19.0596, 72.8295, 70, 43, 58, 38),
  ('mumbai_dadar',      'Dadar',           'Mumbai',    'Maharashtra',    'MH', 19.0178, 72.8478, 72, 44, 62, 42),
  ('mumbai_kurla',      'Kurla',           'Mumbai',    'Maharashtra',    'MH', 19.0728, 72.8826, 78, 46, 65, 45),
  ('mumbai_thane',      'Thane',           'Mumbai',    'Maharashtra',    'MH', 19.2183, 72.9781, 68, 47, 55, 30),
  ('delhi_connaught',   'Connaught Place', 'Delhi',     'Delhi',          'DL', 28.6315, 77.2167, 40, 82, 90, 55),
  ('delhi_rohini',      'Rohini',          'Delhi',     'Delhi',          'DL', 28.7041, 77.1025, 38, 85, 92, 50),
  ('delhi_dwarka',      'Dwarka',          'Delhi',     'Delhi',          'DL', 28.5921, 77.0460, 35, 83, 88, 45),
  ('bengaluru_koramangala','Koramangala',  'Bengaluru', 'Karnataka',      'KA', 12.9279, 77.6271, 30, 35, 50, 40),
  ('bengaluru_hsr',     'HSR Layout',      'Bengaluru', 'Karnataka',      'KA', 12.9116, 77.6389, 28, 34, 48, 35),
  ('bengaluru_whitefield','Whitefield',    'Bengaluru', 'Karnataka',      'KA', 12.9698, 77.7500, 25, 36, 52, 30),
  ('chennai_tnagar',    'T. Nagar',        'Chennai',   'Tamil Nadu',     'TN', 13.0418, 80.2341, 55, 65, 55, 35),
  ('chennai_velachery',  'Velachery',      'Chennai',   'Tamil Nadu',     'TN', 12.9815, 80.2209, 60, 68, 58, 32),
  ('hyderabad_hitech',  'HITEC City',      'Hyderabad', 'Telangana',      'TS', 17.4435, 78.3772, 35, 70, 60, 30),
  ('hyderabad_secunderabad','Secunderabad','Hyderabad', 'Telangana',      'TS', 17.4399, 78.4983, 38, 72, 62, 35),
  ('kolkata_salt_lake', 'Salt Lake',       'Kolkata',   'West Bengal',    'WB', 22.5729, 88.4195, 80, 42, 70, 48),
  ('kolkata_howrah',    'Howrah',          'Kolkata',   'West Bengal',    'WB', 22.5958, 88.2636, 82, 40, 68, 50),
  ('pune_kothrud',      'Kothrud',         'Pune',      'Maharashtra',    'MH', 18.5018, 73.8071, 45, 48, 45, 30),
  ('pune_hinjewadi',    'Hinjewadi',       'Pune',      'Maharashtra',    'MH', 18.5912, 73.7389, 40, 50, 42, 25),
  ('ahmedabad_sg_highway','SG Highway',   'Ahmedabad', 'Gujarat',        'GJ', 23.0395, 72.5262, 25, 88, 72, 32);

-- =============================================================================
-- SECTION 17 — PERMISSIONS (role-based)
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

-- =============================================================================
-- SECTION 18 — SCHEMA VERSION TRACKING
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

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================

COMMIT;

-- Post-migration verification queries (run manually to confirm)
-- SELECT COUNT(*) FROM delivery_zones;          → 20
-- SELECT COUNT(*) FROM plan_configs;            → 3
-- SELECT COUNT(*) FROM disruption_thresholds;   → 22
-- SELECT COUNT(*) FROM notification_templates;  → 9
-- SELECT COUNT(*) FROM fraud_flag_catalog;      → 12
-- SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
