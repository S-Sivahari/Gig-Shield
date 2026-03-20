import React from 'react';
import { CheckCircle, X, RefreshCw } from 'lucide-react';
import './Payouts.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_PROCESSED_TODAY = 1840000;
const MOCK_SUCCESS_RATE = 99.2;
const MOCK_FAILED_RETRY = 28;
const MOCK_AVG_TRANSFER_TIME = 0.31;

const MOCK_AUTOPAY_COLLECTED = 2188608;
const MOCK_WORKERS_DEDUCTED = 24592;
const MOCK_FAILED_DEDUCTIONS = 47;
const MOCK_TARGET = 2210000;

const MOCK_PAYOUTS = [
  { id: 'PAY-93821', worker: 'Ramesh Kumar', upi: 'ramesh@okicici', amount: 480, claimId: 'CLM-48291', method: 'UPI Instant', time: '0.28s', status: 'Success' },
  { id: 'PAY-93820', worker: 'Priya Sharma', upi: 'priya@paytm', amount: 320, claimId: 'CLM-48290', method: 'UPI Instant', time: '0.31s', status: 'Success' },
  { id: 'PAY-93819', worker: 'Abdul Rahman', upi: 'abdul@oksbi', amount: 640, claimId: 'CLM-48287', method: 'UPI Instant', time: '0.29s', status: 'Success' },
  { id: 'PAY-93818', worker: 'Suresh Mehta', upi: 'suresh@okhdfc', amount: 480, claimId: 'CLM-48285', method: 'UPI Instant', time: '0.33s', status: 'Failed' },
  { id: 'PAY-93817', worker: 'Kavitha Lakshmi', upi: 'kavitha@okaxis', amount: 320, claimId: 'CLM-48283', method: 'UPI Instant', time: '0.27s', status: 'Success' },
  { id: 'PAY-93816', worker: 'Mohammed Ansari', upi: 'mohammed@paytm', amount: 480, claimId: 'CLM-48280', method: 'UPI Instant', time: '0.30s', status: 'Success' },
  { id: 'PAY-93815', worker: 'Deepak Singh', upi: 'deepak@okicici', amount: 640, claimId: 'CLM-48278', method: 'UPI Instant', time: '—', status: 'Processing' },
  { id: 'PAY-93814', worker: 'Anjali Patel', upi: 'anjali@oksbi', amount: 320, claimId: 'CLM-48275', method: 'UPI Instant', time: '0.32s', status: 'Success' },
  { id: 'PAY-93813', worker: 'Rajesh Verma', upi: 'rajesh@okhdfc', amount: 480, claimId: 'CLM-48272', method: 'UPI Instant', time: '0.28s', status: 'Success' },
  { id: 'PAY-93812', worker: 'Sneha Reddy', upi: 'sneha@paytm', amount: 320, claimId: 'CLM-48270', method: 'UPI Instant', time: '0.29s', status: 'Failed' }
];

const MOCK_FAILED_TRANSFERS = [
  { worker: 'Suresh Mehta', upi: 'suresh@okhdfc', amount: 480, reason: 'Invalid UPI' },
  { worker: 'Sneha Reddy', upi: 'sneha@paytm', amount: 320, reason: 'Bank timeout' },
  { worker: 'Karthik Subramanian', upi: 'karthik@okaxis', amount: 640, reason: 'Invalid UPI' }
];

