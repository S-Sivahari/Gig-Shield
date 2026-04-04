import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Shield } from 'lucide-react';
import { useWeatherRisk } from '../../hooks/useWeatherRisk';
import { usePremiumEngine } from '../../hooks/usePremiumEngine';
import './Policy.css';

export const PolicyScreen: React.FC = () => {
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
  const userPlatform = user?.platform || 'Zomato';
  const userZone = user?.primaryZone || 'Koramangala';
  const coveragePercent = user?.coveragePercent || '70%';
  const userCity = user?.city || 'Mumbai';
  const weeklyIncome = Number(user?.weeklyIncome) || 5000;
  const vehicleType = user?.vehicleType || '2-wheeler';
  const hasSafetyGear = user?.hasSafetyGear === true;
  const activePlanId = user?.selectedPlan || 'shield_plus';
  const activePlanName = user?.planName || 'Shield+';
  const finalPremium = user?.finalPremium || 100;

  // Live weather + engine hooks for dynamic breakdown
  const { risk } = useWeatherRisk(userCity);
  const { plans, breakdown } = usePremiumEngine({
    weeklyIncome,
    vehicleType,
    hasSafetyGear,
    weatherMultiplier: risk?.multiplier ?? 1.0,
    weatherReason: risk?.reason ?? '',
    city: userCity,
  });

  const activePlan = plans.find(p => p.id === activePlanId) ?? plans[1];

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
              <span className="gs-detail-value">{userPlatform}</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Zone</span>
              <span className="gs-detail-value">{userZone}</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Coverage %</span>
              <span className="gs-detail-value">{coveragePercent}</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">City</span>
              <span className="gs-detail-value">{userCity}</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Weekly Premium</span>
              <span className="gs-detail-value gs-text-blue">₹{finalPremium}</span>
            </div>
            <div className="gs-detail-item">
              <span className="gs-detail-label">Vehicle</span>
              <span className="gs-detail-value">{vehicleType === '4-wheeler' ? '🚗 4-Wheeler' : '🏍️ 2-Wheeler'}</span>
            </div>
          </div>
        </Card>

        {/* Premium Breakdown Card (AI Transparency) */}
        <Card variant="blue" className="mb-4">
          <h3 className="gs-card-title gs-title-blue mb-4">Premium breakdown — Why ₹{finalPremium}?</h3>
          <div className="gs-breakdown-rows">
            {breakdown.reasons.map((item, idx) => {
              if (item.type === 'total') return null;
              const prefix = item.type === 'add' ? '+ ' : item.type === 'sub' ? '− ' : '';
              const colorClass = item.type === 'add' ? 'gs-text-red' : item.type === 'sub' ? 'gs-text-green' : '';
              return (
                <div className="gs-breakdown-row" key={idx}>
                  <span>{item.label}</span>
                  <span className={colorClass}>{prefix}₹{item.value}</span>
                </div>
              );
            })}
            <div className="gs-divider my-2" />
            <div className="gs-breakdown-row gs-total-row">
              <span>Total weekly premium</span>
              <span className="gs-text-blue text-lg">₹{finalPremium}</span>
            </div>
          </div>
        </Card>

        {/* Dynamic Plan Selector */}
        <h3 className="gs-section-title mb-3">Your plan · {activePlanName}</h3>
        <div className="gs-plan-selector pb-4">
          {plans.map(plan => (
            <div 
              key={plan.id}
              className={`gs-plan-card ${plan.id === activePlanId ? 'gs-plan-card--selected' : ''}`}
            >
              <h4 className="gs-plan-name">{plan.name}</h4>
              <div className="gs-plan-price">₹{plan.premium}<span>/wk</span></div>
              <p className="gs-plan-desc">{plan.tagline}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
