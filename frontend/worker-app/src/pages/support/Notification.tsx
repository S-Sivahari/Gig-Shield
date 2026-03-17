import React from 'react';
import { Card } from '../../components/Card';
import { Bell, Shield } from 'lucide-react';
import './Notification.css';

export const NotificationScreen: React.FC = () => {
  return (
    <div className="gs-notification-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue">
        <h1 className="gs-header-title">Lock screen simulation</h1>
        <p className="gs-header-subtitle">Zero-touch auto-claim UX</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '24px' }}>
        
        {/* Simulated iOS Notification */}
        <div className="gs-os-notification">
          <div className="gs-os-header flex-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="gs-os-icon">
                <Shield size={12} color="#FFFFFF" />
              </div>
              <span className="gs-os-app-name">GigShield</span>
            </div>
            <span className="gs-os-time">now</span>
          </div>
          
          <h4 className="gs-os-title">Claim auto-initiated for you</h4>
          <p className="gs-os-body">
            Heavy Rain Disruption detected in Koramangala. Your claim has been approved automatically. Payout processing.
          </p>
          
          <div className="gs-os-pills mt-3">
            <span className="gs-os-pill gs-os-pill-blue">₹560 Payout</span>
            <span className="gs-os-pill gs-os-pill-green">Verified in 4.2s</span>
          </div>
        </div>

        <h3 className="gs-section-title mb-3 mt-6">Notification History</h3>
        
        <div className="gs-history-list">
          
          <Card className="gs-history-card">
            <div className="flex-between mb-2">
              <span className="gs-history-type" style={{ color: 'var(--primary-blue)' }}>
                <Shield size={14} className="mr-1" /> Payout Initiated
              </span>
              <span className="gs-history-time">Today, 14:30</span>
            </div>
            <p className="gs-history-text">Claim auto-initiated for you. Payout processing.</p>
          </Card>

          <Card className="gs-history-card" style={{ backgroundColor: 'var(--warning-fill)' }}>
            <div className="flex-between mb-2">
              <span className="gs-history-type" style={{ color: 'var(--warning-amber)' }}>
                <Bell size={14} className="mr-1" /> Zone Alert
              </span>
              <span className="gs-history-time">Today, 12:00</span>
            </div>
            <p className="gs-history-text gs-text-amber" style={{ opacity: 0.9 }}>
              Watch level active in Koramangala. Rain forecast in 2 hours.
            </p>
          </Card>

        </div>

      </div>
    </div>
  );
};
