-- =============================================================================
-- GigShield — Views
-- File:    015_views.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql, 005_policies.sql, 006_disruption_events.sql,
--          007_claims.sql, 008_fraud_detection.sql, 009_payouts.sql, 011_admin.sql
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
