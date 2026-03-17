import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { CheckCircle2, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="gs-profile-page animate-fade-in">
      
      <div className="gs-header-blue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="gs-profile-avatar mb-3">RK</div>
        <h1 className="gs-header-title">Ramesh Kumar</h1>
        <p className="gs-header-subtitle">Zomato • Koramangala Zone</p>
        
        <div className="mt-4">
          <Badge variant="blue">GigScore: 78</Badge>
        </div>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Details Card */}
        <Card className="mb-4">
          <div className="gs-profile-details">
            <div className="gs-prof-row">
              <span className="gs-prof-label">Mobile</span>
              <span className="gs-prof-value">+91 9988776655</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Email</span>
              <span className="gs-prof-value">ramesh@example.com</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">UPI ID</span>
              <span className="gs-prof-value">ramesh@okicici</span>
            </div>
            <div className="gs-prof-row">
              <span className="gs-prof-label">Aadhaar Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} className="gs-text-green" />
                <span className="gs-prof-value">Verified</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Documents Section */}
        <h3 className="gs-section-title mb-3">Uploaded Documents</h3>
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
              <span className="gs-prof-value">Platform Work Proof</span>
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        </Card>

        {/* Support & Settings Links */}
        <div className="gs-settings-list mb-6">
          <div className="gs-setting-item">
            <span>Help & Support</span>
            <ChevronRight size={18} className="gs-text-muted" />
          </div>
          <div className="gs-setting-item" onClick={() => navigate('/payments')}>
            <span>Payment Settings</span>
            <ChevronRight size={18} className="gs-text-muted" />
          </div>
          <div className="gs-setting-item">
            <span>Terms & Conditions</span>
            <ChevronRight size={18} className="gs-text-muted" />
          </div>
        </div>

        {/* Logout */}
        <Button variant="outline" onClick={() => navigate('/login')}>
          <LogOut size={16} /> Log Out
        </Button>

      </div>
    </div>
  );
};
