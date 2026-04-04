import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { CloudRain, Sun, Flame, Info, RefreshCw, Bike, Car } from 'lucide-react';
import { useWeatherRisk } from '../../hooks/useWeatherRisk';
import { usePremiumEngine } from '../../hooks/usePremiumEngine';
import './Simulator.css';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

export const PremiumSimulator: React.FC = () => {
  // Load defaults from registration data if available
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('gigshield_user_data') || '{}'); } catch { return {}; }
  })();

  const [weeklyIncome, setWeeklyIncome] = useState<number>(Number(saved.weeklyIncome) || 5000);
  const [city, setCity] = useState<string>(saved.city || 'Mumbai');
  const [vehicleType, setVehicleType] = useState<'2-wheeler' | '4-wheeler' | ''>(saved.vehicleType || '2-wheeler');
  const [selectedPlan, setSelectedPlan] = useState<string>(saved.selectedPlan || 'shield_plus');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Weather hook
  const {
    weatherData,
    risk,
    isLoading,
    useSimulation,
    simMode,
    hasApiKey,
    toggleSimulation,
    toggleSimScenario,
    refetch,
  } = useWeatherRisk(city);

  // Premium engine
  const { breakdown, plans } = usePremiumEngine({
    weeklyIncome,
    vehicleType,
    weatherMultiplier: risk?.multiplier ?? 1.0,
    weatherReason: risk?.reason ?? '',
    city,
  });

  const currentPlanObj = plans.find(p => p.id === selectedPlan) ?? plans[1];

  const riskColor = risk?.multiplier === 1.5
    ? '#EF4444' : risk?.multiplier === 1.3
    ? '#F59E0B' : '#10B981';
  const riskBg = risk?.multiplier === 1.5
    ? '#FEF2F2' : risk?.multiplier === 1.3
    ? '#FFFBEB' : '#ECFDF5';

  return (
    <div className="gs-simulator-page animate-fade-in">

      {/* ── Header ── */}
      <div className="gs-header-blue" style={{ paddingBottom: '60px' }}>
        <h1 className="gs-header-title">Premium simulator</h1>
        <p className="gs-header-subtitle">Dynamic pricing powered by city mock rainfall data</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-40px' }}>

        {/* ── Live Premium Hero Card ── */}
        <div className="gs-live-premium-card mb-4" style={{ position: 'relative', overflow: 'visible' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="gs-live-premium-label">Your estimated weekly premium</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="gs-live-premium-value">₹{currentPlanObj.premium}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>/{currentPlanObj.name}</span>
              </div>
            </div>
            {/* Weather Pill */}
            <div className="gs-weather-pill" style={{ background: riskBg, color: riskColor }}>
              <span>{weatherData?.icon}</span>
              <span style={{ fontWeight: 700 }}>{risk?.label ?? 'Baseline'}</span>
            </div>
          </div>

          {/* Weather Strip */}
          <div className="gs-sim-weather-strip">
            {isLoading ? (
              <span style={{ opacity: 0.7, fontSize: '13px' }}>Fetching weather…</span>
            ) : weatherData ? (
              <>
                <span style={{ fontSize: '13px', opacity: 0.85 }}>
                  {weatherData.source === 'simulated' ? '⚡ Simulated' : '🧪 Mock feed'} — {weatherData.city} {weatherData.temp}°C, {weatherData.description}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {(useSimulation || !hasApiKey) && (
                    <button className="gs-sim-btn" onClick={toggleSimScenario} title="Toggle weather scenario">
                      ⇄ {simMode === 'sunny' ? 'Switch to Stormy' : 'Switch to Sunny'}
                    </button>
                  )}
                  {hasApiKey && (
                    <button className="gs-sim-btn" onClick={toggleSimulation}>
                      {useSimulation ? '🌐 Use Live' : '⚡ Use Sim'}
                    </button>
                  )}
                  {!useSimulation && (
                    <button className="gs-sim-btn" onClick={refetch} title="Refresh weather">
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* ── Controls Card ── */}
        <Card className="mb-4">

          {/* City Selector */}
          <div className="gs-sim-control mb-4">
            <label className="gs-form-label">City</label>
            <div className="gs-input-wrapper">
              <select
                className="gs-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Weekly Income Slider */}
          <div className="gs-sim-control mb-4">
            <div className="flex-between mb-2">
              <label className="gs-form-label pb-0">Weekly income goal</label>
              <span className="gs-sim-slider-val">₹{weeklyIncome.toLocaleString()}</span>
            </div>
            <input
              type="range"
              className="gs-slider"
              min="1000" max="20000" step="500"
              value={weeklyIncome}
              onChange={(e) => setWeeklyIncome(Number(e.target.value))}
            />
            <div className="flex-between gs-slider-labels mt-1">
              <span>₹1k</span>
              <span>₹10k</span>
              <span>₹20k</span>
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="gs-sim-control mb-4">
            <label className="gs-form-label">Vehicle type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['2-wheeler', '4-wheeler'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`gs-vehicle-chip ${vehicleType === v ? 'gs-vehicle-chip--active' : ''}`}
                  onClick={() => setVehicleType(v)}
                >
                  {v === '2-wheeler' ? <Bike size={16} /> : <Car size={16} />}
                  {v}
                </button>
              ))}
            </div>
          </div>

        </Card>

        {/* ── Breakdown Card ── */}
        <Card variant="blue" className="mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="gs-card-title gs-title-blue" style={{ margin: 0 }}>
              💡 Why this price?
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Breakdown</span>
          </div>
          <div className="gs-breakdown-rows">
            {breakdown.reasons.map((item, i) => (
              <div
                key={i}
                className={`gs-breakdown-row ${item.type === 'total' ? 'gs-bd-total-row' : ''}`}
                style={{ position: 'relative', cursor: item.note ? 'help' : 'default' }}
                onMouseEnter={() => item.note && setShowTooltip(`item-${i}`)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{item.label}</span>
                  {item.note && <Info size={12} color="var(--text-muted)" />}
                </div>
                <span className={
                  item.type === 'add' ? 'gs-text-red'
                    : item.type === 'sub' ? 'gs-text-green'
                    : item.type === 'total' ? 'gs-bd-total-val'
                    : ''
                }>
                  {item.type === 'add' ? '+' : item.type === 'sub' ? '−' : ''}₹{item.value}
                </span>

                {/* Tooltip */}
                {showTooltip === `item-${i}` && item.note && (
                  <div className="gs-tooltip">{item.note}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Plan Picker ── */}
        <div className="gs-plan-picker-section mb-4">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
            🎯 Choose your plan
          </h3>
          <div className="gs-sim-plan-grid">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`gs-sim-plan-card ${selectedPlan === plan.id ? 'gs-sim-plan-card--active' : ''}`}
                style={{
                  borderColor: selectedPlan === plan.id ? plan.color : undefined,
                  boxShadow: selectedPlan === plan.id ? `0 0 0 2px ${plan.color}30` : undefined,
                }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="gs-plan-badge" style={{ background: plan.color }}>Popular</div>
                )}
                <div className="gs-sim-plan-top">
                  <span style={{ fontSize: '24px' }}>{plan.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>{plan.name}</p>
                    <p style={{ fontWeight: 800, fontSize: '20px', color: plan.color }}>
                      ₹{plan.premium}<span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>/wk</span>
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {plan.tagline}
                </p>
                <ul className="gs-sim-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Weather Risk Legend ── */}
        <Card>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
            📊 Risk Multiplier Guide
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <CloudRain size={14} />, label: 'Rain / Clouds >80%', mult: '×1.5', color: '#EF4444', bg: '#FEF2F2' },
              { icon: <Flame size={14} />, label: 'Temperature >40°C', mult: '×1.3', color: '#F59E0B', bg: '#FFFBEB' },
              { icon: <Sun size={14} />, label: 'Clear / Normal', mult: '×1.0', color: '#10B981', bg: '#ECFDF5' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: '8px', background: r.bg,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: r.color }}>
                  {r.icon}
                  <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{r.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: r.color, fontSize: '14px' }}>{r.mult}</span>
              </div>
            ))}
          </div>

          {/* Vehicle Guide */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              🚗 Other Factors
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span><Bike size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />2-Wheeler vulnerability</span>
                <span style={{ color: '#EF4444', fontWeight: 600 }}>+20%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span><Car size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />4-Wheeler stability</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>−10%</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
