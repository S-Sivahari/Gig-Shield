import React, { useState } from 'react';
import { Filter, AlertTriangle, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './FraudDetection.css';

export const FraudDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flagged');

  // Mock data for fraud checks
  const fraudData = [
    { type: 'GPS Mismatch', count: 124 },
    { type: 'Velocity (Too Fast)', count: 45 },
    { type: 'Device Spoofing', count: 18 },
    { type: 'Multiple Accounts', count: 12 },
  ];

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
          <h3 className="gs-stat-value gs-text-amber">24</h3>
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
                Flagged (24)
              </button>
              <button 
                className={`gs-tab ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GS-82914</td>
                <td>Ramesh K.</td>
                <td>Rain Disruption</td>
                <td><span className="gs-flag-badge"><AlertTriangle size={12} className="mr-1" /> GPS Mismatch</span></td>
                <td><span className="gs-text-red font-semibold">92/100</span></td>
                <td>
                  <button className="gs-action-btn"><Eye size={16} /></button>
                </td>
              </tr>
              <tr>
                <td>GS-10522</td>
                <td>Suresh M.</td>
                <td>AQI Spike</td>
                <td><span className="gs-flag-badge"><AlertTriangle size={12} className="mr-1" /> Device Spoofing</span></td>
                <td><span className="gs-text-red font-semibold">88/100</span></td>
                <td>
                  <button className="gs-action-btn"><Eye size={16} /></button>
                </td>
              </tr>
              <tr>
                <td>GS-99120</td>
                <td>Abdul R.</td>
                <td>Rain Disruption</td>
                <td><span className="gs-flag-badge gs-flag-amber"><AlertTriangle size={12} className="mr-1" /> Velocity Anomaly</span></td>
                <td><span className="gs-text-amber font-semibold">65/100</span></td>
                <td>
                  <button className="gs-action-btn"><Eye size={16} /></button>
                </td>
              </tr>
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

    </div>
  );
};
