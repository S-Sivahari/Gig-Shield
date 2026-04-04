import React, { useState } from 'react';
import { X, Send, Zap } from 'lucide-react';
import './ZoneMap.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_ZONES = [
  { id: 1, name: 'Andheri West', city: 'Mumbai', risk: 'trigger', aqi: 412, rainfall: 127, temp: 32, riders: 1247, atRisk: 598560 },
  { id: 2, name: 'Bandra', city: 'Mumbai', risk: 'trigger', aqi: 398, rainfall: 98, temp: 31, riders: 893, atRisk: 428640 },
  { id: 3, name: 'Koramangala', city: 'Bangalore', risk: 'high', aqi: 387, rainfall: 12, temp: 28, riders: 893, atRisk: 428640 },
  { id: 4, name: 'Whitefield', city: 'Bangalore', risk: 'high', aqi: 365, rainfall: 8, temp: 29, riders: 634, atRisk: 304320 },
  { id: 5, name: 'Indiranagar', city: 'Bangalore', risk: 'watch', aqi: 342, rainfall: 5, temp: 27, riders: 521, atRisk: 249920 },
  { id: 6, name: 'T Nagar', city: 'Chennai', risk: 'safe', aqi: 145, rainfall: 2, temp: 33, riders: 789, atRisk: 0 },
  { id: 7, name: 'Adyar', city: 'Chennai', risk: 'safe', aqi: 138, rainfall: 1, temp: 34, riders: 456, atRisk: 0 },
  { id: 8, name: 'Velachery', city: 'Chennai', risk: 'safe', aqi: 152, rainfall: 3, temp: 32, riders: 378, atRisk: 0 },
  { id: 9, name: 'Connaught Place', city: 'Delhi', risk: 'watch', aqi: 378, rainfall: 0, temp: 38, riders: 678, atRisk: 325440 },
  { id: 10, name: 'Saket', city: 'Delhi', risk: 'safe', aqi: 298, rainfall: 0, temp: 37, riders: 512, atRisk: 0 },
  { id: 11, name: 'Banjara Hills', city: 'Hyderabad', risk: 'safe', aqi: 187, rainfall: 4, temp: 31, riders: 623, atRisk: 0 },
  { id: 12, name: 'Hitech City', city: 'Hyderabad', risk: 'safe', aqi: 192, rainfall: 6, temp: 30, riders: 547, atRisk: 0 },
  { id: 13, name: 'Salt Lake', city: 'Kolkata', risk: 'safe', aqi: 234, rainfall: 8, temp: 29, riders: 412, atRisk: 0 },
  { id: 14, name: 'Park Street', city: 'Kolkata', risk: 'safe', aqi: 241, rainfall: 7, temp: 30, riders: 389, atRisk: 0 },
  { id: 15, name: 'Powai', city: 'Mumbai', risk: 'safe', aqi: 287, rainfall: 15, temp: 30, riders: 734, atRisk: 0 },
  { id: 16, name: 'Malleswaram', city: 'Bangalore', risk: 'safe', aqi: 198, rainfall: 3, temp: 26, riders: 456, atRisk: 0 },
  { id: 17, name: 'Jayanagar', city: 'Bangalore', risk: 'safe', aqi: 203, rainfall: 4, temp: 27, riders: 512, atRisk: 0 },
  { id: 18, name: 'Anna Nagar', city: 'Chennai', risk: 'safe', aqi: 156, rainfall: 2, temp: 33, riders: 423, atRisk: 0 },
  { id: 19, name: 'Dwarka', city: 'Delhi', risk: 'safe', aqi: 312, rainfall: 0, temp: 36, riders: 567, atRisk: 0 },
  { id: 20, name: 'Gachibowli', city: 'Hyderabad', risk: 'safe', aqi: 176, rainfall: 5, temp: 29, riders: 489, atRisk: 0 }
];

