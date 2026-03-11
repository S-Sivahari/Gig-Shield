-- =============================================================================
-- GigShield — Notifications
-- File:    010_notifications.sql
-- DB:      PostgreSQL 14+
-- Depends: 007_claims.sql, 009_payouts.sql
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
