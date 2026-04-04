import React, { useMemo, useState, useEffect } from 'react';
import { ShieldAlert, CloudRain, Wind, Thermometer, TrendingUp, FileText, Zap, Wallet, Map } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { CITY_WEATHER_MOCK, getCityWeather } from '../mocks/cityWeatherMock';
import { calculateAdminPlans } from '../services/insuranceEngineLite';
import {
  DEFAULT_TRIGGER_THRESHOLDS,
  checkDisruption,
  normalizeThresholds,
  type TriggerThresholds,
} from '../services/weatherMonitorLite';
import './AdminDashboard.css';

const CROSS_APP_DISRUPTION_COOKIE = 'gigshield_active_disruption';

interface WorkerDisruptionSignal {
  city: string;
  zone: string;
  rainfallMm: number;
  level: 'none' | 'watch' | 'alert' | 'severe';
  status: string;
  estimatedPayout: number;
  updatedAt: string;
}

interface ThreatAreaMarker {
  city: string;
  area: string;
  riskType: string;
  rainfallMm: number;
  source: 'admin' | 'worker';
  updatedAt: string;
}

function readCookieValue(name: string): string | null {
  const prefix = `${name}=`;
  const chunks = document.cookie.split(';');
  for (const chunk of chunks) {
    const value = chunk.trim();
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length);
    }
  }
  return null;
}

