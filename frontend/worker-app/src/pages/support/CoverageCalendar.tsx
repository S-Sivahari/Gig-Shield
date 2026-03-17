import React from 'react';
import { Card } from '../../components/Card';
import './Calendar.css';

export const CoverageCalendar: React.FC = () => {
  // Generate a mock 30-day calendar (Oct 2024 has 31 days, starting on Tuesday)
  // 0: none, 1: covered, 2: disruption, 3: payout
  const days = Array.from({ length: 35 }, (_, i) => {
    // Blank padding for Monday
    if (i === 0) return { date: null, status: 0 };
    const date = i;
    if (date > 31) return { date: null, status: 0 };
    
    // Mock statuses
    if (date === 4 || date === 12) return { date, status: 3 }; // Payout
    if (date === 3 || date === 11) return { date, status: 2 }; // Disruption detected
    if (date % 7 === 6) return { date, status: 0 }; // Not covered (Sunday)
    return { date, status: 1 }; // Covered
  });

  return (
    <div className="gs-calendar-page animate-fade-in">
      
      <div className="gs-header-blue">
        <h1 className="gs-header-title">Coverage calendar</h1>
        <p className="gs-header-subtitle">October 2024</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-20px' }}>
        
        {/* Color Legend */}
        <div className="flex-between mb-4">
          <div className="gs-legend-item">
            <div className="gs-legend-dot gs-legend-blue"></div>
            <span>Covered</span>
          </div>
          <div className="gs-legend-item">
            <div className="gs-legend-dot gs-legend-amber"></div>
            <span>Disruption</span>
          </div>
          <div className="gs-legend-item">
            <div className="gs-legend-dot gs-legend-green"></div>
            <span>Payout</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="gs-calendar-wrapper mb-4">
          
          <div className="gs-cal-header-row">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          <div className="gs-cal-grid">
            {days.map((day, idx) => {
              if (day.date === null) return <div key={idx} className="gs-cal-cell gs-cal-empty"></div>;
              
              let statusClass = 'gs-cal-gray';
              if (day.status === 1) statusClass = 'gs-cal-blue';
              if (day.status === 2) statusClass = 'gs-cal-amber';
              if (day.status === 3) statusClass = 'gs-cal-green';

              return (
                <div key={idx} className={`gs-cal-cell ${statusClass}`}>
                  {day.date}
                </div>
              );
            })}
          </div>

        </Card>

        {/* Summary Card */}
        <Card>
          <div className="gs-grid-3col text-center">
            <div className="gs-summary-block border-r">
              <span className="gs-summary-val">24</span>
              <span className="gs-summary-label">Days covered</span>
            </div>
            <div className="gs-summary-block border-r">
              <span className="gs-summary-val gs-text-amber">2</span>
              <span className="gs-summary-label">Disruptions</span>
            </div>
            <div className="gs-summary-block">
              <span className="gs-summary-val gs-text-green">2</span>
              <span className="gs-summary-label">Payouts</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
