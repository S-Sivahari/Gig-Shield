import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Info, ChevronDown, ChevronUp, CloudRain, Sun, Flame } from 'lucide-react';
import { useWeatherRisk } from '../../hooks/useWeatherRisk';
import { usePremiumEngine } from '../../hooks/usePremiumEngine';
import type { PlanOption } from '../../hooks/usePremiumEngine';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

function WeatherBadge({ condition }: { condition: string }) {
  if (condition === 'rain' || condition === 'storm') {
    return <span className="gs-weather-badge gs-weather-badge--rain"><CloudRain size={12} /> Rain Risk</span>;
  }
  if (condition === 'heatwave') {
    return <span className="gs-weather-badge gs-weather-badge--hot"><Flame size={12} /> Heatwave</span>;
  }
  return <span className="gs-weather-badge gs-weather-badge--clear"><Sun size={12} /> Clear</span>;
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`gs-plan-card ${selected ? 'gs-plan-card--selected' : ''} ${plan.recommended ? 'gs-plan-card--recommended' : ''}`}
      onClick={onSelect}
      style={{ borderColor: selected ? plan.color : undefined }}
    >
      {plan.recommended && (
        <div className="gs-plan-badge" style={{ background: plan.color }}>Recommended</div>
      )}
      <div className="gs-plan-header">
        <span className="gs-plan-emoji">{plan.emoji}</span>
        <div>
          <p className="gs-plan-name">{plan.name}</p>
          <p className="gs-plan-price" style={{ color: plan.color }}>₹{plan.premium}<span>/week</span></p>
        </div>
        <div className={`gs-plan-radio ${selected ? 'gs-plan-radio--active' : ''}`}
          style={{ borderColor: selected ? plan.color : undefined, background: selected ? plan.color : undefined }}
        />
      </div>
      <p className="gs-plan-tagline">{plan.tagline}</p>
    </div>
  );
}

export const Step4Income: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const city = data.city || 'Mumbai';
  const { weatherData, risk, useSimulation, simMode, toggleSimScenario, hasApiKey } = useWeatherRisk(city);

  const weeklyIncome = Number(data.weeklyIncome) || 0;
  const vehicleType = data.vehicleType || '';
  const hasSafetyGear = data.hasSafetyGear === true;

  const { breakdown, plans } = usePremiumEngine({
    weeklyIncome,
    vehicleType,
    hasSafetyGear,
    weatherMultiplier: risk?.multiplier ?? 1.0,
    weatherReason: risk?.reason ?? '',
    city,
  });

  const selectedPlan = data.selectedPlan || 'shield_plus';
  const selectedPlanObj = plans.find(p => p.id === selectedPlan) ?? plans[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save selected plan info into formData
    updateData({
      selectedPlan,
      finalPremium: selectedPlanObj.premium,
      planName: selectedPlanObj.name,
    });
    onNext();
  };

  const daysOptions = ['5', '6', '7'];

  const coverageOptions = ['50%', '70%', '90%'];
  const estimatedPayout = weeklyIncome
    ? Math.floor(weeklyIncome * (Number((data.coveragePercent || '70%').replace('%', '')) / 100))
    : 0;

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">

        {/* ── Why we ask ── */}
        <Card variant="blue" className="gs-mb-4">
          <div style={{ display: 'flex', gap: '12px' }}>
            <Info size={20} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500, marginBottom: '4px' }}>
                Why do we ask this?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Your declared income drives your weekly premium. We compute it live using your city's weather, your vehicle, and safety gear.
              </p>
            </div>
          </div>
        </Card>

        {/* ── Weekly Income ── */}
        <Input
          label="Average weekly earnings (₹)"
          type="number"
          placeholder="e.g. 4800"
          value={data.weeklyIncome || ''}
          onChange={(e) => updateData({ weeklyIncome: e.target.value })}
          required
        />

        {/* ── Working Days ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Typical working days per week</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {daysOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant="pill"
                selected={data.workingDays === opt}
                onClick={() => updateData({ workingDays: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Coverage % ── */}
        <div className="gs-input-container">
          <label className="gs-form-label">Coverage percentage desired</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {coverageOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant="pill"
                selected={data.coveragePercent === opt}
                onClick={() => updateData({ coveragePercent: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {/* ── LIVE WEATHER STRIP ── */}
        {weeklyIncome > 0 && (
          <div className="gs-weather-strip animate-scale-in">
            <div className="gs-weather-left">
              <span className="gs-weather-icon">{weatherData?.icon ?? '🌤️'}</span>
              <div>
                <p className="gs-weather-city">
                  {weatherData?.source === 'simulated' ? `${simMode === 'stormy' ? '🌧️ Stormy' : '☀️ Sunny'} Simulation` : weatherData?.city ?? city}
                </p>
                <p className="gs-weather-desc">
                  {weatherData?.temp}°C · {weatherData?.description}
                  {weatherData && <WeatherBadge condition={weatherData.condition} />}
                </p>
              </div>
            </div>
            <div className="gs-weather-right">
              {(useSimulation || !hasApiKey) && (
                <button
                  type="button"
                  className="gs-sim-toggle-btn"
                  onClick={toggleSimScenario}
                  title="Toggle weather scenario"
                >
                  ⇄ Toggle
                </button>
              )}
              <span className="gs-risk-badge" style={{
                background: risk?.multiplier === 1.5 ? '#FEE2E2'
                  : risk?.multiplier === 1.3 ? '#FEF3C7'
                  : '#D1FAE5',
                color: risk?.multiplier === 1.5 ? '#DC2626'
                  : risk?.multiplier === 1.3 ? '#D97706'
                  : '#059669',
              }}>
                {risk?.label ?? 'Baseline'} ×{risk?.multiplier?.toFixed(1) ?? '1.0'}
              </span>
            </div>
          </div>
        )}

        {/* ── DYNAMIC PREMIUM + PLAN PICKER ── */}
        {weeklyIncome > 0 && (
          <div className="gs-premium-section animate-scale-in">

            {/* Breakdown Accordion */}
            <button
              type="button"
              className="gs-breakdown-toggle"
              onClick={() => setShowBreakdown(v => !v)}
            >
              <span>💡 Why this price?</span>
              {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showBreakdown && (
              <div className="gs-breakdown-panel animate-scale-in">
                {breakdown.reasons.map((item, i) => (
                  <div key={i} className={`gs-bd-row ${item.type === 'total' ? 'gs-bd-row--total' : ''}`}>
                    <div>
                      <span className="gs-bd-label">{item.label}</span>
                      {item.note && <span className="gs-bd-note">{item.note}</span>}
                    </div>
                    <span className={`gs-bd-value gs-bd-value--${item.type}`}>
                      {item.type === 'add' ? '+' : item.type === 'sub' ? '−' : ''}₹{item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Plan Cards */}
            <p className="gs-plan-section-title">Choose your plan:</p>
            <div className="gs-plan-grid">
              {plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => updateData({ selectedPlan: plan.id })}
                />
              ))}
            </div>

            {/* Payout Preview */}
            {data.weeklyIncome && (
              <div className="gs-live-preview">
                <span className="gs-preview-label">Estimated weekly payout:</span>
                <span className="gs-preview-value">₹{estimatedPayout.toLocaleString()}</span>
                <span className="gs-preview-subtext">
                  — {data.coveragePercent || '70%'} of ₹{Number(data.weeklyIncome).toLocaleString()} on a disruption day
                </span>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary" disabled={!weeklyIncome}>
          Next — payment setup
        </Button>
      </div>
    </form>
  );
};
