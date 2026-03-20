import React from 'react';
import { PiggyBank, Shield, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './PoolHealth.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_POOL_TOTAL = 43218450;
const MOCK_CLAIMS_RESERVE = 30252915;
const MOCK_REINSURANCE_BUFFER = 8643690;
const MOCK_OPERATIONS_FUND = 4321845;

const MOCK_LOSS_RATIO = 63.2;
const MOCK_SOLVENCY_RATIO = 219;
const MOCK_REINSURANCE_COVERAGE = 50000000;
const MOCK_RESERVE_RUNWAY = 8.4;

// Pool balance over 12 weeks (in lakhs)
const MOCK_POOL_HISTORY = [
  { week: 'W-12', claimsReserve: 280, totalPool: 400 },
  { week: 'W-11', claimsReserve: 285, totalPool: 407 },
  { week: 'W-10', claimsReserve: 275, totalPool: 393 },
  { week: 'W-9', claimsReserve: 265, totalPool: 379 },
  { week: 'W-8', claimsReserve: 270, totalPool: 386 },
  { week: 'W-7', claimsReserve: 280, totalPool: 400 },
  { week: 'W-6', claimsReserve: 290, totalPool: 414 },
  { week: 'W-5', claimsReserve: 295, totalPool: 421 },
  { week: 'W-4', claimsReserve: 298, totalPool: 426 },
  { week: 'W-3', claimsReserve: 300, totalPool: 429 },
  { week: 'W-2', claimsReserve: 302, totalPool: 431 },
  { week: 'W-1', claimsReserve: 303, totalPool: 432 }
];

// Premium vs Claims for last 8 weeks (in lakhs)
const MOCK_PREMIUM_VS_CLAIMS = [
  { week: 'W-8', premium: 22, claims: 18 },
  { week: 'W-7', premium: 21, claims: 16 },
  { week: 'W-6', premium: 22, claims: 28 },
  { week: 'W-5', premium: 21, claims: 15 },
  { week: 'W-4', premium: 22, claims: 17 },
  { week: 'W-3', premium: 21, claims: 19 },
  { week: 'W-2', premium: 22, claims: 14 },
  { week: 'W-1', premium: 22, claims: 13 }
];

export const PoolHealth: React.FC = () => {
  const claimsReservePercent = (MOCK_CLAIMS_RESERVE / MOCK_POOL_TOTAL) * 100;
  const reinsurancePercent = (MOCK_REINSURANCE_BUFFER / MOCK_POOL_TOTAL) * 100;
  const operationsPercent = (MOCK_OPERATIONS_FUND / MOCK_POOL_TOTAL) * 100;

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Pool & Treasury Health</h1>
          <p className="gs-admin-page-subtitle">Reserve fund status, reinsurance buffer, and solvency metrics</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="gs-pool-hero-card mb-6">
        <div className="gs-pool-hero-content">
          <p className="gs-pool-hero-label">Total Reserve Pool</p>
          <h1 className="gs-pool-hero-value">₹{(MOCK_POOL_TOTAL / 10000000).toFixed(2)}Cr</h1>
          <div className="gs-pool-hero-badges">
            <span className="gs-pool-hero-badge">Solvency: Healthy</span>
            <span className="gs-pool-hero-subtitle">Ring-fenced escrow · NBFC supervised</span>
          </div>
          <p className="gs-pool-hero-updated">Live · Last synced 3 min ago</p>
        </div>
      </div>

      {/* 3-Column Allocation Cards */}
      <div className="gs-allocation-grid mb-6">
        <div className="gs-allocation-card gs-allocation-blue">
          <div className="gs-allocation-icon">
            <PiggyBank size={28} />
          </div>
          <h3 className="gs-allocation-title">Claims Reserve (70%)</h3>
          <p className="gs-allocation-amount">₹{(MOCK_CLAIMS_RESERVE / 10000000).toFixed(2)}Cr</p>
          <p className="gs-allocation-desc">Available for immediate payout</p>
          <div className="gs-allocation-progress">
            <div className="gs-allocation-progress-bar">
              <div className="gs-allocation-progress-fill gs-allocation-fill-blue" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        <div className="gs-allocation-card gs-allocation-amber">
          <div className="gs-allocation-icon">
            <Shield size={28} />
          </div>
          <h3 className="gs-allocation-title">Reinsurance Buffer (20%)</h3>
          <p className="gs-allocation-amount">₹{(MOCK_REINSURANCE_BUFFER / 10000000).toFixed(2)}Cr</p>
          <p className="gs-allocation-desc">Catastrophic event protection</p>
          <div className="gs-allocation-progress">
            <div className="gs-allocation-progress-bar">
              <div className="gs-allocation-progress-fill gs-allocation-fill-amber" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>

        <div className="gs-allocation-card gs-allocation-green">
          <div className="gs-allocation-icon">
            <Settings size={28} />
          </div>
          <h3 className="gs-allocation-title">Operations (10%)</h3>
          <p className="gs-allocation-amount">₹{(MOCK_OPERATIONS_FUND / 10000000).toFixed(2)}Cr</p>
          <p className="gs-allocation-desc">Platform infrastructure</p>
          <div className="gs-allocation-progress">
            <div className="gs-allocation-progress-bar">
              <div className="gs-allocation-progress-fill gs-allocation-fill-green" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Health Over Time Chart */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Reserve Balance — Last 12 Weeks</h3>
        </div>
        
        <div className="gs-pool-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_POOL_HISTORY}>
              <defs>
                <linearGradient id="colorClaimsReserve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="week" 
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
                tickFormatter={(val) => `₹${val}L`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`₹${value}L`, ""]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Area 
                type="monotone" 
                dataKey="claimsReserve" 
                stroke="#2563EB" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorClaimsReserve)"
                name="Claims Reserve"
              />
              <Area 
                type="monotone" 
                dataKey="totalPool" 
                stroke="#1E3A5F" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0}
                name="Total Pool"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Solvency Metrics Card */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Solvency Ratios</h3>
        </div>
        
        <div className="gs-solvency-metrics">
          <div className="gs-solvency-item">
            <div className="gs-solvency-left">
              <span className="gs-solvency-label">Loss Ratio</span>
              <span className="gs-solvency-value gs-text-green">{MOCK_LOSS_RATIO}%</span>
            </div>
            <div className="gs-solvency-right">
              <span className="gs-solvency-badge gs-solvency-healthy">
                <CheckCircle size={14} className="mr-1" /> Healthy
              </span>
              <span className="gs-solvency-target">target &lt;70%</span>
            </div>
          </div>

          <div className="gs-solvency-item">
            <div className="gs-solvency-left">
              <span className="gs-solvency-label">Claims Reserve Ratio</span>
              <span className="gs-solvency-value gs-text-green">{MOCK_SOLVENCY_RATIO}%</span>
            </div>
            <div className="gs-solvency-right">
              <span className="gs-solvency-badge gs-solvency-healthy">
                <CheckCircle size={14} className="mr-1" /> Healthy
              </span>
              <span className="gs-solvency-target">target &gt;150%</span>
            </div>
          </div>

          <div className="gs-solvency-item">
            <div className="gs-solvency-left">
              <span className="gs-solvency-label">Reinsurance Coverage</span>
              <span className="gs-solvency-value gs-text-green">₹{(MOCK_REINSURANCE_COVERAGE / 10000000)}Cr per event</span>
            </div>
            <div className="gs-solvency-right">
              <span className="gs-solvency-badge gs-solvency-healthy">
                <CheckCircle size={14} className="mr-1" /> Healthy
              </span>
            </div>
          </div>

          <div className="gs-solvency-item">
            <div className="gs-solvency-left">
              <span className="gs-solvency-label">Weeks of Reserve Runway</span>
              <span className="gs-solvency-value gs-text-green">{MOCK_RESERVE_RUNWAY} weeks</span>
            </div>
            <div className="gs-solvency-right">
              <span className="gs-solvency-badge gs-solvency-healthy">
                <CheckCircle size={14} className="mr-1" /> Healthy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reinsurance Section */}
      <div className="gs-admin-card mb-6">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Reinsurance Partner</h3>
        </div>
        
        <div className="gs-reinsurance-grid">
          <div className="gs-reinsurance-item">
            <span className="gs-reinsurance-label">Partner</span>
            <span className="gs-reinsurance-value">Acko General Insurance (Simulated)</span>
          </div>
          <div className="gs-reinsurance-item">
            <span className="gs-reinsurance-label">Coverage trigger</span>
            <span className="gs-reinsurance-value">Claims exceed ₹50L in single week</span>
          </div>
          <div className="gs-reinsurance-item">
            <span className="gs-reinsurance-label">Monthly reinsurance premium</span>
            <span className="gs-reinsurance-value">₹3,20,000</span>
          </div>
          <div className="gs-reinsurance-item">
            <span className="gs-reinsurance-label">Times triggered this year</span>
            <span className="gs-reinsurance-value">2</span>
          </div>
          <div className="gs-reinsurance-item">
            <span className="gs-reinsurance-label">Status</span>
            <span className="gs-reinsurance-value">
              <span className="gs-pool-healthy">Active ✅</span>
            </span>
          </div>
        </div>
      </div>

      {/* Premium vs Claims Chart */}
      <div className="gs-admin-card">
        <div className="gs-admin-card-header mb-4">
          <h3 className="gs-admin-card-title">Premium Collected vs Claims Paid (Last 8 weeks)</h3>
        </div>
        
        <div className="gs-pool-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_PREMIUM_VS_CLAIMS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="week" 
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
                tickFormatter={(val) => `₹${val}L`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any, name: string) => [`₹${value}L`, name === 'premium' ? 'Premium Collected' : 'Claims Paid']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => value === 'premium' ? 'Premium Collected' : 'Claims Paid'}
              />
              <Bar dataKey="premium" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="claims" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
