import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Info } from 'lucide-react';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const Step4Income: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [estimatedPayout, setEstimatedPayout] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const daysOptions = ['5', '6', '7'];
  const coverageOptions = ['50%', '70%', '90%'];

  useEffect(() => {
    // Calculate estimated payout
    const income = Number(data.weeklyIncome) || 0;
    const coverage = data.coveragePercent ? Number(data.coveragePercent.replace('%', '')) / 100 : 0.7;
    setEstimatedPayout(Math.floor(income * coverage));
  }, [data.weeklyIncome, data.coveragePercent]);

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        
        <Card variant="blue" className="gs-mb-4">
          <div style={{ display: 'flex', gap: '12px' }}>
            <Info size={20} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500, marginBottom: '4px' }}>
                Why do we ask this?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Your declared income determines your weekly payout if a disruption halts your work. We verify this against platform data.
              </p>
            </div>
          </div>
        </Card>

        <Input 
          label="Average weekly earnings (₹)"
          type="number"
          placeholder="e.g. 4800"
          value={data.weeklyIncome || ''}
          onChange={(e) => updateData({ weeklyIncome: e.target.value })}
          required
        />

        <div className="gs-input-container">
          <label className="gs-form-label">Typical working days per week</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {daysOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant="pill"
                selected={data.workingDays === opt}
                onClick={() => updateData({ workingDays: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Coverage percentage desired</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {coverageOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant="pill"
                selected={data.coveragePercent === opt}
                onClick={() => updateData({ coveragePercent: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {data.weeklyIncome && (
          <div className="gs-live-preview animate-scale-in">
            <span className="gs-preview-label">Estimated weekly payout:</span>
            <span className="gs-preview-value">₹{estimatedPayout.toLocaleString()}</span>
            <span className="gs-preview-subtext">
              — {data.coveragePercent || '70%'} of ₹{Number(data.weeklyIncome).toLocaleString()} on a disruption day
            </span>
          </div>
        )}

      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary">
          Next — payment setup
        </Button>
      </div>
    </form>
  );
};
