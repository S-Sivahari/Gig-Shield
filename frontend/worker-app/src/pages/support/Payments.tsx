import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Toggle } from '../../components/Toggle';
import { CheckCircle2, History } from 'lucide-react';
import './Payments.css';

export const PaymentsScreen: React.FC = () => {
  const [autoPay, setAutoPay] = useState(true);

  return (
    <div className="gs-payments-page animate-fade-in">
      
      <div className="gs-header-blue" style={{ paddingBottom: '32px' }}>
        <h1 className="gs-header-title">Payments</h1>
        <p className="gs-header-subtitle">Premium deductions</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-16px' }}>
        
        {/* Summary Card */}
        <Card className="mb-4">
          <div className="gs-grid-2col">
            <div className="gs-metric-block border-r">
              <span className="gs-metric-label">Paid this month</span>
              <span className="gs-metric-value">₹356</span>
            </div>
            <div className="gs-metric-block pl-4">
              <span className="gs-metric-label">Next deduction</span>
              <span className="gs-metric-value">Oct 12</span>
            </div>
          </div>
        </Card>

        {/* AutoPay Settings */}
        <Card className="mb-4">
          <Toggle 
            checked={autoPay} 
            onChange={setAutoPay} 
            label="AutoPay Weekly Premium" 
          />
          {autoPay && (
            <div className="gs-autopay-details mt-3">
              <CheckCircle2 size={16} className="gs-text-green mr-2" />
              <span>Deducted automatically via UPI (ramesh@okicici)</span>
            </div>
          )}
        </Card>

        {/* Payment History */}
        <h3 className="gs-section-title mb-3 mt-4">
          <History size={16} className="mr-2 inline" /> Payment History
        </h3>

        <div className="gs-payment-history-list">
          
          <Card className="gs-payment-row">
            <div className="flex-between">
              <div>
                <p className="gs-payment-title">Weekly premium</p>
                <p className="gs-payment-subtitle">Oct 5, 2024</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gs-text-red" style={{ fontSize: '16px', fontWeight: 600 }}>- ₹89</span>
                <p className="gs-payment-status">Paid</p>
              </div>
            </div>
          </Card>

          <Card className="gs-payment-row">
            <div className="flex-between">
              <div>
                <p className="gs-payment-title">Weekly premium</p>
                <p className="gs-payment-subtitle">Sep 28, 2024</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gs-text-red" style={{ fontSize: '16px', fontWeight: 600 }}>- ₹89</span>
                <p className="gs-payment-status">Paid</p>
              </div>
            </div>
          </Card>

          <Card className="gs-payment-row">
            <div className="flex-between">
              <div>
                <p className="gs-payment-title">Weekly premium</p>
                <p className="gs-payment-subtitle">Sep 21, 2024</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gs-text-red" style={{ fontSize: '16px', fontWeight: 600 }}>- ₹89</span>
                <p className="gs-payment-status">Paid</p>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};
