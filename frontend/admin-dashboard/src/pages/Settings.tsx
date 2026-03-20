import React, { useState } from 'react';
import './Settings.css';

export const Settings: React.FC = () => {
  const [rainfallThreshold, setRainfallThreshold] = useState('50');
  const [aqiThreshold, setAqiThreshold] = useState('400');
  const [tempThreshold, setTempThreshold] = useState('44');
  const [floodLevel, setFloodLevel] = useState('High');
  const [curfewTrigger, setCurfewTrigger] = useState(true);

  const [basicPremium, setBasicPremium] = useState('59');
  const [basicCoverage, setBasicCoverage] = useState('50');
  const [basicMaxPayout, setBasicMaxPayout] = useState('100');
  const [basicWeeklyCap, setBasicWeeklyCap] = useState('3');

  const [standardPremium, setStandardPremium] = useState('89');
  const [standardCoverage, setStandardCoverage] = useState('70');
  const [standardMaxPayout, setStandardMaxPayout] = useState('150');
  const [standardWeeklyCap, setStandardWeeklyCap] = useState('3');

  const [proPremium, setProPremium] = useState('129');
  const [proCoverage, setProCoverage] = useState('90');
  const [proMaxPayout, setProMaxPayout] = useState('300');
  const [proWeeklyCap, setProWeeklyCap] = useState('5');

  const [autoClaimTrigger, setAutoClaimTrigger] = useState(true);
  const [upiAutoPay, setUpiAutoPay] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [reinsuranceAlerts, setReinsuranceAlerts] = useState(true);
  const [newRegistrations, setNewRegistrations] = useState(true);

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">System Settings</h1>
          <p className="gs-admin-page-subtitle">Configure thresholds, plans, and platform parameters</p>
        </div>
      </div>

      {/* Section 1 — Disruption Thresholds */}
      <div className="gs-settings-section">
        <h2 className="gs-settings-section-title">Parametric Trigger Thresholds</h2>
        <p className="gs-settings-section-subtitle">Adjust the values that auto-trigger claims</p>
        
        <div className="gs-admin-card">
          <div className="gs-threshold-rows">
            <div className="gs-threshold-row">
              <span className="gs-threshold-label">Rainfall threshold</span>
              <div className="gs-threshold-input-group">
                <input 
                  type="number" 
                  className="gs-threshold-input" 
                  value={rainfallThreshold}
                  onChange={(e) => setRainfallThreshold(e.target.value)}
                />
                <span className="gs-threshold-unit">mm/hr</span>
                <button className="gs-threshold-save-btn">Save</button>
              </div>
            </div>

            <div className="gs-threshold-row">
              <span className="gs-threshold-label">AQI threshold</span>
              <div className="gs-threshold-input-group">
                <input 
                  type="number" 
                  className="gs-threshold-input" 
                  value={aqiThreshold}
                  onChange={(e) => setAqiThreshold(e.target.value)}
                />
                <span className="gs-threshold-unit">AQI units</span>
                <button className="gs-threshold-save-btn">Save</button>
              </div>
            </div>

            <div className="gs-threshold-row">
              <span className="gs-threshold-label">Temperature threshold</span>
              <div className="gs-threshold-input-group">
                <input 
                  type="number" 
                  className="gs-threshold-input" 
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                />
                <span className="gs-threshold-unit">°C</span>
                <button className="gs-threshold-save-btn">Save</button>
              </div>
            </div>

            <div className="gs-threshold-row">
              <span className="gs-threshold-label">Flood alert level</span>
              <div className="gs-threshold-input-group">
                <select 
                  className="gs-threshold-select" 
                  value={floodLevel}
                  onChange={(e) => setFloodLevel(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
                <button className="gs-threshold-save-btn">Save</button>
              </div>
            </div>

            <div className="gs-threshold-row">
              <span className="gs-threshold-label">Curfew auto-trigger</span>
              <div className="gs-threshold-input-group">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={curfewTrigger}
                    onChange={(e) => setCurfewTrigger(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className="gs-toggle-status">{curfewTrigger ? 'ON' : 'OFF'}</span>
                <button className="gs-threshold-save-btn">Save</button>
              </div>
            </div>
          </div>

          <button className="gs-btn-primary gs-full-width mt-4">Save All Thresholds</button>
        </div>
      </div>

      {/* Section 2 — Plan Configuration */}
      <div className="gs-settings-section">
        <h2 className="gs-settings-section-title">Insurance Plan Settings</h2>
        
        <div className="gs-plan-config-grid">
          {/* Basic Plan */}
          <div className="gs-plan-config-card">
            <h3 className="gs-plan-config-title">Basic</h3>
            <div className="gs-plan-config-fields">
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly Premium</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={basicPremium}
                    onChange={(e) => setBasicPremium(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Coverage %</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={basicCoverage}
                    onChange={(e) => setBasicCoverage(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">%</span>
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Max payout/day</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={basicMaxPayout}
                    onChange={(e) => setBasicMaxPayout(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly cap</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={basicWeeklyCap}
                    onChange={(e) => setBasicWeeklyCap(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Plan */}
          <div className="gs-plan-config-card">
            <h3 className="gs-plan-config-title">Standard</h3>
            <div className="gs-plan-config-fields">
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly Premium</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={standardPremium}
                    onChange={(e) => setStandardPremium(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Coverage %</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={standardCoverage}
                    onChange={(e) => setStandardCoverage(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">%</span>
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Max payout/day</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={standardMaxPayout}
                    onChange={(e) => setStandardMaxPayout(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly cap</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={standardWeeklyCap}
                    onChange={(e) => setStandardWeeklyCap(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="gs-plan-config-card">
            <h3 className="gs-plan-config-title">Pro</h3>
            <div className="gs-plan-config-fields">
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly Premium</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={proPremium}
                    onChange={(e) => setProPremium(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Coverage %</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={proCoverage}
                    onChange={(e) => setProCoverage(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">%</span>
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Max payout/day</label>
                <div className="gs-plan-config-input-wrapper">
                  <span className="gs-plan-config-prefix">₹</span>
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={proMaxPayout}
                    onChange={(e) => setProMaxPayout(e.target.value)}
                  />
                </div>
              </div>
              <div className="gs-plan-config-field">
                <label className="gs-plan-config-label">Weekly cap</label>
                <div className="gs-plan-config-input-wrapper">
                  <input 
                    type="number" 
                    className="gs-plan-config-input" 
                    value={proWeeklyCap}
                    onChange={(e) => setProWeeklyCap(e.target.value)}
                  />
                  <span className="gs-plan-config-suffix">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="gs-btn-primary gs-full-width mt-4">Save Plan Config</button>
      </div>

      {/* Section 3 — System Toggles */}
      <div className="gs-settings-section">
        <h2 className="gs-settings-section-title">Feature Flags</h2>
        
        <div className="gs-admin-card">
          <div className="gs-toggle-rows">
            <div className="gs-toggle-row">
              <span className="gs-toggle-label">Auto-claim trigger</span>
              <div className="gs-toggle-control">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoClaimTrigger}
                    onChange={(e) => setAutoClaimTrigger(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className={`gs-toggle-status ${autoClaimTrigger ? 'gs-toggle-on' : 'gs-toggle-off'}`}>
                  {autoClaimTrigger ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="gs-toggle-row">
              <span className="gs-toggle-label">UPI AutoPay</span>
              <div className="gs-toggle-control">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={upiAutoPay}
                    onChange={(e) => setUpiAutoPay(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className={`gs-toggle-status ${upiAutoPay ? 'gs-toggle-on' : 'gs-toggle-off'}`}>
                  {upiAutoPay ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="gs-toggle-row">
              <span className="gs-toggle-label">WhatsApp notifications</span>
              <div className="gs-toggle-control">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={whatsappNotifications}
                    onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className={`gs-toggle-status ${whatsappNotifications ? 'gs-toggle-on' : 'gs-toggle-off'}`}>
                  {whatsappNotifications ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="gs-toggle-row">
              <span className="gs-toggle-label">Reinsurance alerts</span>
              <div className="gs-toggle-control">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={reinsuranceAlerts}
                    onChange={(e) => setReinsuranceAlerts(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className={`gs-toggle-status ${reinsuranceAlerts ? 'gs-toggle-on' : 'gs-toggle-off'}`}>
                  {reinsuranceAlerts ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="gs-toggle-row">
              <span className="gs-toggle-label">New registrations</span>
              <div className="gs-toggle-control">
                <label className="gs-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={newRegistrations}
                    onChange={(e) => setNewRegistrations(e.target.checked)}
                  />
                  <span className="gs-toggle-slider"></span>
                </label>
                <span className={`gs-toggle-status ${newRegistrations ? 'gs-toggle-on' : 'gs-toggle-off'}`}>
                  {newRegistrations ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Admin Info */}
      <div className="gs-settings-section">
        <h2 className="gs-settings-section-title">Admin Account</h2>
        
        <div className="gs-admin-card">
          <div className="gs-admin-info-grid">
            <div className="gs-admin-info-field">
              <span className="gs-admin-info-label">Name</span>
              <span className="gs-admin-info-value">Admin User</span>
            </div>
            <div className="gs-admin-info-field">
              <span className="gs-admin-info-label">Role</span>
              <span className="gs-admin-info-value">System Ops</span>
            </div>
            <div className="gs-admin-info-field">
              <span className="gs-admin-info-label">Email</span>
              <span className="gs-admin-info-value">admin@gigshield.in</span>
            </div>
            <div className="gs-admin-info-field">
              <span className="gs-admin-info-label">Last login</span>
              <span className="gs-admin-info-value">Today, 21:15</span>
            </div>
          </div>
          <button className="gs-btn-outline mt-4">Change Password</button>
        </div>
      </div>

    </div>
  );
};
