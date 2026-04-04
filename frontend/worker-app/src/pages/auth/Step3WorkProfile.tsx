import React, { useRef } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Upload, Bike, Car, Shield } from 'lucide-react';
import './UploadBox.css';
import './RegSteps.css';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kochi', 'Nagpur', 'Indore', 'Bhopal',
  'Patna', 'Vadodara', 'Coimbatore', 'Vizag', 'Thiruvananthapuram',
];

export const Step3WorkProfile: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const fileInputRefWork = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.vehicleType) {
      alert('Please select your vehicle type.');
      return;
    }
    onNext();
  };

  const platforms = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Amazon', 'Flipkart', 'Dunzo'];
  const hoursOptions = ['4–6 hrs', '6–8 hrs', '8–10 hrs', '10+ hrs'];

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">

        {/* ── Delivery Platform ── */}
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

        {/* ── City / Location ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Current city</label>
          <div className="gs-input-wrapper">
            <select
              className="gs-input"
              value={data.city || ''}
              onChange={(e) => updateData({ city: e.target.value })}
              required
            >
              <option value="" disabled>Select your city</option>
              {INDIAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            🌤️ Used to fetch live weather for real-time risk pricing
          </p>
        </div>

        {/* ── Vehicle Type ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Vehicle type</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className={`gs-vehicle-card ${data.vehicleType === '2-wheeler' ? 'gs-vehicle-card--active' : ''}`}
              onClick={() => updateData({ vehicleType: '2-wheeler' })}
            >
              <Bike size={28} />
              <span>2-Wheeler</span>
              <span style={{ fontSize: '11px', color: data.vehicleType === '2-wheeler' ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                +20% risk factor
              </span>
            </button>
            <button
              type="button"
              className={`gs-vehicle-card ${data.vehicleType === '4-wheeler' ? 'gs-vehicle-card--active' : ''}`}
              onClick={() => updateData({ vehicleType: '4-wheeler' })}
            >
              <Car size={28} />
              <span>4-Wheeler</span>
              <span style={{ fontSize: '11px', color: data.vehicleType === '4-wheeler' ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                −10% risk factor
              </span>
            </button>
          </div>
        </div>

        {/* ── Safety / Waterproof Gear ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">
            <Shield size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Waterproof safety equipment
          </label>
          <div className="gs-safety-toggle-row">
            <div
              className={`gs-safety-option ${data.hasSafetyGear === true ? 'gs-safety-option--yes' : ''}`}
              onClick={() => updateData({ hasSafetyGear: true })}
            >
              <span className="gs-safety-emoji">🧥</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>Yes, I use it</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>−5% premium discount</p>
              </div>
            </div>
            <div
              className={`gs-safety-option ${data.hasSafetyGear === false ? 'gs-safety-option--no' : ''}`}
              onClick={() => updateData({ hasSafetyGear: false })}
            >
              <span className="gs-safety-emoji">❌</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>No</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard pricing</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Work Proof Upload ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Work proof (ID card or App screenshot)</label>
          <div
            className="gs-upload-box"
            onClick={() => fileInputRefWork.current?.click()}
          >
            <Upload className="gs-upload-icon" size={24} />
            <span className="gs-upload-text">
              {data.workProofName ? `✓ ${data.workProofName}` : 'Upload work proof'}
            </span>
            <input
              type="file"
              ref={fileInputRefWork}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  updateData({ workProofName: e.target.files[0].name });
                }
              }}
            />
          </div>
        </div>

        {/* ── Working Hours ── */}
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

        {/* ── Zone ── */}
        <Input
          label="Primary delivery zone (neighbourhood)"
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
        <p className="gs-ai-note">⭐ Location + vehicle data powers your live risk score</p>
        <Button type="submit" variant="primary">
          Next — income details
        </Button>
      </div>
    </form>
  );
};
