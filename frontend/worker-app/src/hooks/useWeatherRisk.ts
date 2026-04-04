import { useState, useEffect, useCallback } from 'react';
import { getCityWeather } from '../mocks/cityWeatherMock.js';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'heatwave' | 'storm';

export interface WeatherData {
  condition: WeatherCondition;
  description: string;
  temp: number;
  clouds: number;
  rainMm: number;
  riskScore: number;
  city: string;
  icon: string;
  isLoading: boolean;
  isError: boolean;
  source: 'mock' | 'simulated';
}

export interface RiskResult {
  multiplier: number;
  label: string;
  reason: string;
  weatherData: WeatherData | null;
}

const SIMULATED_SCENARIOS: Record<'sunny' | 'stormy', WeatherData> = {
  sunny: {
    condition: 'sunny',
    description: 'Clear sky',
    temp: 32,
    clouds: 10,
    rainMm: 0,
    riskScore: 46,
    city: 'Simulated',
    icon: '☀️',
    isLoading: false,
    isError: false,
    source: 'simulated',
  },
  stormy: {
    condition: 'rain',
    description: 'Heavy rain',
    temp: 27,
    clouds: 92,
    rainMm: 28,
    riskScore: 96,
    city: 'Simulated',
    icon: '🌧️',
    isLoading: false,
    isError: false,
    source: 'simulated',
  },
};

function getConditionIcon(condition: WeatherCondition): string {
  switch (condition) {
    case 'storm': return '⛈️';
    case 'rain': return '🌧️';
    case 'heatwave': return '🔥';
    case 'cloudy': return '☁️';
    default: return '☀️';
  }
}

export function getRiskFromWeather(weather: WeatherData): RiskResult {
  const { condition, rainMm, city } = weather;

  if (condition === 'storm' || condition === 'rain' || rainMm > 15) {
    return {
      multiplier: 1.5,
      label: 'High Risk',
      reason: `+50% rain surge for ${city} (${rainMm}mm)` ,
      weatherData: weather,
    };
  }

  return {
    multiplier: 1.0,
    label: 'Baseline',
    reason: `No rain surcharge for ${city}`,
    weatherData: weather,
  };
}

function getMockWeatherForCity(city: string): WeatherData {
  const row = getCityWeather(city);
  const condition: WeatherCondition = row.rainfallMm > 18 ? 'storm' : row.rainfallMm > 0 ? 'rain' : row.condition === 'cloudy' ? 'cloudy' : 'sunny';

  return {
    condition,
    description: row.rainfallMm > 0 ? 'rain bands in zone' : row.condition,
    temp: row.rainfallMm > 0 ? 28 : 33,
    clouds: row.rainfallMm > 0 ? 84 : 30,
    rainMm: row.rainfallMm,
    riskScore: row.riskScore,
    city: row.city,
    icon: getConditionIcon(condition),
    isLoading: false,
    isError: false,
    source: 'mock',
  };
}

export function useWeatherRisk(city: string) {
  const hasApiKey = false;
  const [simMode, setSimMode] = useState<'sunny' | 'stormy'>('sunny');
  const [useSimulation, setUseSimulation] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLive = useCallback(async () => {
    if (!city) return;
    setIsLoading(true);
    try {
      const data = getMockWeatherForCity(city);
      setWeatherData(data);
    } catch {
      setWeatherData(null);
      setUseSimulation(true);
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (useSimulation) {
      setWeatherData(SIMULATED_SCENARIOS[simMode]);
    } else {
      fetchLive();
    }
  }, [useSimulation, simMode, fetchLive]);

  const toggleSimulation = () => {
    setUseSimulation(prev => !prev);
  };

  const toggleSimScenario = () => {
    setSimMode(prev => (prev === 'sunny' ? 'stormy' : 'sunny'));
  };

  const risk: RiskResult | null = weatherData ? getRiskFromWeather(weatherData) : null;

  return {
    weatherData: useSimulation ? SIMULATED_SCENARIOS[simMode] : weatherData,
    risk,
    isLoading,
    useSimulation,
    simMode,
    hasApiKey,
    toggleSimulation,
    toggleSimScenario,
    refetch: fetchLive,
  };
}
