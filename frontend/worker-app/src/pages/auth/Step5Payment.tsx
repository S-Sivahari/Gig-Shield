import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import './RegSteps.css';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

const POLICY_CONTENT = [
  {
    title: 'Coverage scope',
    body: 'GigShield provides parametric income relief for registered delivery workers when covered disruptions are detected in the declared operating zone and policy conditions are satisfied.',
  },
  {
    title: 'Trigger model',
    body: 'Relief is auto-initiated when configured disruption thresholds are crossed and zone eligibility checks pass. This is an automated workflow and does not require manual claim filing.',
  },
  {
    title: 'Eligibility conditions',
    body: 'Policy holder details, operating zone, and payout details must be accurate and up to date. Protection applies only during active policy weeks.',
  },
  {
    title: 'Payout basis',
    body: 'Payouts are relief-based and may be lower than estimated income loss. Amounts are calculated with plan tier limits, risk controls, and event caps.',
  },
  {
    title: 'Exclusions - war and pandemic',
    body: 'Losses caused by war, armed conflict, invasion, rebellion, and civil war are not covered. Losses caused by pandemic, epidemic, public health emergency, or lockdown are not covered.',
  },
  {
    title: 'Fraud and misuse',
    body: 'Attempts to manipulate identity, zone, or telemetry data may result in claim rejection, policy suspension, and legal action.',
  },
];

export const Step5Payment: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const canProceed = Boolean(data.policyAccepted);

  const policyModal = showPolicyModal && typeof document !== 'undefined'
    ? createPortal(
      <div className="gs-policy-modal-overlay" onClick={() => setShowPolicyModal(false)}>
        <div className="gs-policy-modal" onClick={(e) => e.stopPropagation()}>
          <div className="gs-policy-modal-head">
            <h4>Policy Terms and Exclusions</h4>
            <button type="button" className="gs-policy-close" onClick={() => setShowPolicyModal(false)}>
              Close
            </button>
          </div>

          <div className="gs-policy-modal-body">
            {POLICY_CONTENT.map((section) => (
              <section key={section.title} className="gs-policy-section">
                <h5>{section.title}</h5>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          <label className="gs-policy-accept-row">
            <input
              type="checkbox"
              checked={Boolean(data.policyAccepted)}
              onChange={(e) => updateData({ policyAccepted: e.target.checked })}
            />
            <span>I have read and agree to all policy terms and conditions.</span>
          </label>

          <div className="gs-policy-modal-footer">
            <Button
              type="button"
              variant="primary"
              disabled={!data.policyAccepted}
              onClick={() => setShowPolicyModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) {
      alert('Please open the policy popup and accept all policies to continue.');
      return;
    }
    onNext();
  };

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Payout Details</h3>
        <Input
          label="UPI ID (for payouts)"
          placeholder="e.g. ramesh@okicici"
          value={data.upiId || ''}
          onChange={(e) => updateData({ upiId: e.target.value })}
          required
        />

        <Input
          label="Bank Account Number (Optional)"
          type="password"
          placeholder="Enter account number"
          value={data.accountNo || ''}
          onChange={(e) => updateData({ accountNo: e.target.value })}
        />

        <Input
          label="IFSC Code (Optional)"
          placeholder="e.g. SBIN0001234"
          value={data.ifscCode || ''}
          onChange={(e) => updateData({ ifscCode: e.target.value.toUpperCase() })}
          maxLength={11}
        />

        <div className="gs-divider" style={{ margin: '24px 0' }} />

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Account Setup</h3>

        <Input
          label="Choose login ID"
          placeholder="e.g. rameshkumar1"
          value={data.loginId || ''}
          onChange={(e) => updateData({ loginId: e.target.value })}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create password"
          value={data.password || ''}
          onChange={(e) => updateData({ password: e.target.value })}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={data.confirmPassword || ''}
          onChange={(e) => updateData({ confirmPassword: e.target.value })}
          required
        />

        <div className="gs-divider" style={{ margin: '20px 0 8px' }} />

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Policy Consent</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Read policy contents in popup and accept before activation.
        </p>

        <div className="gs-policy-actions-row">
          <Button type="button" variant="outline" onClick={() => setShowPolicyModal(true)}>
            View policy content
          </Button>
        </div>
      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary" disabled={!canProceed}>
          Complete registration
        </Button>
      </div>

      {policyModal}
    </form>
  );
};
