import React from 'react';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { MapPin, Wind, CloudRain, Thermometer, ShieldAlert, Bell } from 'lucide-react';
import './LiveZone.css';

export const LiveZoneScreen: React.FC = () => {
  return (
    <div className="gs-zone-page animate-fade-in">
      
      {/* Header Section */}
      <div className="gs-header-blue" style={{ paddingBottom: '32px' }}>
        <div className="flex-center mb-1">
          <MapPin size={20} color="#FFFFFF" className="mr-2" />
          <h1 className="gs-header-title" style={{ marginBottom: 0 }}>Koramangala</h1>
        </div>
        <p className="gs-header-subtitle">Live conditions · updated 2 min ago</p>
      </div>

      <div className="gs-content-padded" style={{ marginTop: '-16px' }}>
        
        {/* Overall Status Banner */}
        <div className="gs-zone-status-banner mb-4">
          <div className="gs-pulse-dot" />
          <span className="gs-status-text">Overall status: <b>Watch Active</b></span>
        </div>

        {/* Condition Cards */}
        <div className="gs-conditions-list">
          
          {/* AQI Card */}
          <Card className="gs-condition-card">
            <div className="flex-between">
              <div className="gs-condition-title">
                <Wind size={20} className="gs-icon-amber" />
                <span>AQI Level</span>
              </div>
              <Badge variant="warning">Watch</Badge>
            </div>
            
            <div className="gs-condition-metrics mt-3">
              <span className="gs-cond-value gs-text-amber">168</span>
              <span className="gs-cond-threshold">/ 200 threshold</span>
            </div>
            
            <div className="gs-cond-progress">
              <div className="gs-cond-fill gs-bg-amber" style={{ width: '84%' }} />
            </div>
          </Card>

          {/* Rainfall Card */}
          <Card className="gs-condition-card">
            <div className="flex-between">
              <div className="gs-condition-title">
                <CloudRain size={20} className="gs-icon-green" />
                <span>Rainfall</span>
              </div>
              <Badge variant="success">Safe</Badge>
            </div>
            
            <div className="gs-condition-metrics mt-3">
              <span className="gs-cond-value gs-text-green">0.0 mm/h</span>
              <span className="gs-cond-threshold">/ 15.0 mm/h threshold</span>
            </div>
            
            <div className="gs-cond-progress">
              <div className="gs-cond-fill gs-bg-green" style={{ width: '0%' }} />
            </div>
            <p className="gs-cond-hint mt-2">Rain forecast in 2 hrs.</p>
          </Card>

          {/* Temperature Card */}
          <Card className="gs-condition-card">
            <div className="flex-between">
              <div className="gs-condition-title">
                <Thermometer size={20} className="gs-icon-red" />
                <span>Temperature</span>
              </div>
              <Badge variant="error" icon={<ShieldAlert size={12} className="mr-1" />}>Trigger Active</Badge>
            </div>
            
            <div className="gs-condition-metrics mt-3">
              <span className="gs-cond-value gs-text-red">42°C</span>
              <span className="gs-cond-threshold">/ 40°C threshold</span>
            </div>
            
            <div className="gs-cond-progress">
              <div className="gs-cond-fill gs-bg-red" style={{ width: '100%' }} />
            </div>
          </Card>

          {/* Govt Alert Card */}
          <Card className="gs-condition-card" variant="blue">
            <div className="flex-between">
              <div className="gs-condition-title">
                <Bell size={20} className="text-primary-blue" />
                <span className="gs-title-blue">Govt / Curfew Alerts</span>
              </div>
              <Badge variant="blue">Monitoring</Badge>
            </div>
            <p className="gs-cond-hint mt-3" style={{ color: 'var(--text-main)', fontSize: '13px' }}>
              No active restrictions reported by local authorities in this zone.
            </p>
          </Card>
          
        </div>
      </div>
    </div>
  );
};
