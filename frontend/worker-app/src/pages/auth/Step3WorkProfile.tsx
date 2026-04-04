import React, { useRef } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Upload, Bike, Car } from 'lucide-react';
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

const DEFAULT_AREAS = ['Central', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];

const CITY_AREAS: Record<string, string[]> = {
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Borivali', 'Dadar', 'Kurla'],
  Delhi: ['Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Lajpat Nagar', 'Mayur Vihar'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'BTM Layout', 'Jayanagar'],
  Hyderabad: ['Gachibowli', 'Madhapur', 'Kukatpally', 'Banjara Hills', 'Kondapur', 'Secunderabad'],
  Chennai: ['T. Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'Tambaram', 'OMR'],
  Kolkata: ['Salt Lake', 'New Town', 'Howrah', 'Park Street', 'Dum Dum', 'Garia'],
  Pune: ['Hinjewadi', 'Kothrud', 'Baner', 'Viman Nagar', 'Hadapsar', 'Wakad'],
  Ahmedabad: ['Navrangpura', 'Satellite', 'Maninagar', 'Bopal', 'Vastrapur', 'Naranpura'],
};

export const Step3WorkProfile: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const fileInputRefWork = useRef<HTMLInputElement>(null);
  const areaOptions = CITY_AREAS[data.city || ''] || DEFAULT_AREAS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.vehicleType) {
      alert('Please select your vehicle type.');
      return;
    }
    onNext();
  };

  const platforms = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Amazon', 'Flipkart', 'Dunzo'];
  const personas = [
    { value: 'courier', label: 'Courier' },
    { value: 'shopper', label: 'Grocery runner' },
    { value: 'rideshare', label: 'Ride-share support' },
    { value: 'helper', label: 'Multi-task helper' },
  ];
  const avgHoursValue = Number(data.avgHours) || 8;

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
              onChange={(e) => {
                const nextCity = e.target.value;
                const nextAreas = CITY_AREAS[nextCity] || DEFAULT_AREAS;
                const shouldResetArea = data.primaryZone && !nextAreas.includes(data.primaryZone);
                updateData({ city: nextCity, primaryZone: shouldResetArea ? '' : data.primaryZone });
              }}
              required
            >
              <option value="" disabled>Select your city</option>
              {INDIAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="gs-hint-text">
            Area options below are linked to this city.
          </p>
        </div>

        {/* ── Vehicle Type ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Vehicle type</label>
          <div className="gs-vehicle-grid">
            <button
              type="button"
              className={`gs-vehicle-card ${data.vehicleType === '2-wheeler' ? 'gs-vehicle-card--active' : ''}`}
              onClick={() => updateData({ vehicleType: '2-wheeler' })}
            >
              <Bike size={28} />
              <span>2-Wheeler</span>
            </button>
            <button
              type="button"
              className={`gs-vehicle-card ${data.vehicleType === '4-wheeler' ? 'gs-vehicle-card--active' : ''}`}
              onClick={() => updateData({ vehicleType: '4-wheeler' })}
            >
              <Car size={28} />
              <span>4-Wheeler</span>
            </button>
          </div>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Safety gear</label>
          <div className="gs-toggle-inline">
            <Button
              type="button"
              variant="pill"
              selected={Boolean(data.safetyGearBool)}
              onClick={() => updateData({ safetyGearBool: true })}
            >
              Yes, equipped
            </Button>
            <Button
              type="button"
              variant="pill"
              selected={!Boolean(data.safetyGearBool)}
              onClick={() => updateData({ safetyGearBool: false })}
            >
              No gear
            </Button>
          </div>
          <p className="gs-hint-text">Raincoat and waterproof bag unlock a 5% premium discount.</p>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Work persona</label>
          <div className="gs-input-wrapper">
            <select
              className="gs-input"
              value={data.persona || 'courier'}
              onChange={(e) => updateData({ persona: e.target.value })}
            >
              {personas.map((persona) => (
                <option key={persona.value} value={persona.value}>{persona.label}</option>
              ))}
            </select>
          </div>
          <p className="gs-hint-text">
            Helps tune premium behavior to your delivery pattern.
          </p>
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
          <div className="gs-hours-slider-wrap">
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={avgHoursValue}
              className="gs-hours-slider"
              onChange={(e) => updateData({ avgHours: e.target.value })}
            />
            <input
              type="number"
              min="1"
              max="16"
              value={avgHoursValue}
              className="gs-hours-input"
              onChange={(e) => updateData({ avgHours: e.target.value })}
            />
          </div>
          <p className="gs-hint-text">
            Use slider or type exact hours.
          </p>
        </div>

        <div className="gs-input-container">
          <label className="gs-form-label">Operational zone (neighbourhood)</label>
          <div className="gs-input-wrapper">
            <select
              className="gs-input"
              value={data.primaryZone || ''}
              onChange={(e) => updateData({ primaryZone: e.target.value })}
              required
            >
              <option value="" disabled>
                {data.city ? `Select area in ${data.city}` : 'Select your city first'}
              </option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

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
