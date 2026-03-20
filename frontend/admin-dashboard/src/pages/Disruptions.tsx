import React from 'react';
import { RefreshCw, Zap, CheckCircle } from 'lucide-react';
import './Disruptions.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_ACTIVE_EVENTS = 4;
const MOCK_RIDERS_AFFECTED = 2847;
const MOCK_PAYOUT_QUEUED = 1360000;

const MOCK_ACTIVE_DISRUPTIONS = [
  {
    id: 1,
    severity: 'EXTREME',
    type: 'Heavy Rain',
    status: 'TRIGGER ACTIVE',
    zone: 'Andheri West',
    city: 'Mumbai',
    ridersAffected: 1247,
    rainfall: 127,
    threshold: 50,
    claimsTriggered: 1247,
    payoutPerRider: 480,
    totalPayout: 598560,
    progress: 67,
    apiSources: ['OpenWeather ✓', 'IMD ✓', 'NDMA ✓'],
    updatedAgo: '2 min ago'
  },
  {
    id: 2,
    severity: 'HIGH',
    type: 'AQI Spike',
    status: 'MONITORING',
    zone: 'Koramangala',
    city: 'Bangalore',
    ridersAffected: 893,
    aqiLevel: 387,
    aqiThreshold: 400,
    claimsTriggered: 0,
    proximity: 97,
    apiSources: ['CPCB ✓', 'OpenWeather ✓'],
    updatedAgo: '5 min ago'
  },
  {
    id: 3,
    severity: 'HIGH',
    type: 'Govt Curfew',
    status: 'MONITORING',
    zone: 'Connaught Place',
    city: 'Delhi',
    ridersAffected: 412,
    source: 'Official gazette notification',
    statusText: 'Notification received — verifying scope',
    apiSources: ['Govt API ✓', 'News API ✓'],
    updatedAgo: '12 min ago'
  },
  {
    id: 4,
    severity: 'RESOLVED',
    type: 'Flood Alert',
    status: 'RESOLVED',
    zone: 'T Nagar',
    city: 'Chennai',
    resolvedAt: '14:32 today',
    totalClaimsPaid: 634,
    totalPayout: 304320,
    avgPayoutTime: '0.31 seconds',
    updatedAgo: '2 hours ago'
  }
];

const MOCK_EVENT_HISTORY = [
  { date: '2024-03-18', zone: 'Andheri West, Mumbai', type: 'Heavy Rain', severity: 'Extreme', riders: 1247, payout: 598560, avgTime: '0.28s', status: 'Resolved' },
  { date: '2024-03-17', zone: 'Koramangala, Bangalore', type: 'AQI Spike', severity: 'High', riders: 893, payout: 428640, avgTime: '0.31s', status: 'Resolved' },
  { date: '2024-03-16', zone: 'T Nagar, Chennai', type: 'Flood Alert', severity: 'Extreme', riders: 634, payout: 304320, avgTime: '0.29s', status: 'Resolved' },
  { date: '2024-03-15', zone: 'Banjara Hills, Hyderabad', type: 'Extreme Heat', severity: 'High', riders: 521, payout: 249920, avgTime: '0.33s', status: 'Resolved' },
  { date: '2024-03-14', zone: 'Salt Lake, Kolkata', type: 'Local Strike', severity: 'Moderate', riders: 312, payout: 149760, avgTime: '0.27s', status: 'Resolved' },
  { date: '2024-03-13', zone: 'Whitefield, Bangalore', type: 'Heavy Rain', severity: 'High', riders: 789, payout: 378720, avgTime: '0.30s', status: 'Resolved' },
  { date: '2024-03-12', zone: 'Bandra, Mumbai', type: 'AQI Spike', severity: 'Moderate', riders: 456, payout: 218880, avgTime: '0.32s', status: 'Resolved' },
  { date: '2024-03-11', zone: 'Connaught Place, Delhi', type: 'Govt Curfew', severity: 'High', riders: 678, payout: 325440, avgTime: '0.28s', status: 'Resolved' }
];

