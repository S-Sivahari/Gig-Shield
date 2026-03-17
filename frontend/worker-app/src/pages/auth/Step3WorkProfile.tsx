import React, { useRef } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Upload } from 'lucide-react';
import './UploadBox.css';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const Step3WorkProfile: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const fileInputRefWork = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const platforms = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Amazon', 'Flipkart', 'Dunzo'];
  const hoursOptions = ['4–6 hrs', '6–8 hrs', '8–10 hrs', '10+ hrs'];

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        
        <div className="gs-input-container">
          <label className="gs-form-label">Delivery platform</label>
          <div className="gs-input-wrapper">
            <select 
              className="gs-input"
              value={data.platform || ''}
              onChange={(e) => updateData({ platform: e.target.value })}
              required
            >
              <option value="" disabled>Select primary platform</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Work proof (ID card or App screenshot)</label>
          <div 
            className="gs-upload-box"
            onClick={() => fileInputRefWork.current?.click()}
          >
            <Upload className="gs-upload-icon" size={24} />
            <span className="gs-upload-text">Upload work proof</span>
            <input 
              type="file" 
              ref={fileInputRefWork} 
              style={{ display: 'none' }} 
              accept="image/*"
            />
          </div>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Average working hours per day</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hoursOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant="pill"
                selected={data.avgHours === opt}
                onClick={() => updateData({ avgHours: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        <Input 
          label="Primary delivery zone"
          placeholder="e.g. Koramangala, Bangalore"
          value={data.primaryZone || ''}
          onChange={(e) => updateData({ primaryZone: e.target.value })}
          required
        />

        <Input 
          label="Experience on platform (months)"
          type="number"
          placeholder="e.g. 14"
          value={data.experienceMonths || ''}
          onChange={(e) => updateData({ experienceMonths: e.target.value })}
          required
        />

      </div>

      <div className="gs-step-footer">
        <p className="gs-ai-note">⭐ This powers your AI risk score</p>
        <Button type="submit" variant="primary">
          Next — income details
        </Button>
      </div>
    </form>
  );
};
