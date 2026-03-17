import React from 'react';
import { ShieldAlert, CloudRain, Wind, Thermometer, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
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

      {/* 3-Stat Row */}
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

        <div className="gs-admin-stat-card">
          <div className="gs-stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
            <AlertTriangle size={24} className="gs-text-red" />
          </div>
          <div className="gs-stat-info">
            <p className="gs-stat-label">Fraudulent Claims Blocked</p>
            <h3 className="gs-stat-value">142</h3>
            <p className="gs-stat-trend gs-text-muted">
              Auto-rejected by ML
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
                  formatter={(value: any) => [`₹${value}`, "Payouts"]}
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

    </div>
  );
};
