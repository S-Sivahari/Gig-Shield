export type AdminDisruptionLevel = 'none' | 'watch' | 'alert' | 'severe';

export interface AdminPlanPreview {
  id: 'basic' | 'shield_plus' | 'elite';
  name: string;
  premium: number;
  multiplier: number;
  coveragePercent: number;
}

interface AdminPlanResult {
  plans: AdminPlanPreview[];
  anchorPremium: number;
  riskLabel: string;
  totalMultiplier: number;
}

const ZONE_FACTOR: Record<string, number> = {
  core: 0.4,
  urban: 0.3,
  suburban: 0.2,
};

const VEHICLE_FACTOR: Record<'2-wheeler' | '4-wheeler', number> = {
  '2-wheeler': 1.3,
  '4-wheeler': 0.9,
};

const PERSONA_FACTOR: Record<'courier' | 'shopper' | 'rideshare', number> = {
  courier: 1.08,
  shopper: 1,
  rideshare: 1.12,
};

const DISRUPTION_FACTOR: Record<AdminDisruptionLevel, number> = {
  none: 1,
  watch: 1.06,
  alert: 1.16,
  severe: 1.32,
};

function roundMoney(value: number): number {
  return Math.max(1, Math.round(value));
}

export function calculateAdminPlans(params: {
  income: number;
  zone: 'core' | 'urban' | 'suburban';
  vehicle: '2-wheeler' | '4-wheeler';
  persona: 'courier' | 'shopper' | 'rideshare';
  disruptionLevel: AdminDisruptionLevel;
}): AdminPlanResult {
  const basePremium = roundMoney((Number(params.income) || 0) * 0.02);
  const totalMultiplier = Number((
    (1 + ZONE_FACTOR[params.zone])
    * VEHICLE_FACTOR[params.vehicle]
    * PERSONA_FACTOR[params.persona]
    * DISRUPTION_FACTOR[params.disruptionLevel]
  ).toFixed(3));

  const anchorPremium = roundMoney(basePremium * totalMultiplier);

  const riskLabel = params.disruptionLevel === 'severe'
    ? 'Severe Trigger Risk'
    : params.disruptionLevel === 'alert'
      ? 'Alert Trigger Risk'
      : params.disruptionLevel === 'watch'
        ? 'Watch Mode Risk'
        : 'Normal Risk';

  return {
    anchorPremium,
    riskLabel,
    totalMultiplier,
    plans: [
      { id: 'basic', name: 'Basic', premium: anchorPremium, multiplier: 1, coveragePercent: 55 },
      { id: 'shield_plus', name: 'Shield+', premium: roundMoney(anchorPremium * 1.25), multiplier: 1.25, coveragePercent: 70 },
      { id: 'elite', name: 'Elite', premium: roundMoney(anchorPremium * 1.5), multiplier: 1.5, coveragePercent: 90 },
    ],
  };
}
