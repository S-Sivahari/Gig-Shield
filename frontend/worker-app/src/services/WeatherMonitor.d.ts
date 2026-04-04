import type { DisruptionLevel } from './InsuranceEngine.js';

export interface WeatherMonitorData {
  isRaining: boolean;
  rainMm: number;
  condition?: string;
  source?: string;
}

export interface WeatherThresholds {
  watch: number;
  alert: number;
  severe: number;
}

export interface DisruptionReport {
  rainMm: number;
  level: DisruptionLevel;
  thresholds: WeatherThresholds;
  triggered: boolean;
  autoPayoutEligible: boolean;
  statusLabel: string;
  statusTone: 'normal' | 'watch' | 'warning' | 'danger';
  payoutPercent: number;
  surgeMultiplier: number;
  message: string;
}

export const DEFAULT_WEATHER_THRESHOLDS: WeatherThresholds;

export function normalizeThresholds(thresholds?: Partial<WeatherThresholds>): WeatherThresholds;
export function resolveDisruptionLevel(rainMm: number, thresholds?: Partial<WeatherThresholds>): DisruptionLevel;
export function checkDisruption(weatherData: WeatherMonitorData, thresholds?: Partial<WeatherThresholds>): DisruptionReport;
