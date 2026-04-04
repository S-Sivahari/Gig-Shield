import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { CloudRain, Sun } from 'lucide-react';
import { useInsurance } from '../../context/InsuranceContext';
import type { InsurancePlan } from '../../services/InsuranceEngine.js';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

function WeatherBadge({ level }: { level: 'none' | 'watch' | 'alert' | 'severe' }) {
  if (level === 'severe' || level === 'alert') {
    return <span className="gs-weather-badge gs-weather-badge--rain"><CloudRain size={12} /> Trigger risk</span>;
  }
  if (level === 'watch') {
    return <span className="gs-weather-badge gs-weather-badge--hot"><CloudRain size={12} /> Watch mode</span>;
  }
  return <span className="gs-weather-badge gs-weather-badge--clear"><Sun size={12} /> Clear</span>;
}

function PlanTierButton({
  plan,
  selected,
  onSelect,
}: {
  plan: InsurancePlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`gs-plan-card gs-plan-card--compact ${selected ? 'gs-plan-card--selected' : ''}`}
      onClick={onSelect}
      style={{ borderColor: selected ? plan.color : undefined }}
    >
      <span className="gs-plan-emoji">{plan.emoji}</span>
      <p className="gs-plan-name">{plan.name}</p>
      <p className="gs-plan-price" style={{ color: plan.color }}>
        Rs {plan.premium}
        <span>/wk</span>
      </p>
      <p className="gs-plan-tagline">{plan.riskBadge}</p>
    </button>
  );
}

export const Step4Income: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const {
    workerProfile,
    plans,
    pricingQuote,
    weatherData,
    disruptionReport,
    selectedPlanId,
    selectPlan,
    updateWorkerProfile,
    simulateHeavyRain,
    resetWeather,
  } = useInsurance();

  const weeklyIncome = Number(data.weeklyIncome || workerProfile.income) || 0;
  const selectedPlan = selectedPlanId || data.selectedPlan || 'shield_plus';
  const selectedPlanObj = plans.find((p) => p.id === selectedPlan) ?? plans[1];

  const workingDays = Math.min(7, Math.max(1, Number(data.workingDays) || 6));
  const coveragePercent = data.coveragePercent || '70%';
  const coveragePctNumber = Number(String(coveragePercent).replace('%', '')) || 70;
  const estimatedPayout = weeklyIncome ? Math.floor(weeklyIncome * (coveragePctNumber / 100)) : 0;

  const weatherIcon = weatherData.rainMm > 0 ? '🌧️' : '☀️';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      selectedPlan: selectedPlanObj.id,
      finalPremium: selectedPlanObj.premium,
      planName: selectedPlanObj.name,
      workingDays: String(workingDays),
      coveragePercent,
    });
    onNext();
  };

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        <Input
          label="Weekly income"
          type="number"
          placeholder="e.g. 4800"
          value={data.weeklyIncome || ''}
          onChange={(e) => {
            updateData({ weeklyIncome: e.target.value });
            updateWorkerProfile({ income: Number(e.target.value) || 0 });
          }}
          required
        />

        <div className="gs-income-inline-row">
          <div className="gs-inline-col">
            <label className="gs-form-label">Days per week</label>
            <div className="gs-days-inline-control">
              <input
                type="range"
                min="1"
                max="7"
                value={workingDays}
                className="gs-days-slider"
                onChange={(e) => updateData({ workingDays: e.target.value })}
              />
              <input
                type="number"
                min="1"
                max="7"
                value={workingDays}
                className="gs-days-input"
                onChange={(e) => updateData({ workingDays: e.target.value })}
              />
            </div>
          </div>

          <div className="gs-inline-col">
            <label className="gs-form-label">Coverage</label>
            <div className="gs-coverage-inline">
              {['50%', '70%', '90%'].map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant="pill"
                  selected={coveragePercent === opt}
                  onClick={() => updateData({ coveragePercent: opt })}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {weeklyIncome > 0 && (
          <div className="gs-weather-strip">
            <div className="gs-weather-left">
              <span className="gs-weather-icon">{weatherIcon}</span>
              <div>
                <p className="gs-weather-city">{workerProfile.city || data.city || 'City'} · {weatherData.rainMm}mm</p>
                <p className="gs-weather-desc">
                  {disruptionReport.statusLabel} <WeatherBadge level={disruptionReport.level} />
                </p>
              </div>
            </div>
            <button
              type="button"
              className="gs-sim-toggle-btn"
              onClick={disruptionReport.level === 'none' ? simulateHeavyRain : resetWeather}
            >
              {disruptionReport.level === 'none' ? 'Simulate heavy rain' : 'Reset weather'}
            </button>
          </div>
        )}

        {weeklyIncome > 0 && (
          <Card className="gs-premium-section">
            <p className="gs-plan-section-title">Plan tiers</p>
            <div className="gs-plan-grid gs-plan-grid--three">
              {plans.map((plan) => (
                <PlanTierButton
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => {
                    selectPlan(plan.id);
                    updateData({ selectedPlan: plan.id });
                  }}
                />
              ))}
            </div>

            <div className="gs-live-preview">
              <span className="gs-preview-label">Estimated weekly payout</span>
              <span className="gs-preview-value">Rs {estimatedPayout.toLocaleString()}</span>
              <span className="gs-preview-subtext">
                {coveragePercent} of Rs {weeklyIncome.toLocaleString()} on disruption day
              </span>
            </div>

            <button type="button" className="gs-breakdown-toggle" onClick={() => setShowBreakdown((v) => !v)}>
              <span>Why this price?</span>
              <span>{showBreakdown ? 'Hide' : 'Show'}</span>
            </button>

            {showBreakdown && (
              <div className="gs-breakdown-panel">
                <div className="gs-bd-row">
                  <span className="gs-bd-label">Base premium</span>
                  <span className="gs-bd-value">Rs {pricingQuote.basePremium}</span>
                </div>
                <div className="gs-bd-row">
                  <span className="gs-bd-label">Risk model</span>
                  <span className="gs-bd-value">
                    {pricingQuote.riskBadge}
                  </span>
                </div>
                {pricingQuote.breakdown.slice(1, pricingQuote.breakdown.length - 1).map((row) => (
                  <div className="gs-bd-row" key={row.label}>
                    <span className="gs-bd-label">{row.label}</span>
                    <span className="gs-bd-value">
                      {row.type === 'add' ? '+' : row.type === 'sub' ? '-' : ''}Rs {row.value}
                    </span>
                  </div>
                ))}
                <div className="gs-bd-row gs-bd-row--total">
                  <span className="gs-bd-label">Selected weekly premium</span>
                  <span className="gs-bd-value">Rs {selectedPlanObj.premium}</span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary" disabled={!weeklyIncome}>
          Next - payment setup
        </Button>
      </div>
    </form>
  );
};
