import { useMemo } from 'react';
import { calculateUnderwrittenPlans } from '../services/Underwriter.js';

export interface PremiumInputs {
  weeklyIncome: number;
  vehicleType: '2-wheeler' | '4-wheeler' | '';
  weatherMultiplier: number;
  weatherReason: string;
  city: string;
}

export interface PremiumBreakdown {
  basePremium: number;
  weatherAdjusted: number;
  vehicleAdjusted: number;
  gearDiscount: number;
  finalPremium: number;
  weatherMultiplier: number;
  vehicleMultiplier: number;
  gearPercentage: number;
  reasons: BreakdownItem[];
}

export interface BreakdownItem {
  label: string;
  value: number;
  type: 'base' | 'add' | 'sub' | 'total';
  note?: string;
}

export interface PlanOption {
  id: 'basic' | 'shield_plus' | 'elite';
  name: string;
  emoji: string;
  multiplier: number;
  premium: number;
  tagline: string;
  features: string[];
  color: string;
  recommended?: boolean;
  riskBadge?: string;
}

export function calculatePremium(inputs: PremiumInputs): PremiumBreakdown {
  const underwritten = calculateUnderwrittenPlans({
    income: inputs.weeklyIncome,
    city: inputs.city,
    vehicle: inputs.vehicleType,
    weatherData: {
      isRaining: inputs.weatherMultiplier > 1,
      rainMm: inputs.weatherMultiplier >= 1.5 ? 20 : 0,
      condition: inputs.weatherReason,
      source: 'simulated',
    },
  });

  const reasons: BreakdownItem[] = underwritten.breakdown.map((item) => ({
    label: item.label,
    value: item.value,
    type: item.type,
    note: item.note,
  }));

  return {
    basePremium: underwritten.basePremium,
    weatherAdjusted: underwritten.basePremium + Math.round(underwritten.basePremium * underwritten.cityRiskFactor),
    vehicleAdjusted: underwritten.anchorPremium,
    gearDiscount: 0,
    finalPremium: underwritten.anchorPremium,
    weatherMultiplier: inputs.weatherMultiplier,
    vehicleMultiplier: 1 + underwritten.vehicleFactor,
    gearPercentage: 0,
    reasons,
  };
}

export function buildPlans(basePremium: number): PlanOption[] {
  const underwritten = calculateUnderwrittenPlans({
    income: 5000,
    city: 'Mumbai',
    vehicle: '2-wheeler',
    weatherData: { isRaining: false, rainMm: 0 },
  });

  return underwritten.plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    emoji: plan.emoji,
    multiplier: plan.tierMultiplier,
    premium: Math.max(1, Math.round(basePremium * plan.tierMultiplier)),
    tagline: plan.tagline,
    features: plan.features,
    color: plan.color,
    recommended: plan.recommended,
    riskBadge: plan.riskBadge,
  }));
}

export function usePremiumEngine(inputs: PremiumInputs) {
  const breakdown = useMemo(() => calculatePremium(inputs), [
    inputs.weeklyIncome,
    inputs.vehicleType,
    inputs.weatherMultiplier,
    inputs.weatherReason,
    inputs.city,
  ]);

  const plans = useMemo(() => {
    const underwritten = calculateUnderwrittenPlans({
      income: inputs.weeklyIncome,
      city: inputs.city,
      vehicle: inputs.vehicleType,
      weatherData: {
        isRaining: inputs.weatherMultiplier > 1,
        rainMm: inputs.weatherMultiplier >= 1.5 ? 20 : 0,
      },
    });
    return underwritten.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      emoji: plan.emoji,
      multiplier: plan.tierMultiplier,
      premium: plan.premium,
      tagline: plan.tagline,
      features: plan.features,
      color: plan.color,
      recommended: plan.recommended,
      riskBadge: plan.riskBadge,
    }));
  }, [inputs.weeklyIncome, inputs.city, inputs.vehicleType, inputs.weatherMultiplier]);

  return { breakdown, plans };
}
