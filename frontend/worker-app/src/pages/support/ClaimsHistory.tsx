import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useInsurance } from '../../context/InsuranceContext';
import './ClaimsHistory.css';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ClaimsHistoryScreen: React.FC = () => {
  const { claimsHistory } = useInsurance();

  return (
    <div className="gs-claims-history-page animate-fade-in">
      <div className="gs-header-blue">
        <h1 className="gs-header-title">Claims History</h1>
        <p className="gs-header-subtitle">Auto-triggered disruption claims</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        <Card className="mb-4">
          <div className="gs-grid-2col">
            <div className="gs-metric-block border-r">
              <span className="gs-metric-label">Total auto-claims</span>
              <span className="gs-metric-value">{claimsHistory.length}</span>
            </div>
            <div className="gs-metric-block pl-4">
              <span className="gs-metric-label">Pending now</span>
              <span className="gs-metric-value">
                {claimsHistory.filter((claim) => claim.status === 'Pending').length}
              </span>
            </div>
          </div>
        </Card>

        <div className="gs-claims-history-list">
          {claimsHistory.length === 0 && (
            <Card className="gs-claim-row">
              <p className="gs-claim-empty">No auto-triggered claims yet. Continue normal work.</p>
            </Card>
          )}

          {claimsHistory.map((claim) => (
            <Card className="gs-claim-row" key={claim.id}>
              <div className="flex-between">
                <div>
                  <p className="gs-claim-title">{claim.level.toUpperCase()} disruption trigger</p>
                  <p className="gs-claim-subtitle">
                    {claim.zone} · {claim.rainfallMm}mm · {formatDateTime(claim.createdAt)}
                  </p>
                  <p className="gs-claim-payout">Estimated payout: Rs {claim.estimatedPayout.toLocaleString('en-IN')}</p>
                </div>
                <Badge variant={claim.status === 'Approved' ? 'success' : 'warning'}>{claim.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
