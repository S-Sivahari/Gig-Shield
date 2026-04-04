import { getCityWeather } from '../mocks/cityWeatherMock';

export interface AdminPlanPreview {
  id: 'basic' | 'shield_plus' | 'elite';
  name: string;
  premium: number;
  multiplier: number;
}

function roundMoney(value: number): number {
  return Math.max(1, Math.round(value));
}

export function calculateAdminPlans(params: {
  income: number;
  city: string;
  vehicle: '2-wheeler' | '4-wheeler' | '';
  rainMmOverride?: number;
}): { plans: AdminPlanPreview[]; anchorPremium: number; riskLabel: string; rainMm: number } {
  const income = Number(params.income) || 0;
  const cityWeather = getCityWeather(params.city);
  const rainMm = typeof params.rainMmOverride === 'number' ? params.rainMmOverride : cityWeather.rainfallMm;
  const basePremium = roundMoney(income * 0.02);

  const cityFactorBase = Number((0.08 + cityWeather.riskScore / 500).toFixed(3));
  const cityFactor = rainMm > 0 ? cityFactorBase * 1.5 : cityFactorBase;
  const vehicleFactor = params.vehicle === '4-wheeler' ? 0.08 : params.vehicle === '2-wheeler' ? 0.2 : 0.12;

  const anchorPremium = roundMoney(basePremium * (1 + cityFactor + vehicleFactor));
  const riskLabel = rainMm > 15 ? 'High Rain Risk' : rainMm > 0 ? 'Rain Risk' : 'Baseline Risk';

  return {
    anchorPremium,
    riskLabel,
    rainMm,
    plans: [
      { id: 'basic', name: 'Basic', premium: anchorPremium, multiplier: 1 },
      { id: 'shield_plus', name: 'Shield+', premium: roundMoney(anchorPremium * 1.25), multiplier: 1.25 },
      { id: 'elite', name: 'Elite', premium: roundMoney(anchorPremium * 1.5), multiplier: 1.5 },
    ],
  };
}
