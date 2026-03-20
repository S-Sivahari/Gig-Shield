import React, { useState } from 'react';
import { Eye, Flag, X, CheckCircle, AlertTriangle } from 'lucide-react';
import './Claims.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_TOTAL_CLAIMS_TODAY = 3847;
const MOCK_AUTO_APPROVED = 3703;
const MOCK_MANUAL_REVIEW = 118;
const MOCK_REJECTED = 26;

const MOCK_CLAIMS = [
  {
    id: 'CLM-48291',
    worker: 'Ramesh Kumar',
    platform: 'Swiggy',
    zone: 'Andheri West',
    disruption: 'Heavy Rain',
    triggerTime: '09:14 AM',
    validation: [true, true, true, true],
    payout: 480,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48290',
    worker: 'Priya Sharma',
    platform: 'Zomato',
    zone: 'Koramangala',
    disruption: 'AQI Spike',
    triggerTime: '09:12 AM',
    validation: [true, true, true, 'pending'],
    payout: null,
    status: 'Processing'
  },
  {
    id: 'CLM-48287',
    worker: 'Suresh Mehta',
    platform: 'Zepto',
    zone: 'Whitefield',
    disruption: 'Heavy Rain',
    triggerTime: '09:08 AM',
    validation: [true, true, false, false],
    payout: 0,
    status: 'Manual Review'
  },
  {
    id: 'CLM-48285',
    worker: 'Abdul Rahman',
    platform: 'Blinkit',
    zone: 'Indiranagar',
    disruption: 'AQI Spike',
    triggerTime: '09:05 AM',
    validation: [true, true, true, true],
    payout: 320,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48283',
    worker: 'Kavitha Lakshmi',
    platform: 'Amazon',
    zone: 'T Nagar',
    disruption: 'Flood Alert',
    triggerTime: '09:02 AM',
    validation: [true, true, true, true],
    payout: 640,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48280',
    worker: 'Mohammed Ansari',
    platform: 'Swiggy',
    zone: 'Banjara Hills',
    disruption: 'Extreme Heat',
    triggerTime: '08:58 AM',
    validation: [true, true, true, true],
    payout: 480,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48278',
    worker: 'Deepak Singh',
    platform: 'Zomato',
    zone: 'Salt Lake',
    disruption: 'Local Strike',
    triggerTime: '08:55 AM',
    validation: [true, false, false, false],
    payout: 0,
    status: 'Rejected'
  },
  {
    id: 'CLM-48275',
    worker: 'Anjali Patel',
    platform: 'Blinkit',
    zone: 'Connaught Place',
    disruption: 'Govt Curfew',
    triggerTime: '08:52 AM',
    validation: [true, true, true, true],
    payout: 480,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48272',
    worker: 'Rajesh Verma',
    platform: 'Zepto',
    zone: 'Powai',
    disruption: 'Heavy Rain',
    triggerTime: '08:48 AM',
    validation: [true, true, true, true],
    payout: 320,
    status: 'Auto-Approved'
  },
  {
    id: 'CLM-48270',
    worker: 'Sneha Reddy',
    platform: 'Swiggy',
    zone: 'Bandra',
    disruption: 'AQI Spike',
    triggerTime: '08:45 AM',
    validation: [true, true, true, 'pending'],
    payout: null,
    status: 'Processing'
  }
];

const PLATFORM_COLORS: Record<string, string> = {
  'Swiggy': '#FC8019',
  'Zomato': '#E23744',
  'Blinkit': '#F8CB46',
  'Zepto': '#8B5CF6',
  'Amazon': '#FF9900'
};