function readWorkerDisruptionSignal(): WorkerDisruptionSignal | null {
  if (typeof document === 'undefined') return null;
  try {
    const raw = readCookieValue(CROSS_APP_DISRUPTION_COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw)) as WorkerDisruptionSignal;
    if (!parsed.city || !parsed.zone || !parsed.updatedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [vehicleType, setVehicleType] = useState<'2-wheeler' | '4-wheeler'>('2-wheeler');
  const [zoneType, setZoneType] = useState<'core' | 'urban' | 'suburban'>('urban');
  const [persona, setPersona] = useState<'courier' | 'shopper' | 'rideshare'>('courier');
  const [weeklyIncome, setWeeklyIncome] = useState(5000);
  const [simulatedRainMm, setSimulatedRainMm] = useState<number | null>(null);
  const [thresholds, setThresholds] = useState<TriggerThresholds>(DEFAULT_TRIGGER_THRESHOLDS);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [claimsFeed, setClaimsFeed] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLine, setSummaryLine] = useState('');
  const [workerSignal, setWorkerSignal] = useState<WorkerDisruptionSignal | null>(null);
  const [threatAreas, setThreatAreas] = useState<ThreatAreaMarker[]>([]);

  const mockWeather = getCityWeather(selectedCity);
  const activeRainMm = simulatedRainMm ?? mockWeather.rainfallMm;
  const disruptionReport = checkDisruption(activeRainMm, thresholds);
  const workerSignalActive = Boolean(workerSignal && (Date.now() - new Date(workerSignal.updatedAt).getTime()) < 30 * 60 * 1000 && workerSignal.level !== 'none');

  const upsertThreatArea = (marker: ThreatAreaMarker) => {
    setThreatAreas((prev) => {
      const filtered = prev.filter((item) => item.area !== marker.area);
      return [marker, ...filtered].slice(0, 6);
    });
  };

  const planPreview = calculateAdminPlans({
    income: weeklyIncome,
    zone: zoneType,
    vehicle: vehicleType,
    persona,
    disruptionLevel: disruptionReport.level,
  });

  const projectedPayoutPerClaim = Math.round(
    weeklyIncome * (planPreview.plans[1].coveragePercent / 100) * (disruptionReport.payoutPercent / 100),
  );

  const expectedClaims = disruptionReport.level === 'severe'
    ? 12
    : disruptionReport.level === 'alert'
      ? 8
      : disruptionReport.level === 'watch'
        ? 4
        : 0;

  const generatedClaims = useMemo(() => {
    return Array.from({ length: expectedClaims }).map((_, index) => {
      const claimId = 10200 + (index * 73);
      const amount = Math.max(280, projectedPayoutPerClaim || Math.round(weeklyIncome * 0.35));
      const reviewFlag = index % 6 === 0;

      if (reviewFlag) {
        return `GS-${claimId} · Manual review queue · Rs ${amount}`;
      }

      return `GS-${claimId} · Auto-approved · Rs ${amount} · ${disruptionReport.level.toUpperCase()}`;
    });
  }, [expectedClaims, projectedPayoutPerClaim, weeklyIncome, disruptionReport.level]);

  const activePolicyCount = 24592;
  const totalPremiumsCollected = activePolicyCount * planPreview.plans[1].premium;
  const queuedExposure = projectedPayoutPerClaim * expectedClaims;
  const totalProjectedLiability = Math.max(1, queuedExposure);
  const rawCoverageRatio = totalPremiumsCollected / totalProjectedLiability;
  const solvencyRatio = Math.max(0, Math.min(100, Math.round(rawCoverageRatio * 100)));

  const activeDisruptedWorkers = useMemo(() => {
    if (!disruptionReport.triggered) return [];

    const workerNames = ['Ramesh K', 'Priya S', 'Abdul R', 'Sneha P', 'Kavitha L', 'Vijay M', 'Anita D', 'Arun V'];
    return workerNames.map((name, index) => {
      const payout = Math.round(projectedPayoutPerClaim * (0.78 + (index % 3) * 0.11));
      return {
        id: `GS-W-${3100 + index}`,
        name,
        zone: `${selectedCity} · ${zoneType}`,
        rainfallMm: activeRainMm,
        payout,
        status: index % 5 === 0 ? 'Pending' : 'Approved',
      };
    });
  }, [disruptionReport.triggered, projectedPayoutPerClaim, selectedCity, zoneType, activeRainMm]);

  const currentEventLiability = activeDisruptedWorkers.reduce((sum, worker) => sum + worker.payout, 0);

  useEffect(() => {
    const updateSignal = () => {
      setWorkerSignal(readWorkerDisruptionSignal());
    };

    updateSignal();
    const interval = window.setInterval(updateSignal, 1500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!workerSignalActive || !workerSignal) return;
    upsertThreatArea({
      city: workerSignal.city,
      area: `${workerSignal.zone}, ${workerSignal.city}`,
      riskType: 'Flood Alert',
      rainfallMm: workerSignal.rainfallMm,
      source: 'worker',
      updatedAt: workerSignal.updatedAt,
    });
  }, [workerSignalActive, workerSignal]);

  const payoutTrend = [
    { name: 'Mon', payouts: 4000 },
    { name: 'Tue', payouts: 3000 },
    { name: 'Wed', payouts: 2000 },
    { name: 'Thu', payouts: 2780 },
    { name: 'Fri', payouts: 8900 },
    { name: 'Sat', payouts: 12390 },
    { name: 'Sun', payouts: 3490 },
  ];

  const platformData = [
    { name: 'Swiggy', value: 8420 },
    { name: 'Zomato', value: 7891 },
    { name: 'Blinkit', value: 3204 },
    { name: 'Zepto', value: 2847 },
    { name: 'Amazon', value: 1632 },
    { name: 'Others', value: 598 },
  ];

  const handleFireTrigger = () => {
    const safeThresholds = normalizeThresholds(thresholds);
    const forcedRain = Math.max(activeRainMm, safeThresholds.alert + 2);
    const forcedReport = checkDisruption(forcedRain, safeThresholds);

    setThresholds(safeThresholds);
    setSimulatedRainMm(forcedRain);

    if (forcedReport.triggered) {
      upsertThreatArea({
        city: selectedCity,
        area: `${selectedCity} (${zoneType})`,
        riskType: 'Flood Alert',
        rainfallMm: forcedRain,
        source: 'admin',
        updatedAt: new Date().toISOString(),
      });
    }

    setIsSimulating(true);
    setSimulationStep(1);
    setClaimsFeed([]);
    setShowSummary(false);
    setSummaryLine('');
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setClaimsFeed([]);
    setShowSummary(false);
    setSummaryLine('');
    setSimulatedRainMm(null);
  };

  useEffect(() => {
    if (!isSimulating) return;

    if (simulationStep === 1) {
      const timer = setTimeout(() => setSimulationStep(2), 1400);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 2) {
      const timer = setTimeout(() => setSimulationStep(3), 1400);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 3) {
      if (!disruptionReport.triggered) {
        const timer = setTimeout(() => {
          setSummaryLine('No payout triggered: rainfall did not cross alert threshold.');
          setShowSummary(true);
          setIsSimulating(false);
        }, 900);
        return () => clearTimeout(timer);
      }

      const timer = setTimeout(() => setSimulationStep(4), 1000);
      return () => clearTimeout(timer);
    }

    if (simulationStep === 4) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < generatedClaims.length) {
          setClaimsFeed((prev) => [...prev, generatedClaims[currentIndex]]);
          currentIndex += 1;
        } else {
          clearInterval(interval);
          const flagged = generatedClaims.filter((line) => line.includes('Manual review')).length;
          const autoApproved = generatedClaims.length - flagged;
          const payoutQueue = autoApproved * projectedPayoutPerClaim;
          setSummaryLine(`${autoApproved} auto-approved · ${flagged} flagged · Rs ${Math.max(0, payoutQueue).toLocaleString('en-IN')} queued`);
          setShowSummary(true);
        }
      }, 350);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [simulationStep, isSimulating, generatedClaims, projectedPayoutPerClaim, disruptionReport.triggered]);

  return (
    <div className="gs-admin-page animate-fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Operations Dashboard</h1>
          <p className="gs-admin-page-subtitle">Trigger health, solvency, and claim automation controls</p>
        </div>
        <div className="gs-admin-date-picker">Oct 8 - Oct 14, 2024</div>
      </div>

      <div className="gs-admin-stats-row mb-6">
        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon gs-bg-blue-light">
            <ShieldAlert size={24} className="gs-text-blue" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Active Policies</p>
            <h3 className="gs-stat-value">{activePolicyCount.toLocaleString('en-IN')}</h3>
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
            <h3 className="gs-stat-value">Rs 3.4L</h3>
            <p className="gs-stat-trend gs-text-red">
              <TrendingUp size={14} /> +45% this week
            </p>
          </div>
        </div>

        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <Wallet size={24} style={{ color: '#92400E' }} />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Solvency Gauge (Premiums vs Liability)</p>
            <h3 className="gs-stat-value">{solvencyRatio}%</h3>
            <div className="gs-solvency-track">
              <div className="gs-solvency-fill" style={{ width: `${solvencyRatio}%` }} />
            </div>
            <p className="gs-stat-trend" style={{ marginTop: '6px' }}>
              Premiums Rs {totalPremiumsCollected.toLocaleString('en-IN')} · Liability Rs {totalProjectedLiability.toLocaleString('en-IN')} · Coverage {rawCoverageRatio.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      <div className="gs-admin-grid">
        <div className="gs-admin-card gs-span-2">
          <div className="gs-admin-card-header">
            <h3 className="gs-admin-card-title">Weekly Payout Trend</h3>
          </div>
          <div className="gs-admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payoutTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} tickFormatter={(val) => `Rs ${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => {
                    if (value === undefined || value === null) return ['', ''];
                    return [`Rs ${Number(value).toLocaleString('en-IN')}`, ''];
                  }}
                />
                <Line type="monotone" dataKey="payouts" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gs-admin-card">
          <div className="gs-admin-card-header flex-between mb-4">
            <h3 className="gs-admin-card-title">Live Risk AI</h3>
            <span className="gs-badge" style={{ backgroundColor: 'var(--warning-amber)', color: '#FFFFFF' }}>{disruptionReport.level.toUpperCase()}</span>
          </div>

          {workerSignalActive && workerSignal && (
            <div className="gs-worker-threat-banner">
              ⚠️ Worker app flagged {workerSignal.zone}, {workerSignal.city} as THREAT · {workerSignal.rainfallMm}mm
            </div>
          )}

          <div className="gs-risk-list mt-2">
            {threatAreas.map((area) => (
              <div key={area.area} className="gs-risk-item gs-risk-item--threat">
                <div className="gs-risk-header flex-between mb-1">
                  <span className="gs-risk-zone font-medium">{area.area}</span>
                  <span className="gs-risk-prob gs-risk-threat-text font-semibold">{area.riskType}</span>
                </div>
                <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                  <CloudRain size={16} className="gs-text-red mr-2" />
                  <span>{area.rainfallMm}mm · Source: {area.source === 'worker' ? 'Worker app' : 'Admin simulator'}</span>
                </div>
              </div>
            ))}

            {workerSignalActive && workerSignal && (
              <div className="gs-risk-item gs-risk-item--threat">
                <div className="gs-risk-header flex-between mb-1">
                  <span className="gs-risk-zone font-medium">{workerSignal.city}</span>
                  <span className="gs-risk-prob gs-risk-threat-text font-semibold">THREAT</span>
                </div>
                <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                  <CloudRain size={16} className="gs-text-red mr-2" />
                  <span>{workerSignal.zone} · {workerSignal.rainfallMm}mm · Auto signal from worker app</span>
                </div>
              </div>
            )}

            <div
              className="gs-risk-item gs-risk-item--clickable"
              onClick={() => upsertThreatArea({
                city: selectedCity,
                area: `${selectedCity} (${zoneType})`,
                riskType: activeRainMm >= thresholds.alert ? 'Flood Alert' : 'Rain Watch',
                rainfallMm: activeRainMm,
                source: 'admin',
                updatedAt: new Date().toISOString(),
              })}
            >
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">{selectedCity}</span>
                <span className="gs-risk-prob gs-text-red font-semibold">{planPreview.riskLabel}</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <CloudRain size={16} className="gs-text-red mr-2" />
                <span>Rainfall {activeRainMm}mm · {disruptionReport.statusLabel}</span>
              </div>
            </div>

            <div
              className="gs-risk-item gs-risk-item--clickable"
              onClick={() => upsertThreatArea({
                city: 'Bangalore',
                area: 'Koramangala, Bangalore',
                riskType: 'Local Flood Watch',
                rainfallMm: Math.max(activeRainMm, 18),
                source: 'admin',
                updatedAt: new Date().toISOString(),
              })}
            >
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">Koramangala</span>
                <span className="gs-risk-prob gs-text-amber font-semibold">60% Prob</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <Wind size={16} className="gs-text-amber mr-2" />
                <span>AQI spiking (&gt;150)</span>
              </div>
            </div>

            <div
              className="gs-risk-item gs-no-border gs-risk-item--clickable"
              onClick={() => upsertThreatArea({
                city: 'Bangalore',
                area: 'Whitefield, Bangalore',
                riskType: 'Rain Threat',
                rainfallMm: Math.max(activeRainMm, 12),
                source: 'admin',
                updatedAt: new Date().toISOString(),
              })}
            >
              <div className="gs-risk-header flex-between mb-1">
                <span className="gs-risk-zone font-medium">Whitefield</span>
                <span className="gs-risk-prob gs-text-green font-semibold">Low Risk</span>
              </div>
              <div className="gs-risk-trigger text-sm text-gray-500 flex items-center">
                <Thermometer size={16} className="gs-text-green mr-2" />
                <span>Normal conditions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gs-admin-grid mt-6">
        <div className="gs-admin-card gs-span-2">
          <div className="gs-admin-card-header mb-4">
            <h3 className="gs-admin-card-title">Active Policies by Platform</h3>
          </div>
          <div className="gs-platform-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6B7280' }} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [Number(value ?? 0).toLocaleString('en-IN'), 'Policies']}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(v) => Number(v ?? 0).toLocaleString('en-IN')}
                    style={{ fontSize: 12, fill: '#6B7280' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gs-admin-card">
          <div className="gs-admin-card-header mb-4">
            <h3 className="gs-admin-card-title">Quick Actions</h3>
          </div>
          <div className="gs-quick-actions">
            <button className="gs-quick-action-btn" onClick={() => navigate('/claims')}>
              <FileText size={18} className="mr-2" />
              <span>View Pending Claims (118)</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/disruptions')}>
              <Zap size={18} className="mr-2" />
              <span>View Active Disruptions (4)</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/payouts')}>
              <Wallet size={18} className="mr-2" />
              <span>Payout Reconciliation</span>
            </button>
            <button className="gs-quick-action-btn" onClick={() => navigate('/zone-map')}>
              <Map size={18} className="mr-2" />
              <span>Open Zone Map</span>
            </button>
          </div>
        </div>
      </div>

      <div className="gs-admin-card mt-6">
        <div className="gs-admin-card-header flex-between mb-4">
          <h3 className="gs-admin-card-title">Active Disrupted Workers</h3>
          <span className="gs-badge" style={{ backgroundColor: '#111827', color: '#FFFFFF' }}>
            Liability: Rs {currentEventLiability.toLocaleString('en-IN')}
          </span>
        </div>

        {!disruptionReport.triggered && (
          <div className="gs-feed-empty" style={{ minHeight: '120px' }}>
            No active disrupted workers for current weather conditions.
          </div>
        )}

        {disruptionReport.triggered && (
          <div className="gs-admin-table-wrap">
            <table className="gs-admin-table">
              <thead>
                <tr>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th>Zone</th>
                  <th>Rainfall</th>
                  <th>Estimated Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeDisruptedWorkers.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.id}</td>
                    <td>{worker.name}</td>
                    <td>{worker.zone}</td>
                    <td>{worker.rainfallMm}mm</td>
                    <td>Rs {worker.payout.toLocaleString('en-IN')}</td>
                    <td>{worker.status}</td>
                  </tr>
                ))}
                {workerSignalActive && workerSignal && (
                  <tr>
                    <td>GS-W-SIGNAL</td>
                    <td>Worker Broadcast</td>
                    <td>{workerSignal.zone}, {workerSignal.city}</td>
                    <td>{workerSignal.rainfallMm}mm</td>
                    <td>Rs {Math.max(workerSignal.estimatedPayout, 0).toLocaleString('en-IN')}</td>
                    <td>Threat</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="gs-simulator-section mt-6">
        <div className="gs-simulator-header mb-4">
          <h3 className="gs-simulator-title">Disruption Simulator</h3>
          <p className="gs-simulator-subtitle">Trigger model with rainfall threshold sliders and claim auto-feed</p>
        </div>

        <div className="gs-simulator-card">
          <div className="gs-simulator-controls">
            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Select City</label>
              <select
                className="gs-simulator-select"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSimulatedRainMm(null);
                }}
                disabled={isSimulating}
              >
                {CITY_WEATHER_MOCK.map((row) => (
                  <option key={row.city} value={row.city}>{row.city}</option>
                ))}
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Weekly Income</label>
              <input
                className="gs-simulator-select"
                type="number"
                value={weeklyIncome}
                onChange={(e) => setWeeklyIncome(Number(e.target.value) || 0)}
                disabled={isSimulating}
              />
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Vehicle</label>
              <select
                className="gs-simulator-select"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as '2-wheeler' | '4-wheeler')}
                disabled={isSimulating}
              >
                <option value="2-wheeler">2-Wheeler</option>
                <option value="4-wheeler">4-Wheeler</option>
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Zone Type</label>
              <select
                className="gs-simulator-select"
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as 'core' | 'urban' | 'suburban')}
                disabled={isSimulating}
              >
                <option value="core">Core</option>
                <option value="urban">Urban</option>
                <option value="suburban">Suburban</option>
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Persona</label>
              <select
                className="gs-simulator-select"
                value={persona}
                onChange={(e) => setPersona(e.target.value as 'courier' | 'shopper' | 'rideshare')}
                disabled={isSimulating}
              >
                <option value="courier">Courier</option>
                <option value="shopper">Shopper</option>
                <option value="rideshare">Ride-share</option>
              </select>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Rainfall Simulation ({activeRainMm}mm)</label>
              <input
                className="gs-simulator-range"
                type="range"
                min="0"
                max="50"
                value={activeRainMm}
                onChange={(e) => setSimulatedRainMm(Number(e.target.value))}
                disabled={isSimulating}
              />
              <p className="gs-admin-page-subtitle" style={{ fontSize: '12px' }}>
                Baseline city rain: {mockWeather.rainfallMm}mm
              </p>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Global Trigger Thresholds (mm)</label>
              <div className="gs-threshold-grid">
                <label>
                  Watch ({thresholds.watch})
                  <input
                    type="range"
                    min="4"
                    max="20"
                    value={thresholds.watch}
                    onChange={(e) => setThresholds((prev) => normalizeThresholds({ ...prev, watch: Number(e.target.value) }))}
                    disabled={isSimulating}
                  />
                </label>
                <label>
                  Alert ({thresholds.alert})
                  <input
                    type="range"
                    min="8"
                    max="30"
                    value={thresholds.alert}
                    onChange={(e) => setThresholds((prev) => normalizeThresholds({ ...prev, alert: Number(e.target.value) }))}
                    disabled={isSimulating}
                  />
                </label>
                <label>
                  Severe ({thresholds.severe})
                  <input
                    type="range"
                    min="12"
                    max="40"
                    value={thresholds.severe}
                    onChange={(e) => setThresholds((prev) => normalizeThresholds({ ...prev, severe: Number(e.target.value) }))}
                    disabled={isSimulating}
                  />
                </label>
              </div>
            </div>

            <div className="gs-simulator-field">
              <label className="gs-simulator-label">Plan Preview (Rs/week)</label>
              <div className="gs-admin-plan-row">
                {planPreview.plans.map((plan) => (
                  <div key={plan.id} className="gs-admin-plan-chip">
                    <span>{plan.name}</span>
                    <strong>Rs {plan.premium}</strong>
                  </div>
                ))}
              </div>
              <p className="gs-admin-page-subtitle" style={{ fontSize: '12px', marginTop: '6px' }}>
                {disruptionReport.statusLabel} · Triggered: {disruptionReport.triggered ? 'Yes' : 'No'}
              </p>
            </div>

            {!isSimulating && (
              <button className="gs-fire-trigger-btn" onClick={handleFireTrigger}>
                Fire Trigger
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
                <div className="gs-feed-empty">Fire a trigger to validate threshold logic and claim creation</div>
              )}

              {simulationStep >= 1 && (
                <div className="gs-feed-step gs-feed-amber">
                  <div className="gs-feed-spinner"></div>
                  <span>Verifying rainfall from city mock feed...</span>
                </div>
              )}

              {simulationStep >= 2 && (
                <div className="gs-feed-step gs-feed-amber">
                  <div className="gs-feed-spinner"></div>
                  <span>Applying threshold model and solvency guardrails...</span>
                </div>
              )}

              {simulationStep >= 3 && (
                <div className="gs-feed-step gs-feed-green">
                  <span className="gs-feed-checkmark">✓</span>
                  <span>{disruptionReport.triggered ? 'Disruption confirmed. Publishing claim intents...' : 'No trigger event. Monitoring continues.'}</span>
                </div>
              )}

              {claimsFeed.map((claim, idx) => (
                <div key={idx} className="gs-feed-claim">{claim}</div>
              ))}

              {showSummary && (
                <div className="gs-feed-summary">{summaryLine}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
