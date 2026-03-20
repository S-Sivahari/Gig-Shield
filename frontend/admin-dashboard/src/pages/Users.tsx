import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import './Users.css';

// ─── MOCK DATA ───
const MOCK_TOTAL_WORKERS = 24592;
const MOCK_KYC_VERIFIED = 23847;
const MOCK_PENDING_KYC = 621;
const MOCK_SUSPENDED = 124;

const MOCK_WORKERS = [
  {
    id: 'GS-2024-10291',
    name: 'Ramesh Kumar',
    platform: 'Swiggy',
    zone: 'Andheri West',
    plan: 'Standard',
    premium: 89,
    gigScore: 78,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43210',
    email: 'ramesh.k@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82914',
    coverage: 70,
    startDate: 'Oct 1, 2024',
    nextRenewal: 'Oct 12, 2024',
    totalClaims: 4,
    totalPayouts: 1920,
    accountAge: '8 months'
  },
  {
    id: 'GS-2024-10292',
    name: 'Priya Sharma',
    platform: 'Zomato',
    zone: 'Koramangala',
    plan: 'Pro',
    premium: 129,
    gigScore: 85,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43211',
    email: 'priya.s@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82915',
    coverage: 90,
    startDate: 'Sep 15, 2024',
    nextRenewal: 'Oct 10, 2024',
    totalClaims: 6,
    totalPayouts: 3240,
    accountAge: '11 months'
  },
  {
    id: 'GS-2024-10293',
    name: 'Abdul Rahman',
    platform: 'Blinkit',
    zone: 'Indiranagar',
    plan: 'Basic',
    premium: 59,
    gigScore: 62,
    kyc: 'Pending',
    status: 'Active',
    phone: '+91 98765 43212',
    email: 'abdul.r@email.com',
    aadhaar: 'Pending',
    policyId: 'GS-POL-82916',
    coverage: 50,
    startDate: 'Oct 5, 2024',
    nextRenewal: 'Oct 12, 2024',
    totalClaims: 1,
    totalPayouts: 320,
    accountAge: '2 months'
  },
  {
    id: 'GS-2024-10294',
    name: 'Kavitha Lakshmi',
    platform: 'Amazon',
    zone: 'T Nagar',
    plan: 'Standard',
    premium: 89,
    gigScore: 72,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43213',
    email: 'kavitha.l@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82917',
    coverage: 70,
    startDate: 'Aug 20, 2024',
    nextRenewal: 'Oct 14, 2024',
    totalClaims: 5,
    totalPayouts: 2400,
    accountAge: '14 months'
  },
  {
    id: 'GS-2024-10295',
    name: 'Mohammed Ansari',
    platform: 'Swiggy',
    zone: 'Banjara Hills',
    plan: 'Standard',
    premium: 89,
    gigScore: 68,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43214',
    email: 'mohammed.a@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82918',
    coverage: 70,
    startDate: 'Sep 1, 2024',
    nextRenewal: 'Oct 11, 2024',
    totalClaims: 3,
    totalPayouts: 1440,
    accountAge: '9 months'
  },
  {
    id: 'GS-2024-10296',
    name: 'Deepak Singh',
    platform: 'Zepto',
    zone: 'Salt Lake',
    plan: 'Pro',
    premium: 129,
    gigScore: 81,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43215',
    email: 'deepak.s@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82919',
    coverage: 90,
    startDate: 'Jul 10, 2024',
    nextRenewal: 'Oct 9, 2024',
    totalClaims: 7,
    totalPayouts: 4200,
    accountAge: '16 months'
  },
  {
    id: 'GS-2024-10297',
    name: 'Anjali Patel',
    platform: 'Blinkit',
    zone: 'Connaught Place',
    plan: 'Basic',
    premium: 59,
    gigScore: 58,
    kyc: 'Pending',
    status: 'Active',
    phone: '+91 98765 43216',
    email: 'anjali.p@email.com',
    aadhaar: 'Pending',
    policyId: 'GS-POL-82920',
    coverage: 50,
    startDate: 'Oct 3, 2024',
    nextRenewal: 'Oct 10, 2024',
    totalClaims: 0,
    totalPayouts: 0,
    accountAge: '1 month'
  },
  {
    id: 'GS-2024-10298',
    name: 'Rajesh Verma',
    platform: 'Zomato',
    zone: 'Powai',
    plan: 'Standard',
    premium: 89,
    gigScore: 75,
    kyc: 'Verified',
    status: 'Suspended',
    phone: '+91 98765 43217',
    email: 'rajesh.v@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82921',
    coverage: 70,
    startDate: 'Jun 15, 2024',
    nextRenewal: 'N/A',
    totalClaims: 12,
    totalPayouts: 5760,
    accountAge: '18 months'
  },
  {
    id: 'GS-2024-10299',
    name: 'Sneha Reddy',
    platform: 'Swiggy',
    zone: 'Bandra',
    plan: 'Pro',
    premium: 129,
    gigScore: 88,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43218',
    email: 'sneha.r@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82922',
    coverage: 90,
    startDate: 'May 1, 2024',
    nextRenewal: 'Oct 8, 2024',
    totalClaims: 8,
    totalPayouts: 4800,
    accountAge: '20 months'
  },
  {
    id: 'GS-2024-10300',
    name: 'Vijay Kumar',
    platform: 'Amazon',
    zone: 'Whitefield',
    plan: 'Basic',
    premium: 59,
    gigScore: 64,
    kyc: 'Verified',
    status: 'Active',
    phone: '+91 98765 43219',
    email: 'vijay.k@email.com',
    aadhaar: 'Verified ✅',
    policyId: 'GS-POL-82923',
    coverage: 50,
    startDate: 'Sep 20, 2024',
    nextRenewal: 'Oct 13, 2024',
    totalClaims: 2,
    totalPayouts: 640,
    accountAge: '6 months'
  }
];