export const Payouts: React.FC = () => {
  const collectionProgress = (MOCK_AUTOPAY_COLLECTED / MOCK_TARGET) * 100;

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Payout Ledger</h1>
          <p className="gs-admin-page-subtitle">All UPI transfers and reconciliation status</p>
        </div>
      </div>

      {/* 4-Stat Row */}
      <div className="gs-claims-stats-row mb-6">
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Processed Today</p>
          <h3 className="gs-stat-value" style={{ color: 'var(--navy-admin)' }}>₹{(MOCK_PROCESSED_TODAY / 100000).toFixed(1)}L</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Success Rate</p>
          <h3 className="gs-stat-value gs-text-green">{MOCK_SUCCESS_RATE}%</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Failed / Retry</p>
          <h3 className="gs-stat-value gs-text-red">{MOCK_FAILED_RETRY}</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Avg Transfer Time</p>
          <h3 className="gs-stat-value gs-text-blue">{MOCK_AVG_TRANSFER_TIME}s</h3>
        </div>
      </div>

      {/* AutoPay Deductions Section */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">This Week's Premium Collection</h3>
        </div>
        
        <div className="gs-autopay-grid">
          <div className="gs-autopay-item">
            <span className="gs-autopay-label">Total collected</span>
            <span className="gs-autopay-value">₹{MOCK_AUTOPAY_COLLECTED.toLocaleString('en-IN')}</span>
          </div>
          <div className="gs-autopay-item">
            <span className="gs-autopay-label">Workers deducted</span>
            <span className="gs-autopay-value">{MOCK_WORKERS_DEDUCTED.toLocaleString('en-IN')}</span>
          </div>
          <div className="gs-autopay-item">
            <span className="gs-autopay-label">Failed deductions</span>
            <span className="gs-autopay-value gs-text-red">{MOCK_FAILED_DEDUCTIONS} <a href="#" className="gs-retry-link">(Retry all)</a></span>
          </div>
          <div className="gs-autopay-item">
            <span className="gs-autopay-label">Collection day</span>
            <span className="gs-autopay-value">Monday 06:00 AM</span>
          </div>
        </div>

        <div className="gs-progress-section mt-4">
          <div className="gs-progress-header">
            <span className="gs-progress-label">₹{(MOCK_AUTOPAY_COLLECTED / 100000).toFixed(2)}L of ₹{(MOCK_TARGET / 100000).toFixed(1)}L target — {collectionProgress.toFixed(0)}%</span>
          </div>
          <div className="gs-progress-bar gs-progress-green">
            <div className="gs-progress-fill" style={{ width: `${collectionProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Recent Payouts</h3>
        </div>
        
        <table className="gs-admin-table">
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Worker</th>
              <th>UPI ID</th>
              <th>Amount</th>
              <th>Claim ID</th>
              <th>Method</th>
              <th>Time Taken</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYOUTS.map((payout) => (
              <tr key={payout.id}>
                <td className="font-medium">{payout.id}</td>
                <td>{payout.worker}</td>
                <td className="gs-upi-id">{payout.upi}</td>
                <td className="gs-payout-amount">₹{payout.amount}</td>
                <td>{payout.claimId}</td>
                <td>{payout.method}</td>
                <td>{payout.time}</td>
                <td>
                  {payout.status === 'Success' && (
                    <span className="gs-payout-status gs-payout-success">
                      <CheckCircle size={14} className="mr-1" /> Success
                    </span>
                  )}
                  {payout.status === 'Failed' && (
                    <span className="gs-payout-status gs-payout-failed">
                      <X size={14} className="mr-1" /> Failed
                    </span>
                  )}
                  {payout.status === 'Processing' && (
                    <span className="gs-payout-status gs-payout-processing">
                      <div className="gs-validation-spinner mr-1"></div> Processing
                    </span>
                  )}
                </td>
                <td>
                  {payout.status === 'Failed' && (
                    <button className="gs-retry-btn">Retry</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reconciliation Card */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Weekly Reconciliation Summary</h3>
        </div>
        
        <div className="gs-reconciliation-grid">
          <div className="gs-reconciliation-section">
            <h4 className="gs-reconciliation-subtitle">Premium Collection</h4>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Total Premium Collected</span>
              <span className="gs-reconciliation-value">₹{MOCK_AUTOPAY_COLLECTED.toLocaleString('en-IN')}</span>
            </div>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Claims Reserve (70%)</span>
              <span className="gs-reconciliation-value">₹{Math.floor(MOCK_AUTOPAY_COLLECTED * 0.7).toLocaleString('en-IN')}</span>
            </div>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Reinsurance Buffer (20%)</span>
              <span className="gs-reconciliation-value">₹{Math.floor(MOCK_AUTOPAY_COLLECTED * 0.2).toLocaleString('en-IN')}</span>
            </div>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Operations (10%)</span>
              <span className="gs-reconciliation-value">₹{Math.floor(MOCK_AUTOPAY_COLLECTED * 0.1).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="gs-reconciliation-section">
            <h4 className="gs-reconciliation-subtitle">Payout Summary</h4>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Total Payouts This Week</span>
              <span className="gs-reconciliation-value">₹{(1384320).toLocaleString('en-IN')}</span>
            </div>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Reserve Balance After Payouts</span>
              <span className="gs-reconciliation-value gs-text-green">₹{(147706).toLocaleString('en-IN')}</span>
            </div>
            <div className="gs-reconciliation-item">
              <span className="gs-reconciliation-label">Pool Status</span>
              <span className="gs-reconciliation-value">
                <span className="gs-pool-healthy">Healthy ✅</span>
              </span>
            </div>
          </div>
        </div>

        <div className="gs-reconciliation-footer">
          <button className="gs-btn-outline">Download Reconciliation Report</button>
        </div>
      </div>

      {/* Failed Payouts Section */}
      <div className="gs-admin-card">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title gs-text-red">Failed Transfers — Action Required</h3>
        </div>
        
        <div className="gs-failed-transfers">
          {MOCK_FAILED_TRANSFERS.map((transfer, idx) => (
            <div key={idx} className="gs-failed-transfer-card">
              <div className="gs-failed-transfer-info">
                <div className="gs-failed-transfer-row">
                  <span className="gs-failed-label">Worker</span>
                  <span className="gs-failed-value">{transfer.worker}</span>
                </div>
                <div className="gs-failed-transfer-row">
                  <span className="gs-failed-label">UPI ID</span>
                  <span className="gs-failed-value gs-upi-id">{transfer.upi}</span>
                </div>
                <div className="gs-failed-transfer-row">
                  <span className="gs-failed-label">Amount</span>
                  <span className="gs-failed-value gs-text-red">₹{transfer.amount}</span>
                </div>
                <div className="gs-failed-transfer-row">
                  <span className="gs-failed-label">Failure reason</span>
                  <span className="gs-failed-value">{transfer.reason}</span>
                </div>
              </div>
              <div className="gs-failed-transfer-actions">
                <button className="gs-btn-amber">Retry via IMPS</button>
                <button className="gs-btn-outline">Mark Resolved</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
