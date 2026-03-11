-- =============================================================================
-- GigShield — Business Logic Triggers
-- File:    014_triggers.sql
-- DB:      PostgreSQL 14+
-- Depends: 003_user_identity.sql, 004_risk_profiling.sql, 005_policies.sql,
--          006_disruption_events.sql, 007_claims.sql, 009_payouts.sql
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
