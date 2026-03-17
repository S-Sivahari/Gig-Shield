import React from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import './RegSteps.css';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const Step5Payment: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary">
          Complete registration
        </Button>
      </div>
    </form>
  );
};
