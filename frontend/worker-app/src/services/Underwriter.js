import { getCityWeather } from '../mocks/cityWeatherMock.js';

/**
 * @typedef {Object} UnderwriterWeatherData
 * @property {boolean} isRaining
 * @property {number} rainMm
 * @property {string=} condition
 * @property {string=} source
 */

/**
 * @typedef {Object} UnderwriterInputs
 * @property {number} income
 * @property {string} city
 * @property {'2-wheeler'|'4-wheeler'|''} vehicle
 * @property {UnderwriterWeatherData} weatherData
 */

/**
 * @typedef {Object} UnderwriterPlan
 * @property {'basic'|'shield_plus'|'elite'} id
 * @property {string} name
 * @property {number} premium
 * @property {number} tierMultiplier
 * @property {string} riskBadge
 * @property {string} tagline
 * @property {string[]} features
 * @property {string} color
 * @property {string} emoji
 * @property {boolean=} recommended
 */

/**
 * @typedef {Object} UnderwriterBreakdownItem
 * @property {string} label
 * @property {number} value
 * @property {'base'|'add'|'total'} type
 * @property {string=} note
 */

/**
 * @typedef {Object} UnderwriterResult
 * @property {number} basePremium
 * @property {number} cityRiskFactor
 * @property {number} vehicleFactor
 * @property {number} combinedFactor
 * @property {number} anchorPremium
 * @property {boolean} isDisrupted
 * @property {string} riskBadge
 * @property {UnderwriterPlan[]} plans
 * @property {UnderwriterBreakdownItem[]} breakdown
 */

const VEHICLE_FACTORS = {
  '2-wheeler': 0.2,
  '4-wheeler': 0.08,
  '': 0.12,
};

function roundMoney(value) {
  return Math.max(1, Math.round(value));
}

function buildRiskBadge(isRaining, rainMm, cityRiskFactor) {
  if (isRaining && rainMm > 15) return 'High Rain Risk';
  if (isRaining) return 'Rain Risk';
  if (cityRiskFactor >= 0.18) return 'Elevated City Risk';
  return 'Baseline Risk';
}

/**
 * Phase 2 parametric logic:
 * final = base(2% of income) + city risk + vehicle risk
 * implemented as multiplicative adjustment on base:
 * anchorPremium = base * (1 + cityRiskFactor + vehicleFactor)
 *
 * If weatherData.isRaining is true, city risk factor receives a 1.5x surge.
 *
 * @param {UnderwriterInputs} inputs
 * @returns {UnderwriterResult}
 */
export function calculateUnderwrittenPlans(inputs) {
  const income = Number(inputs.income) || 0;
  const city = inputs.city || 'Mumbai';
  const vehicle = inputs.vehicle || '';
  const weatherData = inputs.weatherData || { isRaining: false, rainMm: 0 };
  const cityMock = getCityWeather(city);

  const basePremium = roundMoney(income * 0.02);

  const baseCityRisk = Number((0.08 + cityMock.riskScore / 500).toFixed(3));
  const cityRiskFactor = weatherData.isRaining ? baseCityRisk * 1.5 : baseCityRisk;
  const vehicleFactor = VEHICLE_FACTORS[vehicle] ?? VEHICLE_FACTORS[''];

  const combinedFactor = cityRiskFactor + vehicleFactor;
  const anchorPremium = roundMoney(basePremium * (1 + combinedFactor));
  const isDisrupted = Number(weatherData.rainMm || 0) > 15;
  const riskBadge = buildRiskBadge(Boolean(weatherData.isRaining), Number(weatherData.rainMm || 0), cityRiskFactor);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      premium: roundMoney(anchorPremium),
      tierMultiplier: 1,
      riskBadge,
      tagline: 'Core weather disruption coverage',
      features: ['Rain disruption cover', 'Auto-trigger checks', 'Weekly protection'],
      color: '#2563EB',
      emoji: '🛡️',
    },
    {
      id: 'shield_plus',
      name: 'Shield+',
      premium: roundMoney(anchorPremium * 1.25),
      tierMultiplier: 1.25,
      riskBadge,
      tagline: 'Balanced protection with higher payout',
      features: ['All Basic benefits', 'Higher payout multiplier', 'Priority support'],
      color: '#0D9488',
      emoji: '⚡',
      recommended: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      premium: roundMoney(anchorPremium * 1.5),
      tierMultiplier: 1.5,
      riskBadge,
      tagline: 'Maximum payout and top priority',
      features: ['All Shield+ benefits', 'Max payout multiplier', 'Fastest claim queue'],
      color: '#D97706',
      emoji: '👑',
    },
  ];

  const breakdown = [
    {
      label: 'Base premium (2% of weekly income)',
      value: basePremium,
      type: 'base',
      note: `2% of ${income.toLocaleString('en-IN')}`,
    },
    {
      label: `City risk factor (${city})`,
      value: roundMoney(basePremium * cityRiskFactor),
      type: 'add',
      note: weatherData.isRaining ? 'Rain surge applied (1.5x)' : 'Standard city risk',
    },
    {
      label: `Vehicle factor (${vehicle || 'default'})`,
      value: roundMoney(basePremium * vehicleFactor),
      type: 'add',
      note: vehicle === '2-wheeler' ? 'Higher exposure profile' : 'Reduced exposure profile',
    },
    {
      label: 'Underwritten weekly premium',
      value: anchorPremium,
      type: 'total',
    },
  ];

  return {
    basePremium,
    cityRiskFactor,
    vehicleFactor,
    combinedFactor,
    anchorPremium,
    isDisrupted,
    riskBadge,
    plans,
    breakdown,
  };
}
