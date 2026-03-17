import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Shield } from 'lucide-react';
import './Policy.css';

export const PolicyScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  return (
    <div className="gs-policy-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Shield size={32} color="#FFFFFF" />
        </div>
        <h1 className="gs-header-title">My policy</h1>
        <p className="gs-header-subtitle">Policy ID: GS-2024-KA-82914</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Policy Details Card */}
        <Card className="mb-4">
          <div className="flex-between mb-4 pb-3 border-b">
            <h3 className="gs-card-title no-border pb-0">Income Protection</h3>
            <Badge variant="success">Active</Badge>
          </div>
          
          <div className="gs-grid-2x3">
            <div className="gs-detail-item">
              <span className="gs-detail-label">Platform</span>
              <span className="gs-detail-value">Zomato</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Zone</span>
              <span className="gs-detail-value">Koramangala</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Coverage %</span>
              <span className="gs-detail-value">70%</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Start Date</span>
              <span className="gs-detail-value">Oct 1, 2024</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Weekly Premium</span>
              <span className="gs-detail-value gs-text-blue">₹89</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Next Renewal</span>
              <span className="gs-detail-value">Oct 12, 2024</span>
            </div>
          </div>
        </Card>

        {/* Premium Breakdown Card (AI Transparency) */}
        <Card variant="blue" className="mb-4">
          <h3 className="gs-card-title gs-title-blue mb-4">Premium breakdown</h3>
          <div className="gs-breakdown-rows">
            <div className="gs-breakdown-row">
              <span>Base rate</span>
              <span>₹49</span>
            </div>
            <div className="gs-breakdown-row">
              <span>Zone risk modifier</span>
              <span className="gs-text-red">+ ₹35</span>
            </div>
            <div className="gs-breakdown-row">
              <span>Weather risk factor</span>
              <span className="gs-text-red">+ ₹15</span>
            </div>
            <div className="gs-breakdown-row">
              <span>Loyalty discount</span>
              <span className="gs-text-green">− ₹10</span>
            </div>
            <div className="gs-divider my-2" />
            <div className="gs-breakdown-row gs-total-row">
              <span>Total weekly premium</span>
              <span className="gs-text-blue text-lg">₹89</span>
            </div>
          </div>
        </Card>

        {/* Plan Selector */}
        <h3 className="gs-section-title mb-3">Upgrade your plan</h3>
        <div className="gs-plan-selector pb-4">
          
          <div 
            className={`gs-plan-card ${selectedPlan === 'Basic' ? 'gs-plan-card--selected' : ''}`}
            onClick={() => setSelectedPlan('Basic')}
          >
            <h4 className="gs-plan-name">Basic</h4>
            <div className="gs-plan-price">₹59<span>/wk</span></div>
            <p className="gs-plan-desc">50% cover</p>
          </div>

          <div 
            className={`gs-plan-card ${selectedPlan === 'Standard' ? 'gs-plan-card--selected' : ''}`}
            onClick={() => setSelectedPlan('Standard')}
          >
            <h4 className="gs-plan-name">Standard</h4>
            <div className="gs-plan-price">₹89<span>/wk</span></div>
            <p className="gs-plan-desc">70% cover</p>
          </div>

          <div 
            className={`gs-plan-card ${selectedPlan === 'Pro' ? 'gs-plan-card--selected' : ''}`}
            onClick={() => setSelectedPlan('Pro')}
          >
            <h4 className="gs-plan-name">Pro</h4>
            <div className="gs-plan-price">₹129<span>/wk</span></div>
            <p className="gs-plan-desc">90% cover</p>
          </div>

        </div>

      </div>
    </div>
  );
};
