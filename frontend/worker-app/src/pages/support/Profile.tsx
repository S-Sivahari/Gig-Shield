import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Edit2, Save, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeatherRisk } from '../../hooks/useWeatherRisk';
import { usePremiumEngine } from '../../hooks/usePremiumEngine';
import './Profile.css';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kochi', 'Nagpur', 'Indore', 'Bhopal',
  'Patna', 'Vadodara', 'Coimbatore', 'Vizag', 'Thiruvananthapuram',
];

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('gigshield_user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const user = getUserData();
  const userName = user?.fullName || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(user || {});

  // Live recalculation hooks for Edit Mode
  const { risk } = useWeatherRisk(formData.city || 'Mumbai');
  const { plans } = usePremiumEngine({
    weeklyIncome: Number(formData.weeklyIncome) || 5000,
    vehicleType: formData.vehicleType || '2-wheeler',
    hasSafetyGear: formData.hasSafetyGear === true,
    weatherMultiplier: risk?.multiplier ?? 1.0,
    weatherReason: risk?.reason ?? '',
    city: formData.city || 'Mumbai',
  });

  const handleSave = () => {
    // Before saving, ensure we recalculate and lock in their new premium based on their selected plan
    const updatedPlanObj = plans.find(p => p.id === (formData.selectedPlan || 'shield_plus')) ?? plans[1];
    
    const finalData = {
      ...formData,
      finalPremium: updatedPlanObj.premium,
      planName: updatedPlanObj.name
    };
    
    localStorage.setItem('gigshield_user_data', JSON.stringify(finalData));
    setIsEditing(false);
    
    // Quick reload so the parent Layout/Dashboard catches the new data instantly
    window.location.reload();
  };

  const handleCancel = () => {
    setFormData(user || {});
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="gs-profile-page animate-fade-in" style={{ paddingBottom: '100px' }}>
        <div className="flex-between mb-4 px-4 pt-4">
          <h2 className="gs-header-title" style={{ color: 'var(--text-main)', fontSize: '20px' }}>Edit Profile</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCancel} className="gs-link-button flex items-center" style={{ color: 'var(--text-muted)' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} className="gs-link-button flex items-center" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
              <Save size={16} className="mr-1" /> Save
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
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
              <Input 
                label="Mobile Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').substring(0, 10)})}
              />
              <Input 
                label="Email ID"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="gs-section-title mb-1">Protection Settings</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Changing these will dynamically recalculate your weekly premium.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                label="Average Weekly Earnings Goal (₹)"
                type="number"
                value={formData.weeklyIncome || ''}
                onChange={(e) => setFormData({...formData, weeklyIncome: e.target.value})}
              />
              
              <div className="gs-input-container">
                <label className="gs-form-label mb-1">Current City</label>
                <div className="gs-input-wrapper">
                  <select 
                    className="gs-input"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="" disabled>Select your city</option>
                    {INDIAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gs-input-container">
                <label className="gs-form-label mb-1">Vehicle Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.vehicleType === '2-wheeler'}
                    onClick={() => setFormData({...formData, vehicleType: '2-wheeler'})}
                  >
                    2-Wheeler
                  </Button>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.vehicleType === '4-wheeler'}
                    onClick={() => setFormData({...formData, vehicleType: '4-wheeler'})}
                  >
                    4-Wheeler
                  </Button>
                </div>
              </div>

              <div className="gs-input-container">
                <label className="gs-form-label mb-1">Using Waterproof Safety Gear?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.hasSafetyGear === true}
                    onClick={() => setFormData({...formData, hasSafetyGear: true})}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="pill"
                    selected={formData.hasSafetyGear === false}
                    onClick={() => setFormData({...formData, hasSafetyGear: false})}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Live Preview Strip */}
              <div style={{ background: 'var(--light-blue-fill)', padding: '12px', borderRadius: '8px', border: '1px solid var(--light-blue-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Live Premium Estimate (Based on new inputs)
                </span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
                  ₹{(plans.find(p => p.id === (formData.selectedPlan || 'shield_plus')) ?? plans[1]).premium}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}> / week</span>
              </div>

            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- Read-Only Profile View ---
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
        <p className="gs-header-subtitle">{user?.platform || 'Zomato'} • {user?.city || 'Koramangala Zone'}</p>
        
        <div className="mt-4">
          <Badge variant="blue">GigScore: 78</Badge>
        </div>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Details Card */}
        <Card className="mb-4">
          <div className="flex-between mb-4 border-b pb-2">
            <h3 className="gs-section-title" style={{ margin: 0 }}>Personal Details</h3>
          </div>
          <div className="gs-profile-details">
            <div className="gs-prof-row">
              <span className="gs-prof-label">Mobile</span>
              <span className="gs-prof-value">+91 {user?.phone || '9988776655'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Email</span>
              <span className="gs-prof-value">{user?.email || 'user@example.com'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">UPI ID</span>
              <span className="gs-prof-value">{user?.upiId || 'Not set'}</span>
            </div>
          </div>
        </Card>

        {/* Protection Core Card */}
        <Card className="mb-4">
          <div className="flex-between mb-4 border-b pb-2">
            <h3 className="gs-section-title" style={{ margin: 0 }}>Protection Profile</h3>
          </div>
          <div className="gs-profile-details">
            <div className="gs-prof-row">
              <span className="gs-prof-label">Income Target</span>
              <span className="gs-prof-value">₹{user?.weeklyIncome || '5000'}/wk</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Vehicle</span>
              <span className="gs-prof-value">{user?.vehicleType === '4-wheeler' ? '🚗 4-Wheeler' : '🏍️ 2-Wheeler'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Safety Gear</span>
              <span className="gs-prof-value">{user?.hasSafetyGear ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Active Plan</span>
              <span className="gs-prof-value" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                {user?.planName || 'Shield+'} (₹{user?.finalPremium || '123'})
              </span>
            </div>
          </div>
        </Card>

        {/* Documents Section */}
        <h3 className="gs-section-title mb-3 mt-6">Verification</h3>
        <Card className="mb-6">
          <div className="gs-doc-list">
            <div className="gs-doc-item flex-between border-b pb-3 mb-3">
              <span className="gs-prof-value">Aadhaar Card</span>
              <Badge variant="success">Verified</Badge>
            </div>
            <div className="gs-doc-item flex-between border-b pb-3 mb-3">
              <span className="gs-prof-value">Driving License</span>
              <Badge variant="success">Verified</Badge>
            </div>
            <div className="gs-doc-item flex-between">
              <span className="gs-prof-value">Platform Proof</span>
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button variant="outline" onClick={() => {
          localStorage.removeItem('gigshield_user_data');
          navigate('/login');
        }}>
          <LogOut size={16} /> Log Out
        </Button>

      </div>
    </div>
  );
};
