import React, { useState } from 'react';
import { Card } from '../../components/Card';
import './Simulator.css';

export const PremiumSimulator: React.FC = () => {
  const [coverage, setCoverage] = useState(70);
  const [hours, setHours] = useState(8);
  const [zoneIndex, setZoneIndex] = useState(1); // 0: Low, 1: Medium, 2: High

  const zones = [
    { name: 'HSR Layout (Low Risk)', base: 49, modifier: 10 },
    { name: 'Koramangala (Medium Risk)', base: 49, modifier: 25 },
    { name: 'Indiranagar (High Risk)', base: 49, modifier: 45 },
  ];

  // Calculate premium dynamically
  const calculatePremium = () => {
    const activeZone = zones[zoneIndex];
    const base = activeZone.base;
    const zoneRisk = activeZone.modifier;
    const coverageMod = coverage === 50 ? -10 : coverage === 90 ? +25 : 0;
    const hoursMod = hours > 8 ? 15 : hours < 6 ? -5 : 0;
    const loyalty = -10; // Static loyalty

    return {
      base,
      zoneRisk,
      coverageMod,
      hoursMod,
      loyalty,
      total: base + zoneRisk + coverageMod + hoursMod + loyalty
    };
  };

  const premium = calculatePremium();

  return (
    <div className="gs-simulator-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue" style={{ paddingBottom: '60px' }}>
        <h1 className="gs-header-title">Premium simulator</h1>
        <p className="gs-header-subtitle">See how your premium changes</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-40px' }}>
        
        {/* Live Premium Display Card */}
        <div className="gs-live-premium-card mb-4">
          <span className="gs-live-premium-label">Estimated weekly premium</span>
          <span className="gs-live-premium-value">₹{premium.total}</span>
        </div>

        <Card className="mb-4">
          
          {/* Zone Dropdown */}
          <div className="gs-sim-control mb-4">
            <label className="gs-form-label">Delivery Zone</label>
            <div className="gs-input-wrapper">
              <select 
                className="gs-input"
                value={zoneIndex}
                onChange={(e) => setZoneIndex(Number(e.target.value))}
              >
                {zones.map((z, idx) => (
                  <option key={idx} value={idx}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Coverage Slider */}
          <div className="gs-sim-control mb-4">
            <div className="flex-between mb-2">
              <label className="gs-form-label pb-0">Coverage Percentage</label>
              <span className="gs-sim-slider-val">{coverage}%</span>
            </div>
            <input 
              type="range" 
              className="gs-slider" 
              min="50" max="90" step="10" 
              value={coverage} 
              onChange={(e) => setCoverage(Number(e.target.value))} 
            />
            <div className="flex-between gs-slider-labels mt-1">
              <span>50%</span>
              <span>70%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Hours Slider */}
          <div className="gs-sim-control">
            <div className="flex-between mb-2">
              <label className="gs-form-label pb-0">Hours per day</label>
              <span className="gs-sim-slider-val">{hours} hrs</span>
            </div>
            <input 
              type="range" 
              className="gs-slider" 
              min="4" max="12" step="1" 
              value={hours} 
              onChange={(e) => setHours(Number(e.target.value))} 
            />
            <div className="flex-between gs-slider-labels mt-1">
              <span>4</span>
              <span>8</span>
              <span>12</span>
            </div>
          </div>

        </Card>

        {/* Breakdown Card */}
        <Card variant="blue">
          <h3 className="gs-card-title gs-title-blue mb-4">Live Breakdown</h3>
          <div className="gs-breakdown-rows">
            <div className="gs-breakdown-row">
              <span>Base rate</span>
              <span>₹{premium.base}</span>
            </div>
            <div className="gs-breakdown-row">
              <span>Zone risk</span>
              <span className="gs-text-red">+ ₹{premium.zoneRisk}</span>
            </div>
            {premium.coverageMod !== 0 && (
              <div className="gs-breakdown-row">
                <span>Coverage modifier</span>
                <span className={premium.coverageMod > 0 ? "gs-text-red" : "gs-text-green"}>
                  {premium.coverageMod > 0 ? '+' : '−'} ₹{Math.abs(premium.coverageMod)}
                </span>
              </div>
            )}
            {premium.hoursMod !== 0 && (
              <div className="gs-breakdown-row">
                <span>Hours modifier</span>
                <span className={premium.hoursMod > 0 ? "gs-text-red" : "gs-text-green"}>
                  {premium.hoursMod > 0 ? '+' : '−'} ₹{Math.abs(premium.hoursMod)}
                </span>
              </div>
            )}
            <div className="gs-breakdown-row">
              <span>Loyalty discount</span>
              <span className="gs-text-green">− ₹{Math.abs(premium.loyalty)}</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