export const ZoneMap: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [zones, setZones] = useState(MOCK_ZONES);
  const [selectedZone, setSelectedZone] = useState<typeof MOCK_ZONES[0] | null>(null);
  const [panelNotice, setPanelNotice] = useState<string>('');

  const cities = ['all', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata'];

  const filteredZones = selectedCity === 'all' 
    ? zones 
    : zones.filter(zone => zone.city === selectedCity);

  const zonesMonitored = zones.length;
  const zonesSafe = zones.filter((zone) => zone.risk === 'safe').length;
  const zonesWatch = zones.filter((zone) => zone.risk === 'watch' || zone.risk === 'high').length;
  const zonesTrigger = zones.filter((zone) => zone.risk === 'trigger').length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'trigger': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'watch': return '#EAB308';
      case 'safe': return '#16A34A';
      default: return '#6B7280';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'trigger': return 'Trigger Active';
      case 'high': return 'High Risk';
      case 'watch': return 'Watch';
      case 'safe': return 'Safe';
      default: return 'Unknown';
    }
  };

  const handleSendAlert = () => {
    if (!selectedZone) return;
    setPanelNotice(`Alert sent to riders in ${selectedZone.name}.`);
  };

  const handleSimulateDisruption = () => {
    if (!selectedZone) return;

    const updatedZone = {
      ...selectedZone,
      risk: 'trigger',
      rainfall: Math.max(selectedZone.rainfall, 65),
      atRisk: Math.max(selectedZone.atRisk, selectedZone.riders * 520),
    };

    setZones((prev) => prev.map((zone) => (
      zone.id === updatedZone.id ? updatedZone : zone
    )));
    setSelectedZone(updatedZone);
    setPanelNotice(`Disruption simulated. ${updatedZone.name} marked as Flood Alert.`);
  };

  return (
    <div className="gs-admin-page animate-fade-in">
      
      <div className="flex-between mb-6">
        <div>
          <h1 className="gs-admin-page-title">Zone Risk Map</h1>
          <p className="gs-admin-page-subtitle">Live disruption heatmap across all delivery zones</p>
        </div>
      </div>

      {/* City Selector */}
      <div className="gs-city-selector mb-6">
        {cities.map((city) => (
          <button
            key={city}
            className={`gs-city-pill ${selectedCity === city ? 'gs-city-pill-active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            {city === 'all' ? 'All Cities' : city}
          </button>
        ))}
      </div>

      {/* Risk Level Legend */}
      <div className="gs-risk-legend mb-6">
        <div className="gs-legend-item">
          <span className="gs-legend-dot" style={{ backgroundColor: '#DC2626' }}></span>
          <span className="gs-legend-label">Trigger Active</span>
        </div>
        <div className="gs-legend-item">
          <span className="gs-legend-dot" style={{ backgroundColor: '#F59E0B' }}></span>
          <span className="gs-legend-label">High Risk</span>
        </div>
        <div className="gs-legend-item">
          <span className="gs-legend-dot" style={{ backgroundColor: '#EAB308' }}></span>
          <span className="gs-legend-label">Watch</span>
        </div>
        <div className="gs-legend-item">
          <span className="gs-legend-dot" style={{ backgroundColor: '#16A34A' }}></span>
          <span className="gs-legend-label">Safe</span>
        </div>
        <div className="gs-legend-item">
          <span className="gs-legend-dot" style={{ backgroundColor: '#6B7280' }}></span>
          <span className="gs-legend-label">No Coverage</span>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="gs-zone-grid mb-6">
        {filteredZones.map((zone) => (
          <div 
            key={zone.id} 
            className="gs-zone-card"
            onClick={() => setSelectedZone(zone)}
          >
            <div className="gs-zone-color-band" style={{ backgroundColor: getRiskColor(zone.risk) }}></div>
            <div className="gs-zone-content">
              <h4 className="gs-zone-name">{zone.name}</h4>
              <p className="gs-zone-city">{zone.city}</p>
              <span 
                className="gs-zone-risk-badge" 
                style={{ 
                  backgroundColor: `${getRiskColor(zone.risk)}20`,
                  color: getRiskColor(zone.risk)
                }}
              >
                {getRiskLabel(zone.risk)}
              </span>
              <div className="gs-zone-metrics">
                <span className="gs-zone-metric">AQI: {zone.aqi}</span>
                <span className="gs-zone-metric">Rain: {zone.rainfall}mm</span>
                <span className="gs-zone-metric">Temp: {zone.temp}°C</span>
              </div>
              <p className="gs-zone-riders">{zone.riders} riders · ₹{zone.atRisk.toLocaleString('en-IN')} at risk</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="gs-zone-summary">
        <div className="gs-summary-item">
          <span className="gs-summary-label">Total Zones Monitored</span>
          <span className="gs-summary-value">{zonesMonitored}</span>
        </div>
        <div className="gs-summary-item">
          <span className="gs-summary-label">Currently Safe</span>
          <span className="gs-summary-value gs-text-green">{zonesSafe}</span>
        </div>
        <div className="gs-summary-item">
          <span className="gs-summary-label">Under Watch</span>
          <span className="gs-summary-value gs-text-amber">{zonesWatch}</span>
        </div>
        <div className="gs-summary-item">
          <span className="gs-summary-label">Trigger Active</span>
          <span className="gs-summary-value gs-text-red">{zonesTrigger}</span>
        </div>
      </div>

      {/* Zone Detail Panel */}
      {selectedZone && (
        <div className="gs-zone-panel-overlay" onClick={() => setSelectedZone(null)}>
          <div className="gs-zone-panel" onClick={(e) => e.stopPropagation()}>
            <div className="gs-zone-panel-header">
              <div>
                <h3 className="gs-zone-panel-title">{selectedZone.name}</h3>
                <p className="gs-zone-panel-subtitle">{selectedZone.city}</p>
              </div>
              <button className="gs-zone-panel-close" onClick={() => setSelectedZone(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="gs-zone-panel-body">
              <div className="gs-zone-panel-section">
                <span 
                  className="gs-zone-risk-badge gs-zone-risk-large" 
                  style={{ 
                    backgroundColor: `${getRiskColor(selectedZone.risk)}20`,
                    color: getRiskColor(selectedZone.risk)
                  }}
                >
                  {getRiskLabel(selectedZone.risk)}
                </span>
              </div>

              <div className="gs-zone-panel-section">
                <h4 className="gs-zone-panel-section-title">Live Metrics</h4>
                <div className="gs-zone-panel-metrics">
                  <div className="gs-zone-panel-metric">
                    <span className="gs-zone-panel-metric-label">AQI Level</span>
                    <span className="gs-zone-panel-metric-value">{selectedZone.aqi}</span>
                  </div>
                  <div className="gs-zone-panel-metric">
                    <span className="gs-zone-panel-metric-label">Rainfall</span>
                    <span className="gs-zone-panel-metric-value">{selectedZone.rainfall}mm</span>
                  </div>
                  <div className="gs-zone-panel-metric">
                    <span className="gs-zone-panel-metric-label">Temperature</span>
                    <span className="gs-zone-panel-metric-value">{selectedZone.temp}°C</span>
                  </div>
                  <div className="gs-zone-panel-metric">
                    <span className="gs-zone-panel-metric-label">Flood Alert</span>
                    <span className="gs-zone-panel-metric-value">
                      {selectedZone.risk === 'trigger' && selectedZone.rainfall >= 50 ? 'Active' : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="gs-zone-panel-section">
                <h4 className="gs-zone-panel-section-title">Threshold Comparison</h4>
                <div className="gs-threshold-bars">
                  <div className="gs-threshold-item">
                    <div className="gs-threshold-header">
                      <span className="gs-threshold-label">AQI</span>
                      <span className="gs-threshold-values">{selectedZone.aqi} / 400</span>
                    </div>
                    <div className="gs-threshold-bar">
                      <div 
                        className="gs-threshold-fill" 
                        style={{ 
                          width: `${(selectedZone.aqi / 400) * 100}%`,
                          backgroundColor: selectedZone.aqi > 400 ? '#DC2626' : '#F59E0B'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="gs-threshold-item">
                    <div className="gs-threshold-header">
                      <span className="gs-threshold-label">Rainfall</span>
                      <span className="gs-threshold-values">{selectedZone.rainfall}mm / 50mm</span>
                    </div>
                    <div className="gs-threshold-bar">
                      <div 
                        className="gs-threshold-fill" 
                        style={{ 
                          width: `${Math.min((selectedZone.rainfall / 50) * 100, 100)}%`,
                          backgroundColor: selectedZone.rainfall > 50 ? '#DC2626' : '#16A34A'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gs-zone-panel-section">
                <h4 className="gs-zone-panel-section-title">Zone Information</h4>
                <div className="gs-zone-panel-info">
                  <div className="gs-zone-panel-info-item">
                    <span className="gs-zone-panel-info-label">Active riders</span>
                    <span className="gs-zone-panel-info-value">{selectedZone.riders.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="gs-zone-panel-info-item">
                    <span className="gs-zone-panel-info-label">Policies in zone</span>
                    <span className="gs-zone-panel-info-value">{Math.floor(selectedZone.riders * 1.2).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="gs-zone-panel-info-item">
                    <span className="gs-zone-panel-info-label">Last disruption</span>
                    <span className="gs-zone-panel-info-value">3 days ago</span>
                  </div>
                  <div className="gs-zone-panel-info-item">
                    <span className="gs-zone-panel-info-label">Predicted risk (6h)</span>
                    <span className="gs-zone-panel-info-value gs-text-amber">72% probability of AQI crossing threshold</span>
                  </div>
                </div>
              </div>

              <div className="gs-zone-panel-actions">
                <button className="gs-btn-amber" type="button" onClick={handleSendAlert}>
                  <Send size={16} className="mr-2" /> Send Alert to Riders
                </button>
                <button className="gs-btn-danger-outline" type="button" onClick={handleSimulateDisruption}>
                  <Zap size={16} className="mr-2" /> Simulate Disruption
                </button>
                {panelNotice && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{panelNotice}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
