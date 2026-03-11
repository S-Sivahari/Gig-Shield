-- =============================================================================
-- GigShield — Enumerations
-- File:    001_enumerations.sql
-- DB:      PostgreSQL 14+
-- Depends: 000_extensions_and_helpers.sql
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
