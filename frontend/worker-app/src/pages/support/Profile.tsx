import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Edit2, LogOut, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInsurance } from '../../context/InsuranceContext';
import './Profile.css';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kochi', 'Nagpur', 'Indore', 'Bhopal',
  'Patna', 'Vadodara', 'Coimbatore', 'Vizag', 'Thiruvananthapuram',
];

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    registrationData,
    updateRegistrationData,
    updateWorkerProfile,
    plans,
    selectedPlanId,
    selectPlan,
  } = useInsurance();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(registrationData);

  useEffect(() => {
    if (!isEditing) {
      setFormData(registrationData);
    }
  }, [registrationData, isEditing]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? plans[1],
    [plans, selectedPlanId],
  );

  const userName = registrationData.fullName || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleSave = () => {
    updateRegistrationData(formData);
    updateWorkerProfile({
      income: Number(formData.weeklyIncome) || 0,
      city: formData.city || 'Mumbai',
      zone: formData.primaryZone || formData.city || 'Default zone',
      vehicle: formData.vehicleType || '',
      persona: formData.persona || 'courier',
      safetyGearBool: Boolean(formData.safetyGearBool),
    });

    if (formData.selectedPlan) {
      selectPlan(formData.selectedPlan);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(registrationData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="gs-profile-page animate-fade-in" style={{ paddingBottom: '100px' }}>
        <div className="flex-between mb-4 px-4 pt-4">
          <h2 className="gs-header-title" style={{ color: 'var(--text-main)', fontSize: '20px' }}>Edit Profile</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCancel} className="gs-link-button" style={{ color: 'var(--text-muted)' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} className="gs-link-button" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        <div className="gs-content-padded">
          <Card className="mb-4">
            <h3 className="gs-section-title mb-3">Personal Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Full Name"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Mobile Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').substring(0, 10) })}
              />
              <Input
                label="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="gs-section-title mb-3">Work & Protection</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Weekly Income"
                type="number"
                value={formData.weeklyIncome || ''}
                onChange={(e) => setFormData({ ...formData, weeklyIncome: e.target.value })}
              />

              <div className="gs-input-container">
                <label className="gs-form-label">City</label>
                <div className="gs-input-wrapper">
                  <select
                    className="gs-input"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    {INDIAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gs-input-container">
                <label className="gs-form-label">Vehicle</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.vehicleType === '2-wheeler'}
                    onClick={() => setFormData({ ...formData, vehicleType: '2-wheeler' })}
                  >
                    2-Wheeler
                  </Button>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.vehicleType === '4-wheeler'}
                    onClick={() => setFormData({ ...formData, vehicleType: '4-wheeler' })}
                  >
                    4-Wheeler
                  </Button>
                </div>
              </div>

              <div className="gs-input-container">
                <label className="gs-form-label">Plan Tier</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {plans.map((plan) => (
                    <Button
                      key={plan.id}
                      type="button"
                      variant="pill"
                      selected={(formData.selectedPlan || selectedPlan.id) === plan.id}
                      onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                    >
                      {plan.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Input
                label="Operational Zone"
                value={formData.primaryZone || ''}
                onChange={(e) => setFormData({ ...formData, primaryZone: e.target.value })}
              />

              <div className="gs-input-container">
                <label className="gs-form-label">Work Persona</label>
                <div className="gs-input-wrapper">
                  <select
                    className="gs-input"
                    value={formData.persona || 'courier'}
                    onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                  >
                    <option value="courier">Courier</option>
                    <option value="shopper">Grocery runner</option>
                    <option value="rideshare">Ride-share support</option>
                    <option value="helper">Multi-task helper</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="gs-profile-page animate-fade-in">
      <div className="gs-header-blue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button
          onClick={() => setIsEditing(true)}
          className="gs-profile-edit-btn"
          style={{ position: 'absolute', top: '16px', right: '16px', color: 'white', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
        >
          <Edit2 size={12} /> Edit Profile
        </button>

        <div className="gs-profile-avatar mb-3">{userInitials}</div>
        <h1 className="gs-header-title">{userName}</h1>
        <p className="gs-header-subtitle">{registrationData.platform || 'Platform'} • {registrationData.city || 'Zone'}</p>

        <div className="mt-4">
          <Badge variant="blue">GigScore: 78</Badge>
        </div>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        <Card className="mb-4">
          <div className="flex-between mb-4 border-b pb-2">
            <h3 className="gs-section-title" style={{ margin: 0 }}>Personal Details</h3>
          </div>
          <div className="gs-profile-details">
            <div className="gs-prof-row">
              <span className="gs-prof-label">Mobile</span>
              <span className="gs-prof-value">+91 {registrationData.phone || 'Not set'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Email</span>
              <span className="gs-prof-value">{registrationData.email || 'Not set'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">UPI ID</span>
              <span className="gs-prof-value">{registrationData.upiId || 'Not set'}</span>
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <div className="flex-between mb-4 border-b pb-2">
            <h3 className="gs-section-title" style={{ margin: 0 }}>Protection Profile</h3>
          </div>
          <div className="gs-profile-details">
            <div className="gs-prof-row">
              <span className="gs-prof-label">Weekly Income</span>
              <span className="gs-prof-value">Rs {registrationData.weeklyIncome || '0'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Vehicle</span>
              <span className="gs-prof-value">{registrationData.vehicleType || 'Not set'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Zone</span>
              <span className="gs-prof-value">{registrationData.primaryZone || 'Not set'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Persona</span>
              <span className="gs-prof-value">{registrationData.persona || 'courier'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Active Plan</span>
              <span className="gs-prof-value" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                {selectedPlan.name} (Rs {selectedPlan.premium}/week)
              </span>
            </div>
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('gigshield_user_data');
            navigate('/login');
          }}
        >
          <LogOut size={16} /> Log Out
        </Button>
      </div>
    </div>
  );
};
