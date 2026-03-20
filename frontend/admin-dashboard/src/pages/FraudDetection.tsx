import React, { useState } from 'react';
import { Filter, AlertTriangle, Eye, CheckCircle, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './FraudDetection.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_FRAUD_TREND = [
  { day: 'Day 1', attempts: 12, blocked: 11 },
  { day: 'Day 5', attempts: 15, blocked: 14 },
  { day: 'Day 10', attempts: 18, blocked: 17 },
  { day: 'Day 15', attempts: 22, blocked: 20 },
  { day: 'Day 20', attempts: 19, blocked: 18 },
  { day: 'Day 25', attempts: 16, blocked: 15 },
  { day: 'Day 30', attempts: 14, blocked: 13 }
];

type ClaimRow = {
  id: string;
  user: string;
  event: string;
  reason: string;
  riskScore: number;
  mlConfidence: number;
  status: 'flagged' | 'approved' | 'rejected';
};

export const FraudDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flagged');
  const [claims, setClaims] = useState<ClaimRow[]>([
    { id: 'GS-82914', user: 'Ramesh K.', event: 'Rain Disruption', reason: 'GPS Mismatch', riskScore: 92, mlConfidence: 92, status: 'flagged' },
    { id: 'GS-10522', user: 'Suresh M.', event: 'AQI Spike', reason: 'Device Spoofing', riskScore: 88, mlConfidence: 88, status: 'flagged' },
    { id: 'GS-99120', user: 'Abdul R.', event: 'Rain Disruption', reason: 'Velocity Anomaly', riskScore: 65, mlConfidence: 65, status: 'flagged' }
  ]);

  // Mock data for fraud checks
  const fraudData = [
    { type: 'GPS Mismatch', count: 124 },
    { type: 'Velocity (Too Fast)', count: 45 },
    { type: 'Device Spoofing', count: 18 },
    { type: 'Multiple Accounts', count: 12 },
  ];

  const handleApprove = (claimId: string) => {
    setClaims(claims.map(claim => 
      claim.id === claimId ? { ...claim, status: 'approved' } : claim
    ));
  };

  const handleReject = (claimId: string) => {
    setClaims(claims.map(claim => 
      claim.id === claimId ? { ...claim, status: 'rejected' } : claim
    ));
  };

  const getMLConfidenceColor = (confidence: number) => {
    if (confidence > 80) return 'gs-ml-high';
    if (confidence >= 50) return 'gs-ml-medium';
    return 'gs-ml-low';
  };

  const flaggedClaims = claims.filter(c => c.status === 'flagged');
  const resolvedClaims = claims.filter(c => c.status !== 'flagged');

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Fraud Detection Engine</h1>
          <p className="gs-admin-page-subtitle">AI-powered anomaly detection and flagged claims resolution</p>
        </div>
        <div className="gs-header-actions mt-0">
          <button className="gs-btn-outline"><Filter size={16} className="mr-2" /> Filter</button>
          <button className="gs-btn-primary">Export Report</button>
        </div>
      </div>

      <div className="gs-admin-stats-row mb-6 text-center">
        <div className="gs-admin-stat-card gs-block">
          <p className="gs-stat-label">AI Trust Score</p>
          <h3 className="gs-stat-value gs-text-green">98.5%</h3>
          <p className="gs-stat-trend">Claims auto-approved</p>
        </div>
        <div className="gs-admin-stat-card gs-block">
          <p className="gs-stat-label">Flagged for Review</p>
          <h3 className="gs-stat-value gs-text-amber">{flaggedClaims.length}</h3>
          <p className="gs-stat-trend gs-text-amber">Action required</p>
        </div>
        <div className="gs-admin-stat-card gs-block">
          <p className="gs-stat-label">Fraud Prevented (MTD)</p>
          <h3 className="gs-stat-value gs-text-blue">₹1.8L</h3>
          <p className="gs-stat-trend">Saved by ML models</p>
        </div>
      </div>

      <div className="gs-admin-grid">
        
        {/* Flagged Claims Queue */}
        <div className="gs-admin-card gs-span-2">
          <div className="gs-admin-card-header flex-between mb-4">
            <h3 className="gs-admin-card-title">Investigation Queue</h3>
            <div className="gs-tabs">
              <button 
                className={`gs-tab ${activeTab === 'flagged' ? 'active' : ''}`}
                onClick={() => setActiveTab('flagged')}
              >
                Flagged ({flaggedClaims.length})
              </button>
              <button 
                className={`gs-tab ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved ({resolvedClaims.length})
              </button>
            </div>
          </div>
          
          <table className="gs-admin-table">
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>User</th>
                <th>Trigger Event</th>
                <th>AI Flag Reason</th>
                <th>Risk Score</th>
                <th>ML Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'flagged' && flaggedClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.id}</td>
                  <td>{claim.user}</td>
                  <td>{claim.event}</td>
                  <td>
                    <span className={claim.riskScore > 80 ? 'gs-flag-badge' : 'gs-flag-badge gs-flag-amber'}>
                      <AlertTriangle size={12} className="mr-1" /> {claim.reason}
                    </span>
                  </td>
                  <td>
                    <span className={claim.riskScore > 80 ? 'gs-text-red font-semibold' : 'gs-text-amber font-semibold'}>
                      {claim.riskScore}/100
                    </span>
                  </td>
                  <td>
                    <span className={`gs-ml-confidence ${getMLConfidenceColor(claim.mlConfidence)}`}>
                      {claim.mlConfidence}%
                    </span>
                  </td>
                  <td>
                    <div className="gs-fraud-actions">
                      <button className="gs-action-btn"><Eye size={16} /></button>
                      <button className="gs-fraud-approve-btn" onClick={() => handleApprove(claim.id)}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="gs-fraud-reject-btn" onClick={() => handleReject(claim.id)}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {activeTab === 'resolved' && resolvedClaims.map((claim) => (
                <tr key={claim.id} className={claim.status === 'approved' ? 'gs-row-approved' : 'gs-row-rejected'}>
                  <td>{claim.id}</td>
                  <td>{claim.user}</td>
                  <td>{claim.event}</td>
                  <td>
                    <span className={claim.status === 'approved' ? 'gs-flag-badge-approved' : 'gs-flag-badge-rejected'}>
                      {claim.status === 'approved' ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                      {claim.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td>
                    <span className="gs-text-muted font-semibold">{claim.riskScore}/100</span>
                  </td>
                  <td>
                    <span className="gs-ml-confidence gs-ml-muted">{claim.mlConfidence}%</span>
                  </td>
                  <td>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fraud Breakdown Chart */}
        <div className="gs-admin-card">
          <div className="gs-admin-card-header mb-4">
            <h3 className="gs-admin-card-title">Anomalies by Rule (30d)</h3>
          </div>
          
          <div className="gs-admin-chart-container" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#F87171" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Fraud Trend Line Chart */}
      <div className="gs-admin-card mt-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Fraud Attempts — Last 30 Days</h3>
        </div>
        
        <div className="gs-fraud-trend-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_FRAUD_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="attempts" 
                stroke="#DC2626" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#DC2626', strokeWidth: 2, stroke: '#FFFFFF' }}
                name="Fraud Attempts"
              />
              <Line 
                type="monotone" 
                dataKey="blocked" 
                stroke="#2563EB" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#2563EB' }}
                name="ML Blocks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