export const Disruptions: React.FC = () => {
  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Active Disruptions</h1>
          <p className="gs-admin-page-subtitle">Real-time parametric event monitoring across all zones</p>
        </div>
        <div className="gs-header-actions mt-0">
          <button className="gs-btn-outline"><RefreshCw size={16} className="mr-2" /> Refresh</button>
          <button className="gs-btn-primary">Export</button>
        </div>
      </div>

      {/* 3-Stat Row */}
      <div className="gs-admin-stats-row mb-6">
        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
            <Zap size={24} className="gs-text-red" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Active Events</p>
            <h3 className="gs-stat-value gs-text-red">{MOCK_ACTIVE_EVENTS}</h3>
            <p className="gs-stat-trend gs-text-muted">Across 3 cities</p>
          </div>
        </div>

        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon" style={{ backgroundColor: '#FFFBEB' }}>
            <Zap size={24} className="gs-text-amber" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Riders Affected</p>
            <h3 className="gs-stat-value gs-text-amber">{MOCK_RIDERS_AFFECTED.toLocaleString('en-IN')}</h3>
            <p className="gs-stat-trend gs-text-muted">Claims being processed</p>
          </div>
        </div>

        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon gs-bg-blue-light">
            <Zap size={24} className="gs-text-blue" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Payout Queued</p>
            <h3 className="gs-stat-value gs-text-blue">₹{(MOCK_PAYOUT_QUEUED / 100000).toFixed(1)}L</h3>
            <p className="gs-stat-trend gs-text-muted">Auto-processing now</p>
          </div>
        </div>
      </div>

      {/* Active Disruption Cards */}
      <div className="gs-disruption-cards">
        {MOCK_ACTIVE_DISRUPTIONS.map((disruption) => (
          <div key={disruption.id} className={`gs-disruption-card gs-disruption-${disruption.severity.toLowerCase()}`}>
            <div className="gs-disruption-header">
              <div className="gs-disruption-header-left">
                <span className={`gs-severity-badge gs-severity-${disruption.severity.toLowerCase()}`}>
                  {disruption.severity}
                </span>
                <h3 className="gs-disruption-title">{disruption.type}</h3>
                <Zap size={20} className={`gs-disruption-icon gs-icon-${disruption.severity.toLowerCase()}`} />
                <span className={`gs-status-badge gs-status-${disruption.severity.toLowerCase()}`}>
                  {disruption.status}
                </span>
              </div>
              <div className="gs-disruption-header-right">
                <span className="gs-updated-time">Updated {disruption.updatedAgo}</span>
              </div>
            </div>

            <div className="gs-disruption-details">
              {disruption.severity === 'EXTREME' && disruption.status === 'TRIGGER ACTIVE' && (
                <>
                  <div className="gs-detail-grid">
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Zone</span>
                      <span className="gs-detail-value">{disruption.zone}, {disruption.city}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Riders Affected</span>
                      <span className="gs-detail-value">{disruption.ridersAffected?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Rainfall</span>
                      <span className="gs-detail-value">{disruption.rainfall}mm/hr (threshold: {disruption.threshold}mm)</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Claims Auto-Triggered</span>
                      <span className="gs-detail-value">{disruption.claimsTriggered?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Payout Per Rider</span>
                      <span className="gs-detail-value">₹{disruption.payoutPerRider}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Total Payout</span>
                      <span className="gs-detail-value">₹{disruption.totalPayout?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="gs-progress-section">
                    <div className="gs-progress-header">
                      <span className="gs-progress-label">Payout Processing</span>
                      <span className="gs-progress-percent">{disruption.progress}%</span>
                    </div>
                    <div className="gs-progress-bar">
                      <div className="gs-progress-fill" style={{ width: `${disruption.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="gs-api-sources">
                    {disruption.apiSources?.map((source, idx) => (
                      <span key={idx} className="gs-api-badge">{source}</span>
                    ))}
                  </div>
                  <div className="gs-disruption-actions">
                    <button className="gs-btn-outline">View Claims</button>
                    <button className="gs-btn-danger-outline">Resolve Event</button>
                  </div>
                </>
              )}

              {disruption.severity === 'HIGH' && disruption.type === 'AQI Spike' && (
                <>
                  <div className="gs-detail-grid">
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Zone</span>
                      <span className="gs-detail-value">{disruption.zone}, {disruption.city}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Riders Affected</span>
                      <span className="gs-detail-value">{disruption.ridersAffected?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">AQI Level</span>
                      <span className="gs-detail-value">{disruption.aqiLevel} (threshold: {disruption.aqiThreshold}) — Near threshold</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Claims Triggered</span>
                      <span className="gs-detail-value">{disruption.claimsTriggered} (not yet crossed)</span>
                    </div>
                  </div>
                  <div className="gs-progress-section">
                    <div className="gs-progress-header">
                      <span className="gs-progress-label">{disruption.aqiLevel}/{disruption.aqiThreshold} AQI</span>
                      <span className="gs-progress-percent">{disruption.proximity}%</span>
                    </div>
                    <div className="gs-progress-bar gs-progress-amber">
                      <div className="gs-progress-fill" style={{ width: `${disruption.proximity}%` }}></div>
                    </div>
                  </div>
                  <div className="gs-api-sources">
                    {disruption.apiSources?.map((source, idx) => (
                      <span key={idx} className="gs-api-badge">{source}</span>
                    ))}
                  </div>
                  <div className="gs-disruption-actions">
                    <button className="gs-btn-amber-outline">Watch Zone</button>
                  </div>
                </>
              )}

              {disruption.type === 'Govt Curfew' && (
                <>
                  <div className="gs-detail-grid">
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Zone</span>
                      <span className="gs-detail-value">{disruption.zone}, {disruption.city}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Type</span>
                      <span className="gs-detail-value">Government restriction</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Source</span>
                      <span className="gs-detail-value">{disruption.source}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Riders Affected</span>
                      <span className="gs-detail-value">{disruption.ridersAffected?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item gs-detail-full">
                      <span className="gs-detail-label">Status</span>
                      <span className="gs-detail-value">{disruption.statusText}</span>
                    </div>
                  </div>
                  <div className="gs-api-sources">
                    {disruption.apiSources?.map((source, idx) => (
                      <span key={idx} className="gs-api-badge">{source}</span>
                    ))}
                  </div>
                </>
              )}

              {disruption.severity === 'RESOLVED' && (
                <>
                  <div className="gs-detail-grid">
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Zone</span>
                      <span className="gs-detail-value">{disruption.zone}, {disruption.city}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Resolved at</span>
                      <span className="gs-detail-value">{disruption.resolvedAt}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Total Claims Paid</span>
                      <span className="gs-detail-value">{disruption.totalClaimsPaid?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Total Payout</span>
                      <span className="gs-detail-value">₹{disruption.totalPayout?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-detail-item">
                      <span className="gs-detail-label">Avg Payout Time</span>
                      <span className="gs-detail-value">{disruption.avgPayoutTime}</span>
                    </div>
                  </div>
                  <div className="gs-resolved-badge">
                    <CheckCircle size={16} className="mr-1" /> Event Resolved
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Historical Events Table */}
      <div className="gs-admin-card mt-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Event History (Last 30 days)</h3>
        </div>
        
        <table className="gs-admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Zone</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Riders</th>
              <th>Payout</th>
              <th>Avg Claim Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENT_HISTORY.map((event, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#FFFFFF' }}>
                <td>{event.date}</td>
                <td>{event.zone}</td>
                <td>{event.type}</td>
                <td>{event.severity}</td>
                <td>{event.riders.toLocaleString('en-IN')}</td>
                <td>₹{event.payout.toLocaleString('en-IN')}</td>
                <td>{event.avgTime}</td>
                <td><span className="gs-status-resolved">{event.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
