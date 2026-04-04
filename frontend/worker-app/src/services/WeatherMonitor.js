export const DEFAULT_WEATHER_THRESHOLDS = {
  watch: 12,
  alert: 20,
  severe: 28,
};

/**
 * @typedef {'none'|'watch'|'alert'|'severe'} DisruptionLevel
 */

/**
 * @typedef {Object} WeatherMonitorData
 * @property {boolean} isRaining
 * @property {number} rainMm
 * @property {string=} condition
 * @property {string=} source
 */

/**
 * @typedef {Object} WeatherThresholds
 * @property {number} watch
 * @property {number} alert
 * @property {number} severe
 */

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * @param {Partial<WeatherThresholds> | undefined} thresholds
 * @returns {WeatherThresholds}
 */
export function normalizeThresholds(thresholds) {
  const watch = Math.max(1, toNumber(thresholds?.watch, DEFAULT_WEATHER_THRESHOLDS.watch));
  const alert = Math.max(watch + 1, toNumber(thresholds?.alert, DEFAULT_WEATHER_THRESHOLDS.alert));
  const severe = Math.max(alert + 1, toNumber(thresholds?.severe, DEFAULT_WEATHER_THRESHOLDS.severe));

  return { watch, alert, severe };
}

/**
 * @param {number} rainMm
 * @param {Partial<WeatherThresholds>=} thresholds
 * @returns {DisruptionLevel}
 */
export function resolveDisruptionLevel(rainMm, thresholds) {
  const safeThresholds = normalizeThresholds(thresholds);
  const value = Math.max(0, Number(rainMm) || 0);

  if (value >= safeThresholds.severe) return 'severe';
  if (value >= safeThresholds.alert) return 'alert';
  if (value >= safeThresholds.watch) return 'watch';
  return 'none';
}

function getMeta(level) {
  switch (level) {
    case 'severe':
      return {
        triggered: true,
        autoPayoutEligible: true,
        statusLabel: 'Severe disruption active',
        statusTone: 'danger',
        payoutPercent: 95,
        surgeMultiplier: 1.32,
      };
    case 'alert':
      return {
        triggered: true,
        autoPayoutEligible: true,
        statusLabel: 'Disruption alert crossed',
        statusTone: 'warning',
        payoutPercent: 75,
        surgeMultiplier: 1.16,
      };
    case 'watch':
      return {
        triggered: false,
        autoPayoutEligible: false,
        statusLabel: 'Watch mode active',
        statusTone: 'watch',
        payoutPercent: 45,
        surgeMultiplier: 1.06,
      };
    default:
      return {
        triggered: false,
        autoPayoutEligible: false,
        statusLabel: 'Normal conditions',
        statusTone: 'normal',
        payoutPercent: 0,
        surgeMultiplier: 1,
      };
  }
}

/**
 * @param {WeatherMonitorData} weatherData
 * @param {Partial<WeatherThresholds>=} thresholds
 */
export function checkDisruption(weatherData, thresholds) {
  const safeThresholds = normalizeThresholds(thresholds);
  const rainMm = Math.max(0, Number(weatherData?.rainMm || 0));
  const level = resolveDisruptionLevel(rainMm, safeThresholds);
  const meta = getMeta(level);

  const message = meta.triggered
    ? `Rainfall at ${rainMm}mm crossed auto-trigger threshold (${safeThresholds.alert}mm).`
    : level === 'watch'
      ? `Rainfall at ${rainMm}mm is in watch range (${safeThresholds.watch}-${safeThresholds.alert - 1}mm).`
      : `Rainfall at ${rainMm}mm is below watch threshold (${safeThresholds.watch}mm).`;

  return {
    rainMm,
    level,
    thresholds: safeThresholds,
    ...meta,
    message,
  };
}
