export interface TriggerThresholds {
  watch: number;
  alert: number;
  severe: number;
}

export interface TriggerReport {
  rainMm: number;
  level: 'none' | 'watch' | 'alert' | 'severe';
  triggered: boolean;
  payoutPercent: number;
  statusLabel: string;
}

export const DEFAULT_TRIGGER_THRESHOLDS: TriggerThresholds = {
  watch: 10,
  alert: 15,
  severe: 24,
};

export function normalizeThresholds(thresholds: Partial<TriggerThresholds>): TriggerThresholds {
  const watch = Math.max(1, Number(thresholds.watch) || DEFAULT_TRIGGER_THRESHOLDS.watch);
  const alert = Math.max(watch + 1, Number(thresholds.alert) || DEFAULT_TRIGGER_THRESHOLDS.alert);
  const severe = Math.max(alert + 1, Number(thresholds.severe) || DEFAULT_TRIGGER_THRESHOLDS.severe);
  return { watch, alert, severe };
}

export function checkDisruption(rainMm: number, thresholds: TriggerThresholds): TriggerReport {
  const rain = Math.max(0, Number(rainMm) || 0);

  if (rain >= thresholds.severe) {
    return { rainMm: rain, level: 'severe', triggered: true, payoutPercent: 95, statusLabel: 'Severe threshold crossed' };
  }

  if (rain >= thresholds.alert) {
    return { rainMm: rain, level: 'alert', triggered: true, payoutPercent: 75, statusLabel: 'Alert threshold crossed' };
  }

  if (rain >= thresholds.watch) {
    return { rainMm: rain, level: 'watch', triggered: false, payoutPercent: 45, statusLabel: 'Watch threshold reached' };
  }

  return { rainMm: rain, level: 'none', triggered: false, payoutPercent: 0, statusLabel: 'Below watch threshold' };
}
