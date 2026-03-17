import React from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const Step1Personal: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        <Input 
          label="Full name"
          placeholder="e.g. Ramesh Kumar"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          required
        />
        
        <div className="gs-row-2col">
          <Input 
            label="Age"
            type="number"
            placeholder="e.g. 28"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            required
          />
          <div className="gs-input-container">
            <label className="gs-input-label">Gender</label>
            <div className="gs-input-wrapper">
              <select 
                className="gs-input"
                value={data.gender}
                onChange={(e) => updateData({ gender: e.target.value })}
                required
              >
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <Input 
          label="Mobile number"
          value="+91 99****8291"
          readOnly
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        />

        <Input 
          label="Email ID"
          type="email"
          placeholder="ramesh@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          required
        />
      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary">
          Next — identity verification
        </Button>
      </div>
    </form>
  );
};
