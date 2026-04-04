import React, { useRef } from 'react';
import { CloudRain, CloudSun } from 'lucide-react';
import { useInsurance } from '../context/InsuranceContext';
import './WeatherSimulator.css';

export const WeatherSimulator: React.FC = () => {
  const {
    weatherData,
    disruptionReport,
    weatherThresholds,
    developerMode,
    simulateHeavyRain,
    resetWeather,
    updateWeatherThresholds,
    toggleDeveloperMode,
  } = useInsurance();
  const tapCounterRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  const handleSecretTap = () => {
    tapCounterRef.current += 1;
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapCounterRef.current = 0;
    }, 1800);

    if (tapCounterRef.current >= 5) {
      tapCounterRef.current = 0;
      toggleDeveloperMode();
    }
  };

  return (
    <div className="gs-weather-simulator">
      <div className="gs-weather-simulator__meta">
        <button type="button" className="gs-weather-simulator__title" onClick={handleSecretTap}>
          Active Weather Monitor
        </button>
        <p className="gs-weather-simulator__subtitle">
          Rain now: {weatherData.rainMm}mm ({disruptionReport.statusLabel})
        </p>
      </div>

      {developerMode ? (
        <>
          <div className="gs-weather-simulator__actions">
            <button className="gs-weather-btn gs-weather-btn--rain" type="button" onClick={simulateHeavyRain}>
              <CloudRain size={14} /> Simulate Heavy Rain
            </button>
            <button className="gs-weather-btn gs-weather-btn--clear" type="button" onClick={resetWeather}>
              <CloudSun size={14} /> Reset Weather
            </button>
          </div>

          <div className="gs-weather-threshold-grid">
            <label>
              Watch ({weatherThresholds.watch}mm)
              <input
                type="range"
                min="4"
                max="30"
                value={weatherThresholds.watch}
                onChange={(e) => updateWeatherThresholds({ watch: Number(e.target.value) })}
              />
            </label>
            <label>
              Alert ({weatherThresholds.alert}mm)
              <input
                type="range"
                min="8"
                max="40"
                value={weatherThresholds.alert}
                onChange={(e) => updateWeatherThresholds({ alert: Number(e.target.value) })}
              />
            </label>
            <label>
              Severe ({weatherThresholds.severe}mm)
              <input
                type="range"
                min="12"
                max="50"
                value={weatherThresholds.severe}
                onChange={(e) => updateWeatherThresholds({ severe: Number(e.target.value) })}
              />
            </label>
          </div>
        </>
      ) : (
        <p className="gs-weather-simulator__hint">Monitoring is automatic. No action required.</p>
      )}
    </div>
  );
};