export const Claims: React.FC = () => {
  const [selectedClaim, setSelectedClaim] = useState<typeof MOCK_CLAIMS[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Auto-Approved': return 'gs-status-approved';
      case 'Processing': return 'gs-status-processing';
      case 'Manual Review': return 'gs-status-review';
      case 'Rejected': return 'gs-status-rejected';
      default: return '';
    }
  };

  const renderValidationPipeline = (validation: (boolean | string)[]) => {
    return (
      <div className="gs-validation-pipeline">
        {validation.map((step, idx) => (
          <span key={idx} className="gs-validation-step">
            {step === true && <CheckCircle size={14} className="gs-validation-success" />}
            {step === false && <X size={14} className="gs-validation-error" />}
            {step === 'pending' && <div className="gs-validation-spinner"></div>}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Claims Management</h1>
          <p className="gs-admin-page-subtitle">All parametric claims and their validation pipeline</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="gs-filter-row mb-6">
        <input 
          type="text" 
          placeholder="Search by policy ID or worker name" 
          className="gs-search-input-large"
        />
        <select className="gs-filter-select">
          <option>All Status</option>
          <option>Auto-Approved</option>
          <option>Manual Review</option>
          <option>Rejected</option>
          <option>Pending</option>
          <option>Paid</option>
        </select>
        <select className="gs-filter-select">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
        <select className="gs-filter-select">
          <option>All Platforms</option>
          <option>Zomato</option>
          <option>Swiggy</option>
          <option>Zepto</option>
          <option>Blinkit</option>
          <option>Amazon</option>
        </select>
      </div>

      {/* 4-Stat Row */}
      <div className="gs-claims-stats-row mb-6">
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Total Claims Today</p>
          <h3 className="gs-stat-value" style={{ color: 'var(--navy-admin)' }}>{MOCK_TOTAL_CLAIMS_TODAY.toLocaleString('en-IN')}</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Auto-Approved</p>
          <h3 className="gs-stat-value gs-text-green">{MOCK_AUTO_APPROVED.toLocaleString('en-IN')}</h3>
          <p className="gs-stat-trend gs-text-green">96.2%</p>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Manual Review</p>
          <h3 className="gs-stat-value gs-text-amber">{MOCK_MANUAL_REVIEW}</h3>
          <p className="gs-stat-trend gs-text-amber">Pending</p>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Rejected</p>
          <h3 className="gs-stat-value gs-text-red">{MOCK_REJECTED}</h3>
          <p className="gs-stat-trend gs-text-red">Policy violations</p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="gs-admin-card">
        <table className="gs-admin-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Worker</th>
              <th>Platform</th>
              <th>Zone</th>
              <th>Disruption</th>
              <th>Trigger Time</th>
              <th>Validation</th>
              <th>Payout</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CLAIMS.map((claim) => (
              <tr key={claim.id}>
                <td className="font-medium">{claim.id}</td>
                <td>{claim.worker}</td>
                <td>
                  <span 
                    className="gs-platform-badge" 
                    style={{ backgroundColor: PLATFORM_COLORS[claim.platform], color: '#FFFFFF' }}
                  >
                    {claim.platform}
                  </span>
                </td>
                <td>{claim.zone}</td>
                <td>{claim.disruption}</td>
                <td>{claim.triggerTime}</td>
                <td>{renderValidationPipeline(claim.validation)}</td>
                <td>
                  {claim.payout !== null && claim.payout > 0 && (
                    <span className="gs-payout-amount">₹{claim.payout}</span>
                  )}
                  {claim.payout === 0 && <span className="gs-payout-zero">₹0</span>}
                  {claim.payout === null && <span className="gs-payout-pending">—</span>}
                </td>
                <td>
                  <span className={`gs-claim-status ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </td>
                <td>
                  <div className="gs-action-buttons">
                    <button className="gs-action-btn" onClick={() => setSelectedClaim(claim)}>
                      <Eye size={16} />
                    </button>
                    {claim.status === 'Manual Review' && (
                      <button className="gs-action-btn gs-action-flag">
                        <Flag size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="gs-table-pagination">
          <span className="gs-pagination-info">Showing 1-10 of {MOCK_TOTAL_CLAIMS_TODAY.toLocaleString('en-IN')} claims</span>
          <div className="gs-pagination-controls">
            <button className="gs-pagination-btn">Prev</button>
            <button className="gs-pagination-btn gs-pagination-active">1</button>
            <button className="gs-pagination-btn">2</button>
            <button className="gs-pagination-btn">3</button>
            <span className="gs-pagination-ellipsis">...</span>
            <button className="gs-pagination-btn">385</button>
            <button className="gs-pagination-btn">Next</button>
          </div>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="gs-modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="gs-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gs-modal-header">
              <h2 className="gs-modal-title">Claim Details — {selectedClaim.id}</h2>
              <button className="gs-modal-close" onClick={() => setSelectedClaim(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="gs-modal-body">
              {/* Section 1: Worker Info */}
              <div className="gs-modal-section">
                <h3 className="gs-modal-section-title">Worker Information</h3>
                <div className="gs-modal-grid">
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Name</span>
                    <span className="gs-modal-value">{selectedClaim.worker}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Platform</span>
                    <span className="gs-modal-value">{selectedClaim.platform}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Zone</span>
                    <span className="gs-modal-value">{selectedClaim.zone}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Policy ID</span>
                    <span className="gs-modal-value">POL-{Math.floor(Math.random() * 90000) + 10000}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Plan</span>
                    <span className="gs-modal-value">Standard</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Disruption Info */}
              <div className="gs-modal-section">
                <h3 className="gs-modal-section-title">Disruption Information</h3>
                <div className="gs-modal-grid">
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Type</span>
                    <span className="gs-modal-value">{selectedClaim.disruption}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Severity</span>
                    <span className="gs-modal-value">Extreme</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Trigger Value vs Threshold</span>
                    <span className="gs-modal-value">127mm vs 50mm</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Event Start Time</span>
                    <span className="gs-modal-value">{selectedClaim.triggerTime}</span>
                  </div>
                  <div className="gs-modal-field">
                    <span className="gs-modal-label">Event Duration</span>
                    <span className="gs-modal-value">2.5 hours</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Validation Pipeline */}
              <div className="gs-modal-section">
                <h3 className="gs-modal-section-title">Validation Pipeline</h3>
                <div className="gs-validation-timeline">
                  <div className="gs-timeline-item">
                    <div className={`gs-timeline-icon ${selectedClaim.validation[0] ? 'gs-timeline-success' : 'gs-timeline-error'}`}>
                      {selectedClaim.validation[0] ? <CheckCircle size={16} /> : <X size={16} />}
                    </div>
                    <div className="gs-timeline-content">
                      <div className="gs-timeline-title">
                        {selectedClaim.validation[0] ? 'Step 1 ✅ Event Verified' : 'Step 1 ❌ Event Not Verified'}
                      </div>
                      <div className="gs-timeline-desc">Rainfall 127mm confirmed by OpenWeather + IMD</div>
                      <div className="gs-timeline-time">09:14:02 AM</div>
                    </div>
                  </div>
                  <div className="gs-timeline-item">
                    <div className={`gs-timeline-icon ${selectedClaim.validation[1] ? 'gs-timeline-success' : 'gs-timeline-error'}`}>
                      {selectedClaim.validation[1] ? <CheckCircle size={16} /> : <X size={16} />}
                    </div>
                    <div className="gs-timeline-content">
                      <div className="gs-timeline-title">
                        {selectedClaim.validation[1] ? 'Step 2 ✅ Zone Matched' : 'Step 2 ❌ Zone Mismatch'}
                      </div>
                      <div className="gs-timeline-desc">Worker GPS (19.1136°N, 72.8697°E) within {selectedClaim.zone}</div>
                      <div className="gs-timeline-time">09:14:03 AM</div>
                    </div>
                  </div>
                  <div className="gs-timeline-item">
                    <div className={`gs-timeline-icon ${
                      selectedClaim.validation[2] === true ? 'gs-timeline-success' : 
                      selectedClaim.validation[2] === false ? 'gs-timeline-error' : 
                      'gs-timeline-warning'
                    }`}>
                      {selectedClaim.validation[2] === true && <CheckCircle size={16} />}
                      {selectedClaim.validation[2] === false && <X size={16} />}
                      {selectedClaim.validation[2] === 'pending' && <AlertTriangle size={16} />}
                    </div>
                    <div className="gs-timeline-content">
                      <div className="gs-timeline-title">
                        {selectedClaim.validation[2] === true && 'Step 3 ✅ Validation Check Passed'}
                        {selectedClaim.validation[2] === false && 'Step 3 ❌ Validation Check Failed'}
                        {selectedClaim.validation[2] === 'pending' && 'Step 3 ⚠️ Manual Review Required'}
                      </div>
                      <div className="gs-timeline-desc">
                        {selectedClaim.validation[2] === true && 'No GPS spoof · No duplicate · Activity consistent'}
                        {selectedClaim.validation[2] === false && 'Policy violation detected · Claim rejected'}
                        {selectedClaim.validation[2] === 'pending' && 'Awaiting manual verification'}
                      </div>
                      <div className="gs-timeline-time">09:14:04 AM</div>
                    </div>
                  </div>
                  <div className="gs-timeline-item">
                    <div className={`gs-timeline-icon ${
                      selectedClaim.validation[3] === true ? 'gs-timeline-success' : 
                      selectedClaim.validation[3] === false ? 'gs-timeline-error' : 
                      'gs-timeline-warning'
                    }`}>
                      {selectedClaim.validation[3] === true && <CheckCircle size={16} />}
                      {selectedClaim.validation[3] === false && <X size={16} />}
                      {selectedClaim.validation[3] === 'pending' && <AlertTriangle size={16} />}
                    </div>
                    <div className="gs-timeline-content">
                      <div className="gs-timeline-title">
                        {selectedClaim.validation[3] === true && 'Step 4 ✅ Payout Initiated'}
                        {selectedClaim.validation[3] === false && 'Step 4 ❌ Payout Blocked'}
                        {selectedClaim.validation[3] === 'pending' && 'Step 4 ⏳ Payout Pending'}
                      </div>
                      <div className="gs-timeline-desc">
                        {selectedClaim.validation[3] === true && `₹${selectedClaim.payout} sent to UPI: ${selectedClaim.worker.toLowerCase().replace(' ', '')}@okicici`}
                        {selectedClaim.validation[3] === false && 'Payout blocked due to failed validation'}
                        {selectedClaim.validation[3] === 'pending' && 'Awaiting fraud check completion'}
                      </div>
                      {selectedClaim.validation[3] === true && (
                        <div className="gs-timeline-score">Completed in 0.28 seconds</div>
                      )}
                      <div className="gs-timeline-time">09:14:05 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: API Evidence */}
              <div className="gs-modal-section">
                <h3 className="gs-modal-section-title">API Evidence</h3>
                <div className="gs-api-sources">
                  <span className="gs-api-badge">OpenWeather API ✓</span>
                  <span className="gs-api-badge">IMD Rainfall ✓</span>
                  <span className="gs-api-badge">GPS Verified ✓</span>
                  <span className="gs-api-badge">{selectedClaim.platform} Activity ✓</span>
                </div>
              </div>
            </div>

            <div className="gs-modal-footer">
              <button className="gs-btn-outline">Download Report</button>
              <button className="gs-btn-primary" onClick={() => setSelectedClaim(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
