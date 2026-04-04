import React from 'react';
import { Card } from '../../components/Card';
import { Shield, MapPin, Zap, CheckCircle } from 'lucide-react';
import './TriggerLog.css';

export const TriggerLogScreen: React.FC = () => {
  return (
    <div className="gs-trigger-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue" style={{ paddingBottom: '32px' }}>
        <h1 className="gs-header-title">Trigger log</h1>
        <p className="gs-header-subtitle">Why your claims were auto-approved</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-16px' }}>
        
        {/* Info Card */}
        <Card variant="blue" className="mb-4">
          <div className="gs-info-row">
            <Shield size={20} className="text-primary-blue" />
            <p className="gs-info-text">
              GigShield uses <b>Parametric Insurance</b>. This means payouts happen instantly when specific events (like heavy rain) cross a threshold in your zone. No paperwork needed.
            </p>
          </div>
        </Card>

        {/* Log Event Section */}
        <h3 className="gs-section-title mb-3 mt-4">Heavy Rain Disruption</h3>
        <p className="gs-event-date mb-3">Oct 4, 2024</p>
        
        <div className="gs-timeline-card">
          
          <div className="gs-timeline-item">
            <div className="gs-timeline-icon gs-bg-amber">
              <Zap size={16} color="#FFFFFF" />
            </div>
            <div className="gs-timeline-content">
              <h4 className="gs-tl-title">Trigger detected</h4>
              <p className="gs-tl-desc">Rainfall reached <b>18.2 mm/hr</b> (Threshold: 15.0 mm/hr)</p>
              <span className="gs-tl-time">14:30:00</span>
            </div>
          </div>

          <div className="gs-timeline-item">
            <div className="gs-timeline-icon gs-bg-blue">
              <MapPin size={16} color="#FFFFFF" />
            </div>
            <div className="gs-timeline-content">
              <h4 className="gs-tl-title">AI fraud check passed</h4>
              <p className="gs-tl-desc">GPS matched <b>Koramangala</b> · Activity verified</p>
              <span className="gs-tl-time">14:30:02</span>
            </div>
          </div>

          <div className="gs-timeline-item">
            <div className="gs-timeline-icon gs-bg-green">
              <CheckCircle size={16} color="#FFFFFF" />
            </div>
            <div className="gs-timeline-content">
              <h4 className="gs-tl-title">Claim auto-approved</h4>
              <p className="gs-tl-desc">Approved in <b>4.2 seconds</b></p>
              <span className="gs-tl-time">14:30:04</span>
            </div>
          </div>

          <div className="gs-timeline-item gs-last-item">
            <div className="gs-timeline-dot"></div>
            <div className="gs-timeline-content">
              <h4 className="gs-tl-title gs-text-green">₹560 credited to UPI</h4>
              <p className="gs-tl-desc" style={{ fontFamily: 'monospace' }}>ramesh@okicici</p>
              <span className="gs-tl-time">14:30:45</span>
            </div>
          </div>

        </div>

        {/* API Sources Footer */}
        <div className="gs-api-sources mt-6">
          <p className="gs-sources-title">Data sources verified via API</p>
          <div className="gs-badges-row">
            <span className="gs-source-badge">IMD Rainfall Data</span>
            <span className="gs-source-badge">Mock City Weather Feed</span>
            <span className="gs-source-badge">GPS Location</span>
            <span className="gs-source-badge">Platform Activity</span>
          </div>
        </div>

      </div>
    </div>
  );
};
