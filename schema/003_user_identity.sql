-- =============================================================================
-- GigShield — User & Identity Tables
-- File:    003_user_identity.sql
-- DB:      PostgreSQL 14+
-- Depends: 001_enumerations.sql, 002_reference_tables.sql
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
  vehicle_type          VARCHAR(20) CHECK (vehicle_type IN ('2-wheeler', '4-wheeler')),
  has_safety_gear       BOOLEAN NOT NULL DEFAULT FALSE,           -- waterproof equipment
  weekly_income_goal    NUMERIC(10,2),                            -- ₹ target per week (Earn-Lock input)

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
