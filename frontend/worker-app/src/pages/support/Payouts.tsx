import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { CheckCircle2, Navigation } from 'lucide-react';
import './Payouts.css';

export const PayoutsScreen: React.FC = () => {
  return (
    <div className="gs-payouts-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue">
        <h1 className="gs-header-title">My payouts</h1>
        <p className="gs-header-subtitle">October 2024</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Summary Card */}
        <Card className="mb-4">
          <div className="gs-grid-2col">
            <div className="gs-metric-block border-r">
              <span className="gs-metric-label">Total this month</span>
              <span className="gs-metric-value gs-text-green">₹1,400</span>
            </div>
            <div className="gs-metric-block pl-4">
              <span className="gs-metric-label">Claims count</span>
              <span className="gs-metric-value">2</span>
            </div>
          </div>
        </Card>

        {/* Payouts List */}
        <div className="gs-payouts-list mb-4">
          
          <Card className="gs-payout-row">
            <div className="flex-between">
              <div>
                <p className="gs-payout-title">Heavy Rain Disruption</p>
                <p className="gs-payout-subtitle">Oct 4 • Koramangala</p>
                <div className="gs-payout-meta mt-2">
                  <span className="gs-text-green" style={{ fontSize: '12px' }}>Auto-approved • 4.2 sec</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gs-payout-amount gs-text-green">+ ₹560</span>
                <div style={{ marginTop: '8px' }}>
                  <Badge variant="success">Paid</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="gs-payout-row">
            <div className="flex-between">
              <div>
                <p className="gs-payout-title">AQI Spike Disruption</p>
                <p className="gs-payout-subtitle">Oct 1 • Koramangala</p>
                <div className="gs-payout-meta mt-2">
                  <span className="gs-text-green" style={{ fontSize: '12px' }}>Auto-approved • 5.1 sec</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gs-payout-amount gs-text-green">+ ₹840</span>
                <div style={{ marginTop: '8px' }}>
                  <Badge variant="success">Paid</Badge>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Verification Sub-card */}
        <div className="gs-verification-card">
          <div className="flex-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} className="gs-text-green" />
              <span className="gs-verification-title">Claim legitimacy: Verified</span>
            </div>
          </div>
          <div className="gs-verification-list">
            <div className="gs-verification-item">
              <Navigation size={14} className="gs-text-muted" />
              <span>GPS location matched covered zone</span>
            </div>
            <div className="gs-verification-item">
              <CheckCircle2 size={14} className="gs-text-muted" />
              <span>No duplicate claims detected</span>
            </div>
            <div className="gs-verification-item">
              <CheckCircle2 size={14} className="gs-text-muted" />
              <span>Platform activity log consistent</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
