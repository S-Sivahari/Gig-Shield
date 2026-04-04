import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ShieldAlert, ChevronRight, Activity, CloudRain, Wallet } from 'lucide-react';
import { useInsurance } from '../../context/InsuranceContext';
import { WeatherSimulator } from '../../components/WeatherSimulator';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const metricRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    plans,
    selectedPlanId,
    isDisrupted,
    disruptionReport,
    pricingQuote,
    shieldWallet,
    weeklyWalletContribution,
    weeklyCommunityContribution,
    communityPoolBalance,
    totalPremiumsCollected,
    payoutEstimate,
    weatherData,
    protectionState,
    autoClaimNotification,
    claimsHistory,
    registrationData,
  } = useInsurance();

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[1];
  const userName = registrationData.fullName || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  const weeklyIncome = Number(registrationData.weeklyIncome) || 0;
  const coveragePct = Number((registrationData.coveragePercent || '70%').replace('%', '')) / 100;
  const weeklyPremium = registrationData.finalPremium || selectedPlan?.premium || (weeklyIncome > 0 ? Math.round(weeklyIncome * 0.02) : 89);
  const estimatedCoverage = weeklyIncome > 0 ? Math.floor(weeklyIncome * coveragePct) : 3360;
  const planName = registrationData.planName || selectedPlan?.name || 'Shield+';
  const userCity = registrationData.city || 'Your city';
  const userZone = registrationData.primaryZone || 'Zone not set';
  const protectionVariant = protectionState === 'Disrupted'
    ? 'error'
    : protectionState === 'At Risk'
      ? 'warning'
      : 'success';
  const zeroTouchSubtext = protectionState === 'Disrupted'
    ? `Rain detected. Estimated Payout: Rs ${payoutEstimate.toLocaleString()}`
    : protectionState === 'At Risk'
      ? 'Watch thresholds crossed. Auto-trigger is armed.'
      : 'No trigger detected. Protection remains active.';

  useEffect(() => {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Show all elements immediately without animation
      metricRefs.current.forEach((ref) => {
        if (ref) ref.classList.add('animate-fade-in-up');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    metricRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleProfileClick = () => {
    try {
      // Check if auth state exists (in a real app, this would check localStorage/sessionStorage)
      // For now, we'll just navigate directly
      navigate('/profile');
    } catch (error) {
      console.error('Navigation error:', error);
      // Stay on current page if error occurs
    }
  };

  const handleProfileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProfileClick();
    }
  };

  return (
    <div className="gs-dashboard-page animate-fade-in">
      
      {/* Top Header Section */}
      <div className="gs-dash-header">
        <div className="gs-dash-greeting-row">
          <div>
            <h1 className="gs-dash-greeting">Good morning,</h1>
            <p className="gs-dash-name">{userName}</p>
          </div>
          <div 
            className="gs-avatar gs-avatar--clickable" 
            onClick={handleProfileClick}
            onKeyDown={handleProfileKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Go to profile"
          >
            {userInitials}
          </div>
        </div>

        {/* Protection Card */}
        <div className="gs-protection-card">
          <div className="gs-prot-header">
            <span className="gs-prot-label">This week's coverage · {planName}</span>
            <Badge variant={protectionVariant}>{protectionState}</Badge>
          </div>
          <h2 className="gs-prot-amount">₹{estimatedCoverage.toLocaleString()} <span>protected</span></h2>
          
          <div className="gs-prot-progress">
            <div className="gs-prot-progress-header">
              <span>Weekly premium · {userCity}</span>
              <span>₹{weeklyPremium} / ₹{weeklyPremium}</span>
            </div>
            <div className="gs-prot-progress-track">
              <div className="gs-prot-progress-fill" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="gs-dash-content">

        {autoClaimNotification && (
          <div className="gs-auto-claim-notice">
            <p>{autoClaimNotification}</p>
          </div>
        )}
        
        {/* Zone Alert Banner */}
        <div className={`gs-zone-banner ${isDisrupted ? 'gs-zone-banner--danger' : ''}`} onClick={() => navigate('/zone')}>
          <div className={`gs-zone-indicator ${isDisrupted ? 'gs-zone-indicator--danger' : ''}`} />
          <div className="gs-zone-text">
            <b>{userZone}</b>
            {' '}
            •
            {' '}
            {isDisrupted ? disruptionReport.message : 'Monitoring weather risk in real-time'}
          </div>
          <ChevronRight size={16} />
        </div>

        <div className="gs-active-protection-grid mt-4">
          <Card className="gs-active-protection-card">
            <div className="gs-active-protection-head">
              <CloudRain size={16} />
              <span>Live weather</span>
            </div>
            <p className="gs-active-protection-value">{weatherData.rainMm}mm</p>
            <p className="gs-active-protection-sub">{disruptionReport.statusLabel}</p>
          </Card>

          <Card className="gs-active-protection-card">
            <div className="gs-active-protection-head">
              <Wallet size={16} />
              <span>Shield Wallet</span>
            </div>
            <p className="gs-active-protection-value">Rs {shieldWallet.toLocaleString()}</p>
            <p className="gs-active-protection-sub">Safety Net balance · growing with rollover</p>
            <p className="gs-active-protection-sub">Weekly split: Rs {weeklyWalletContribution.toLocaleString()} wallet + Rs {weeklyCommunityContribution.toLocaleString()} community pool</p>
            <p className="gs-active-protection-sub">Total premiums tracked: Rs {totalPremiumsCollected.toLocaleString()} · Pool reserve: Rs {communityPoolBalance.toLocaleString()}</p>
          </Card>

          <Card className="gs-active-protection-card">
            <div className="gs-active-protection-head">
              <ShieldAlert size={16} />
              <span>Live Protection</span>
            </div>
            <p className="gs-active-protection-value">{protectionState}</p>
            <p className="gs-active-protection-sub">{zeroTouchSubtext}</p>
          </Card>
        </div>

        <div className="mt-4">
          <WeatherSimulator />
        </div>

        <div className="gs-risk-cards mt-4">
          {pricingQuote.riskCards.map((card) => (
            <div key={card.id} className={`gs-risk-card gs-risk-card--${card.tone}`}>
              <div className="gs-risk-card-head">
                <span>{card.title}</span>
                <strong>{card.value}</strong>
              </div>
              <p>{card.hint}</p>
            </div>
          ))}
        </div>

        {/* 2x2 Metric Grid */}
        <div className="gs-metric-grid mt-4">
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[0] = el; }}
          >
            <span className="gs-metric-label">Total paid out</span>
            <span className="gs-metric-value gs-text-green">₹12,450</span>
          </Card>
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[1] = el; }}
            onClick={() => navigate('/claims-history')}
          >
            <span className="gs-metric-label">Claims this month</span>
            <span className="gs-metric-value">{claimsHistory.length}</span>
          </Card>
          <Card 
            className="gs-metric-card" 
            onClick={() => navigate('/gigscore')}
            ref={(el) => { metricRefs.current[2] = el; }}
          >
            <span className="gs-metric-label">GigScore</span>
            <span className="gs-metric-value gs-text-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              78 <ChevronRight size={16} />
            </span>
          </Card>
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[3] = el; }}
          >
            <span className="gs-metric-label">Next renewal</span>
            <span className="gs-metric-value" style={{ fontSize: '16px' }}>Oct 12</span>
          </Card>
        </div>

        {/* Recent Activity List */}
        <div className="gs-activity-section mt-6">
          <div className="gs-section-header">
            <h3 className="gs-section-title">Recent activity</h3>
            <button className="gs-link-button" onClick={() => navigate('/claims-history')}>View all</button>
          </div>

          <div className="gs-activity-list">
            
            <div className="gs-activity-item">
              <div className="gs-activity-icon-box bg-blue-light">
                <ShieldAlert size={20} className="text-primary-blue" />
              </div>
              <div className="gs-activity-details">
                <p className="gs-activity-title">Heavy Rain Disruption</p>
                <p className="gs-activity-date">Oct 4 • <span className="gs-text-green">Auto-approved</span></p>
              </div>
              <div className="gs-activity-amount gs-text-green">+₹560</div>
            </div>

            <div className="gs-activity-item">
              <div className="gs-activity-icon-box bg-blue-light">
                <Activity size={20} className="text-primary-blue" />
              </div>
              <div className="gs-activity-details">
                <p className="gs-activity-title">AQI Spike Disruption</p>
                <p className="gs-activity-date">Sep 28 • <span className="gs-text-green">Auto-approved</span></p>
              </div>
              <div className="gs-activity-amount gs-text-green">+₹840</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
