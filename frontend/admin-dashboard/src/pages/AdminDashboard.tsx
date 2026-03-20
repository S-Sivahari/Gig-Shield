import React, { useState, useEffect } from 'react';
import { ShieldAlert, CloudRain, Wind, Thermometer, TrendingUp, FileText, Zap, Wallet, Map } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Simulator state
  const [selectedZone, setSelectedZone] = useState('Koramangala Bangalore');
  const [disruptionType, setDisruptionType] = useState('Heavy Rain');
  const [severity, setSeverity] = useState<'Moderate' | 'High' | 'Extreme'>('Moderate');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [claimsFeed, setClaimsFeed] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Mock data for weekly payout trend
  const data = [
    { name: 'Mon', payouts: 4000 },
    { name: 'Tue', payouts: 3000 },
    { name: 'Wed', payouts: 2000 },
    { name: 'Thu', payouts: 2780 },
    { name: 'Fri', payouts: 8900 },
    { name: 'Sat', payouts: 12390 },
    { name: 'Sun', payouts: 3490 },
  ];

  // ─── MOCK DATA — replace with API call later ───
  const platformData = [
    { name: 'Swiggy', value: 8420 },
    { name: 'Zomato', value: 7891 },
    { name: 'Blinkit', value: 3204 },
    { name: 'Zepto', value: 2847 },
    { name: 'Amazon', value: 1632 },
    { name: 'Others', value: 598 }
  ];

  const mockClaims = [
    '🟢 GS-10293 · Ramesh K. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-10847 · Priya S. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-11203 · Abdul R. · ₹320 · Auto-approved (0.3s)',
    '🟡 GS-10391 · Suresh M. · Flagged for review',
    '🟢 GS-12048 · Kavitha L. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-10773 · Mohammed A. · ₹640 · Auto-approved (0.2s)',
    '🟢 GS-11892 · Deepak S. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-10456 · Anjali P. · ₹320 · Auto-approved (0.3s)',
    '🟢 GS-11567 · Rajesh V. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-10234 · Sneha R. · ₹480 · Auto-approved (0.3s)',
    '🟢 GS-11890 · Vijay K. · ₹320 · Auto-approved (0.2s)',
    '🟢 GS-10678 · Meera I. · ₹480 · Auto-approved (0.3s)'
  ];

  const handleFireTrigger = () => {
    setIsSimulating(true);
    setSimulationStep(1);
    setClaimsFeed([]);
    setShowSummary(false);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setClaimsFeed([]);
    setShowSummary(false);
  };

  useEffect(() => {
    if (!isSimulating) return;

    if (simulationStep === 1) {
      const timer = setTimeout(() => setSimulationStep(2), 1500);
      return () => clearTimeout(timer);
    }
    
    if (simulationStep === 2) {
      const timer = setTimeout(() => setSimulationStep(3), 1500);
      return () => clearTimeout(timer);
    }
    
    if (simulationStep === 3) {
      const timer = setTimeout(() => setSimulationStep(4), 1000);
      return () => clearTimeout(timer);
    }
    
    if (simulationStep === 4) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < mockClaims.length) {
          setClaimsFeed(prev => [...prev, mockClaims[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowSummary(true);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [simulationStep, isSimulating]);

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Operations Dashboard</h1>
          <p className="gs-admin-page-subtitle">Overview of system health and payouts</p>
        </div>
        <div className="gs-admin-date-picker">
          Oct 8 - Oct 14, 2024
        </div>
      </div>

      {/* 2-Stat Row */}
      <div className="gs-admin-stats-row mb-6">
        
        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon gs-bg-blue-light">
            <ShieldAlert size={24} className="gs-text-blue" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Active Policies</p>
            <h3 className="gs-stat-value">24,592</h3>
            <p className="gs-stat-trend gs-text-green">
              <TrendingUp size={14} /> +12% this week
            </p>
          </div>
        </div>

        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon" style={{ backgroundColor: '#DCFCE7' }}>
            <TrendingUp size={24} className="gs-text-green" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Total Payouts (7d)</p>
            <h3 className="gs-stat-value">₹3.4L</h3>
            <p className="gs-stat-trend gs-text-red">
              <TrendingUp size={14} /> +45% this week
            </p>
          </div>
        </div>

      </div>

      <div className="gs-admin-grid">
        
        {/* Weekly Payout Trend Chart */}
        <div className="gs-admin-card gs-span-2">
          <div className="gs-admin-card-header">
            <h3 className="gs-admin-card-title">Weekly Payout Trend</h3>
          </div>
          <div className="gs-admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => {
                    if (value === undefined || value === null) return ['', ''];
                    return [`₹${Number(value).toLocaleString('en-IN')}`, ''];
                  }}
                />
                <Line type="monotone" dataKey="payouts" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Risk Widget */}
        <div className="gs-admin-card">
          <div className="gs-admin-card-header flex-between mb-4">
            <h3 className="gs-admin-card-title">Live Risk AI</h3>
            <span className="gs-badge" style={{ backgroundColor: 'var(--warning-amber)', color: '#FFFFFF' }}>High Alert</span>
          </div>
          
          <div className="gs-risk-list mt-2">
            
            <div className="gs-risk-item">
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">Indiranagar</span>
                <span className="gs-risk-prob gs-text-red font-semibold">85% Prob</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <CloudRain size={16} className="gs-text-red mr-2" />
                <span>Heavy Rain Forecast (next 2h)</span>
              </div>
            </div>

            <div className="gs-risk-item">
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">Koramangala</span>
                <span className="gs-risk-prob gs-text-amber font-semibold">60% Prob</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <Wind size={16} className="gs-text-amber mr-2" />
                <span>AQI Spiking (&gt;150)</span>
              </div>
            </div>

            <div className="gs-risk-item gs-no-border">
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">Whitefield</span>
                <span className="gs-risk-prob gs-text-green font-semibold">Low Risk</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <Thermometer size={16} className="gs-text-green mr-2" />
                <span>Normal Conditions</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Platform Breakdown */}
      <div className="gs-admin-grid mt-6">
        <div className="gs-admin-card gs-span-2">
          <div className="gs-admin-card-header mb-4">
            <h3 className="gs-admin-card-title">Active Policies by Platform</h3>
          </div>
          <div className="gs-platform-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#6B7280' }} 
                  width={70}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [value.toLocaleString('en-IN'), "Policies"]}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    formatter={(v: any) => v.toLocaleString('en-IN')}
                    style={{ fontSize: 12, fill: '#6B7280' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="gs-admin-card">
          <div className="gs-admin-card-header mb-4">
            <h3 className="gs-admin-card-title">Quick Actions</h3>
          </div>
          <div className="gs-quick-actions">
            <button className="gs-quick-action-btn" onClick={() => navigate('/claims')}>
              <FileText size={18} className="mr-2" />
              <span>📋 View Pending Claims (118)</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/disruptions')}>
              <Zap size={18} className="mr-2" />
              <span>🚨 View Active Disruptions (4)</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/payouts')}>
              <Wallet size={18} className="mr-2" />
              <span>💰 Payout Reconciliation</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/zone-map')}>
              <Map size={18} className="mr-2" />
              <span>🗺️ Open Zone Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Disruption Simulator */}
      <div className="gs-simulator-section mt-6">
        <div className="gs-simulator-header mb-4">
          <h3 className="gs-simulator-title">Disruption Simulator</h3>
          <p className="gs-simulator-subtitle">Trigger a parametric event to test the claim pipeline</p>
        </div>

        <div className="gs-simulator-card">
          <div className="gs-simulator-controls">
            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Select Zone</label>
              <select 
                className="gs-simulator-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                disabled={isSimulating}
              >
                <option>Koramangala Bangalore</option>
                <option>Andheri West Mumbai</option>
                <option>Connaught Place Delhi</option>
                <option>T Nagar Chennai</option>
                <option>Banjara Hills Hyderabad</option>
                <option>Salt Lake Kolkata</option>
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Disruption Type</label>
              <select 
                className="gs-simulator-select"
                value={disruptionType}
                onChange={(e) => setDisruptionType(e.target.value)}
                disabled={isSimulating}
              >
                <option>Heavy Rain</option>
                <option>AQI Spike</option>
                <option>Flood Alert</option>
                <option>Extreme Heat</option>
                <option>Govt Curfew</option>
                <option>Local Strike</option>
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Severity</label>
              <div className="gs-severity-pills">
                <button 
                  className={`gs-severity-pill ${severity === 'Moderate' ? 'gs-severity-moderate-active' : 'gs-severity-moderate'}`}
                  onClick={() => setSeverity('Moderate')}
                  disabled={isSimulating}
                >
                  Moderate
                </button>
                <button 
                  className={`gs-severity-pill ${severity === 'High' ? 'gs-severity-high-active' : 'gs-severity-high'}`}
                  onClick={() => setSeverity('High')}
                  disabled={isSimulating}
                >
                  High
                </button>
                <button 
                  className={`gs-severity-pill ${severity === 'Extreme' ? 'gs-severity-extreme-active' : 'gs-severity-extreme'}`}
                  onClick={() => setSeverity('Extreme')}
                  disabled={isSimulating}
                >
                  Extreme
                </button>
              </div>
            </div>

            {!isSimulating && (
              <button className="gs-fire-trigger-btn" onClick={handleFireTrigger}>
                🔴 Fire Trigger
              </button>
            )}

            {showSummary && (
              <button className="gs-reset-btn" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>

          <div className="gs-simulator-feed">
            <label className="gs-feed-label">LIVE CLAIM FEED</label>
            <div className="gs-feed-box">
              {!isSimulating && claimsFeed.length === 0 && (
                <div className="gs-feed-empty">
                  Fire a trigger to see claims auto-created in real time
                </div>
              )}

              {simulationStep >= 1 && (
                <div className="gs-feed-step gs-feed-amber">
                  <div className="gs-feed-spinner"></div>
                  <span>Verifying disruption via OpenWeather API...</span>
                </div>
              )}

              {simulationStep >= 2 && (
                <div className="gs-feed-step gs-feed-amber">
                  <div className="gs-feed-spinner"></div>
                  <span>Cross-checking with IMD rainfall data...</span>
                </div>
              )}

              {simulationStep >= 3 && (
                <div className="gs-feed-step gs-feed-green">
                  <span className="gs-feed-checkmark">✓</span>
                  <span>Disruption confirmed. Notifying 847 active riders...</span>
                </div>
              )}

              {claimsFeed.map((claim, idx) => (
                <div key={idx} className="gs-feed-claim">
                  {claim}
                </div>
              ))}

              {showSummary && (
                <div className="gs-feed-summary">
                  ✅ 11 claims auto-approved · 1 flagged · ₹5,280 queued for payout · Avg: 0.28s per claim
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
