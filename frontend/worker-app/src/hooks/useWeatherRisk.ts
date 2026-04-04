import { useState, useEffect, useCallback } from 'react';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'heatwave' | 'storm';

export interface WeatherData {
  condition: WeatherCondition;
  description: string;
  temp: number;
  clouds: number;
  city: string;
  icon: string;
  isLoading: boolean;
  isError: boolean;
  source: 'live' | 'simulated';
}

export interface RiskResult {
  multiplier: number;
  label: string;
  reason: string;
  weatherData: WeatherData | null;
}

// OpenWeatherMap free API key – pulled from env (injected at build time via Vite)
const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

const SIMULATED_SCENARIOS: Record<'sunny' | 'stormy', WeatherData> = {
  sunny: {
    condition: 'sunny',
    description: 'Clear sky',
    temp: 32,
    clouds: 10,
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
    city: 'Simulated',
    icon: '🌧️',
    isLoading: false,
    isError: false,
    source: 'simulated',
  },
};

function deriveCondition(weatherMain: string, temp: number, clouds: number): WeatherCondition {
  const main = weatherMain.toLowerCase();
  if (main.includes('thunderstorm')) return 'storm';
  if (main.includes('rain') || main.includes('drizzle') || clouds > 80) return 'rain';
  if (temp > 40) return 'heatwave';
  if (clouds > 50) return 'cloudy';
  return 'sunny';
}

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
  const { condition, temp, clouds, city } = weather;

  if (condition === 'storm' || condition === 'rain') {
    return {
      multiplier: 1.5,
      label: 'High Risk',
      reason: clouds > 80
        ? `+50% for heavy cloud cover (${clouds}%) in ${city}`
        : `+50% for rain/storm conditions in ${city}`,
      weatherData: weather,
    };
  }

  if (condition === 'heatwave' || temp > 40) {
    return {
      multiplier: 1.3,
      label: 'Heatwave Risk',
      reason: `+30% for extreme heat (${temp}°C) in ${city}`,
      weatherData: weather,
    };
  }

  return {
    multiplier: 1.0,
    label: 'Baseline',
    reason: `No weather surcharge — clear conditions in ${city}`,
    weatherData: weather,
  };
}

async function fetchWeatherForCity(city: string): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OWM error ${res.status}`);
  const json = await res.json();

  const temp: number = json.main.temp;
  const clouds: number = json.clouds.all;
  const weatherMain: string = json.weather?.[0]?.main ?? 'Clear';
  const condition = deriveCondition(weatherMain, temp, clouds);

  return {
    condition,
    description: json.weather?.[0]?.description ?? '',
    temp,
    clouds,
    city: json.name ?? city,
    icon: getConditionIcon(condition),
    isLoading: false,
    isError: false,
    source: 'live',
  };
}

export function useWeatherRisk(city: string) {
  const hasApiKey = Boolean(OWM_API_KEY && OWM_API_KEY !== 'your_openweather_key');
  const [simMode, setSimMode] = useState<'sunny' | 'stormy'>('sunny');
  const [useSimulation, setUseSimulation] = useState(!hasApiKey);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLive = useCallback(async () => {
    if (!city || !hasApiKey) return;
    setIsLoading(true);
    try {
      const data = await fetchWeatherForCity(city);
      setWeatherData(data);
    } catch {
      setWeatherData(null);
      setUseSimulation(true); // fallback to sim if API fails
    } finally {
      setIsLoading(false);
    }
  }, [city, hasApiKey]);

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