const PLATFORM_COLORS: Record<string, string> = {
  'Swiggy': '#FC8019',
  'Zomato': '#E23744',
  'Blinkit': '#F8CB46',
  'Zepto': '#8B5CF6',
  'Amazon': '#FF9900'
};

export const Users: React.FC = () => {
  const [selectedWorker, setSelectedWorker] = useState<typeof MOCK_WORKERS[0] | null>(null);

  const getKycColor = (kyc: string) => {
    switch (kyc) {
      case 'Verified': return 'gs-status-approved';
      case 'Pending': return 'gs-status-processing';
      case 'Rejected': return 'gs-status-rejected';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'gs-status-approved';
      case 'Suspended': return 'gs-status-rejected';
      default: return '';
    }
  };

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Worker Management</h1>
          <p className="gs-admin-page-subtitle">All registered GigShield delivery partners</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="gs-filter-row mb-6">
        <input 
          type="text" 
          placeholder="Search by name, phone, or policy ID" 
          className="gs-search-input-large"
        />
        <select className="gs-filter-select">
          <option>All Platforms</option>
          <option>Zomato</option>
          <option>Swiggy</option>
          <option>Zepto</option>
          <option>Blinkit</option>
          <option>Amazon</option>
        </select>
        <select className="gs-filter-select">
          <option>All KYC Status</option>
          <option>Verified</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
        <select className="gs-filter-select">
          <option>All Plans</option>
          <option>Basic</option>
          <option>Standard</option>
          <option>Pro</option>
        </select>
      </div>

      {/* 4-Stat Row */}
      <div className="gs-claims-stats-row mb-6">
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Total Workers</p>
          <h3 className="gs-stat-value" style={{ color: 'var(--navy-admin)' }}>{MOCK_TOTAL_WORKERS.toLocaleString('en-IN')}</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">KYC Verified</p>
          <h3 className="gs-stat-value gs-text-green">{MOCK_KYC_VERIFIED.toLocaleString('en-IN')}</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Pending KYC</p>
          <h3 className="gs-stat-value gs-text-amber">{MOCK_PENDING_KYC}</h3>
        </div>
        <div className="gs-admin-stat-card gs-block text-center">
          <p className="gs-stat-label">Suspended</p>
          <h3 className="gs-stat-value gs-text-red">{MOCK_SUSPENDED}</h3>
        </div>
      </div>

      {/* Workers Table */}
      <div className="gs-admin-card">
        <table className="gs-admin-table">
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Name</th>
              <th>Platform</th>
              <th>Zone</th>
              <th>Plan</th>
              <th>Weekly Premium</th>
              <th>GigScore</th>
              <th>KYC</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_WORKERS.map((worker) => (
              <tr key={worker.id}>
                <td className="font-medium">{worker.id}</td>
                <td>{worker.name}</td>
                <td>
                  <span 
                    className="gs-platform-badge" 
                    style={{ backgroundColor: PLATFORM_COLORS[worker.platform], color: '#FFFFFF' }}
                  >
                    {worker.platform}
                  </span>
                </td>
                <td>{worker.zone}</td>
                <td>{worker.plan}</td>
                <td>₹{worker.premium}</td>
                <td><span className="gs-gigscore-badge">{ worker.gigScore}</span></td>
                <td>
                  <span className={`gs-claim-status ${getKycColor(worker.kyc)}`}>
                    {worker.kyc}
                  </span>
                </td>
                <td>
                  <span className={`gs-claim-status ${getStatusColor(worker.status)}`}>
                    {worker.status}
                  </span>
                </td>
                <td>
                  <button className="gs-action-btn" onClick={() => setSelectedWorker(worker)}>
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="gs-table-pagination">
          <span className="gs-pagination-info">Showing 1-10 of {MOCK_TOTAL_WORKERS.toLocaleString('en-IN')} workers</span>
          <div className="gs-pagination-controls">
            <button className="gs-pagination-btn">Prev</button>
            <button className="gs-pagination-btn gs-pagination-active">1</button>
            <button className="gs-pagination-btn">2</button>
            <button className="gs-pagination-btn">3</button>
            <span className="gs-pagination-ellipsis">...</span>
            <button className="gs-pagination-btn">2460</button>
            <button className="gs-pagination-btn">Next</button>
          </div>
        </div>
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="gs-modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="gs-modal-content gs-worker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gs-modal-header">
              <div className="flex items-center gap-3">
                <h2 className="gs-modal-title">{selectedWorker.name}</h2>
                <span className="gs-gigscore-badge">GigScore: {selectedWorker.gigScore}</span>
              </div>
              <button className="gs-modal-close" onClick={() => setSelectedWorker(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="gs-modal-body">
              <div className="gs-worker-sections">
                {/* Section 1: Personal Info */}
                <div className="gs-worker-section">
                  <h3 className="gs-section-subtitle">Personal Info</h3>
                  <div className="gs-worker-fields">
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Worker ID</span>
                      <span className="gs-field-value">{selectedWorker.id}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Platform</span>
                      <span className="gs-field-value">{selectedWorker.platform}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Zone</span>
                      <span className="gs-field-value">{selectedWorker.zone}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Phone</span>
                      <span className="gs-field-value">{selectedWorker.phone}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Email</span>
                      <span className="gs-field-value">{selectedWorker.email}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Aadhaar</span>
                      <span className="gs-field-value">{selectedWorker.aadhaar}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Policy Info */}
                <div className="gs-worker-section">
                  <h3 className="gs-section-subtitle">Policy Info</h3>
                  <div className="gs-worker-fields">
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Policy ID</span>
                      <span className="gs-field-value">{selectedWorker.policyId}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Plan</span>
                      <span className="gs-field-value">{selectedWorker.plan}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Weekly Premium</span>
                      <span className="gs-field-value">₹{selectedWorker.premium}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Coverage %</span>
                      <span className="gs-field-value">{selectedWorker.coverage}%</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Start Date</span>
                      <span className="gs-field-value">{selectedWorker.startDate}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Next Renewal</span>
                      <span className="gs-field-value">{selectedWorker.nextRenewal}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Status</span>
                      <span className={`gs-claim-status ${getStatusColor(selectedWorker.status)}`}>
                        {selectedWorker.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Stats */}
                <div className="gs-worker-section">
                  <h3 className="gs-section-subtitle">Stats</h3>
                  <div className="gs-worker-fields">
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Total Claims</span>
                      <span className="gs-field-value">{selectedWorker.totalClaims}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Total Payouts</span>
                      <span className="gs-field-value">₹{selectedWorker.totalPayouts.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="gs-worker-field">
                      <span className="gs-field-label">Account Age</span>
                      <span className="gs-field-value">{selectedWorker.accountAge}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gs-modal-footer">
              <button className="gs-btn-outline gs-btn-danger">Suspend Worker</button>
              <button className="gs-btn-primary">View Full Policy</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
