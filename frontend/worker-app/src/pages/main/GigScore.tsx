import React from 'react';
import { ScoreRing } from '../../components/ScoreRing';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { Card } from '../../components/Card';
import './GigScore.css';

export const GigScoreScreen: React.FC = () => {
  return (
    <div className="gs-gigscore-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue">
        <h1 className="gs-header-title">Your GigScore</h1>
        <p className="gs-header-subtitle">AI-computed income protection score</p>
        
        <div style={{ marginTop: '32px', marginBottom: '16px' }}>
          <ScoreRing score={78} />
        </div>
        
        <div className="flex-center">
          <Badge variant="blue" className="gs-risk-badge">Low Risk · Standard Plan</Badge>
        </div>
        <p className="gs-last-updated">Last updated: Today, 08:30 AM</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Score Breakdown Card */}
        <Card>
          <h3 className="gs-card-title mb-4">Score breakdown</h3>
          
          <div className="gs-breakdown-list">
            <ProgressBar 
              progress={85} 
              colorVariant="green" 
              label="Zone safety rating" 
              valueText="Excellent"
            />
            <ProgressBar 
              progress={60} 
              colorVariant="amber" 
              label="Work consistency" 
              valueText="Average"
            />
            <ProgressBar 
              progress={30} 
              colorVariant="red" 
              label="Historical weather risk" 
              valueText="High Risk"
            />
            <ProgressBar 
              progress={95} 
              colorVariant="green" 
              label="Claim legitimacy score" 
              valueText="Very High"
            />
          </div>
        </Card>

        {/* AI Recommendation Card */}
        <Card variant="blue" className="mt-4">
          <div className="gs-ai-reco-header">
            <span className="gs-ai-reco-badge">AI Recommendation</span>
          </div>
          <p className="gs-ai-reco-text">
            Upgrade to Pro plan to cover high weather-risk days in <b>Koramangala</b>. 
            Estimated additional payout: <b>₹1,200/month</b>.
          </p>
        </Card>

      </div>
    </div>
  );
};
