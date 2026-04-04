const VEHICLE_FACTORS = {
  '2-wheeler': 1.18,
  '4-wheeler': 0.92,
  '': 1,
};

const PERSONA_FACTORS = {
  courier: 1.08,
  shopper: 1,
  rideshare: 1.12,
  helper: 1.03,
};

const DISRUPTION_FACTORS = {
  none: 1,
  watch: 1.06,
  alert: 1.16,
  severe: 1.32,
};

const PLAN_MULTIPLIERS = {
  basic: 1,
  shield_plus: 1.22,
  elite: 1.45,
};

const PLAN_COVERAGE = {
  basic: 55,
  shield_plus: 70,
  elite: 90,
};

/**
 * @typedef {'none'|'watch'|'alert'|'severe'} DisruptionLevel
 */

/**
 * @typedef {'basic'|'shield_plus'|'elite'} InsurancePlanId
 */

/**
 * @typedef {Object} InsuranceInputs
 * @property {number} weeklyIncome
 * @property {string} zone
 * @property {'2-wheeler'|'4-wheeler'|''} vehicleType
 * @property {string} persona
 * @property {boolean} safetyGearBool
 * @property {DisruptionLevel} disruptionLevel
 */

function roundMoney(value) {
  return Math.max(1, Math.round(value));
}

function normalizeZone(zone) {
  return String(zone || '').trim().toLowerCase();
}

function resolveZoneFactor(zone) {
  const normalized = normalizeZone(zone);
  if (!normalized) return 0.09;

  if (/flood|coastal|dock|market|river|basin|old city/.test(normalized)) {
    return 0.18;
  }

  if (/central|downtown|it park|tech|hub|station/.test(normalized)) {
    return 0.14;
  }

  if (/suburb|residential|extension|green|layout/.test(normalized)) {
    return 0.1;
  }

  return 0.12;
}

function getRiskBadge(multiplier, disruptionLevel) {
  if (disruptionLevel === 'severe' || multiplier >= 1.7) return 'Extreme trigger risk';
  if (disruptionLevel === 'alert' || multiplier >= 1.5) return 'High trigger risk';
  if (disruptionLevel === 'watch' || multiplier >= 1.3) return 'Elevated trigger risk';
  return 'Stable risk window';
}

function buildRiskCards(params) {
  const cards = [
    {
      id: 'zone',
      title: 'Zone pressure',
      value: `+${Math.round(params.zoneFactor * 100)}%`,
      tone: params.zoneFactor >= 0.15 ? 'high' : params.zoneFactor >= 0.11 ? 'medium' : 'low',
      hint: params.zone,
    },
    {
      id: 'vehicle',
      title: 'Vehicle profile',
      value: `${Math.round((params.vehicleFactor - 1) * 100)}%`,
      tone: params.vehicleFactor > 1 ? 'high' : 'low',
      hint: params.vehicleType || 'Unknown',
    },
    {
      id: 'weather',
      title: 'Weather trigger',
      value: `x${params.disruptionFactor.toFixed(2)}`,
      tone: params.disruptionFactor >= 1.2 ? 'high' : params.disruptionFactor > 1 ? 'medium' : 'low',
      hint: params.disruptionLevel,
    },
  ];

  if (params.safetyGearDiscount > 0) {
    cards.push({
      id: 'gear',
      title: 'Safety discipline',
      value: `-${Math.round(params.safetyGearDiscount * 100)}%`,
      tone: 'low',
      hint: 'Certified gear',
    });
  }

  return cards;
}

/**
 * @param {InsuranceInputs} inputs
 */
export function calculateInsuranceQuote(inputs) {
  const weeklyIncome = Number(inputs.weeklyIncome) || 0;
  const zone = String(inputs.zone || 'default zone');
  const disruptionLevel = inputs.disruptionLevel || 'none';

  const basePremium = roundMoney(weeklyIncome * 0.02);
  const zoneFactor = resolveZoneFactor(zone);
  const vehicleFactor = VEHICLE_FACTORS[inputs.vehicleType] ?? 1;
  const personaFactor = PERSONA_FACTORS[inputs.persona] ?? 1;
  const disruptionFactor = DISRUPTION_FACTORS[disruptionLevel] ?? 1;
  const safetyGearDiscount = inputs.safetyGearBool ? 0.05 : 0;
  const safetyGearFactor = 1 - safetyGearDiscount;

  const totalMultiplier = Number(((1 + zoneFactor) * vehicleFactor * personaFactor * disruptionFactor * safetyGearFactor).toFixed(3));
  const anchorPremium = roundMoney(basePremium * totalMultiplier);

  const breakdown = [
    { label: 'Base premium (2% of weekly income)', value: basePremium, type: 'base' },
    { label: 'Zone risk load', value: roundMoney(basePremium * zoneFactor), type: 'add', note: zone },
    { label: 'Vehicle factor', value: roundMoney(basePremium * (vehicleFactor - 1)), type: vehicleFactor >= 1 ? 'add' : 'sub' },
    { label: 'Persona factor', value: roundMoney(basePremium * (personaFactor - 1)), type: personaFactor >= 1 ? 'add' : 'sub' },
    { label: 'Weather trigger factor', value: roundMoney(basePremium * (disruptionFactor - 1)), type: disruptionFactor > 1 ? 'add' : 'base' },
  ];

  if (safetyGearDiscount > 0) {
    breakdown.push({
      label: 'Safety discipline discount',
      value: roundMoney(basePremium * safetyGearDiscount),
      type: 'sub',
    });
  }

  breakdown.push({ label: 'Anchor weekly premium', value: anchorPremium, type: 'total' });

  return {
    basePremium,
    zone,
    zoneFactor,
    vehicleFactor,
    personaFactor,
    disruptionFactor,
    safetyGearDiscount,
    totalMultiplier,
    anchorPremium,
    riskBadge: getRiskBadge(totalMultiplier, disruptionLevel),
    riskCards: buildRiskCards({
      zone,
      zoneFactor,
      vehicleType: inputs.vehicleType,
      vehicleFactor,
      disruptionFactor,
      disruptionLevel,
      safetyGearDiscount,
    }),
    breakdown,
  };
}

/**
 * @param {number} anchorPremium
 */
export function buildPlanTiers(anchorPremium) {
  return [
    {
      id: 'basic',
      name: 'Basic',
      premium: roundMoney(anchorPremium * PLAN_MULTIPLIERS.basic),
      tierMultiplier: PLAN_MULTIPLIERS.basic,
      coveragePercent: PLAN_COVERAGE.basic,
      riskBadge: 'Starter protection',
      tagline: 'For stable zones and shorter shifts',
      features: ['Rain watch alerts', 'One-click policy view', 'Weekly protection'],
      color: '#2563EB',
      emoji: '🛡️',
    },
    {
      id: 'shield_plus',
      name: 'Shield+',
      premium: roundMoney(anchorPremium * PLAN_MULTIPLIERS.shield_plus),
      tierMultiplier: PLAN_MULTIPLIERS.shield_plus,
      coveragePercent: PLAN_COVERAGE.shield_plus,
      riskBadge: 'Balanced protection',
      tagline: 'Best fit for full-time city riders',
      features: ['Zero-touch alerts', 'Priority auto-approval', 'Stronger payout cover'],
      color: '#0EA5E9',
      emoji: '⚡',
      recommended: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      premium: roundMoney(anchorPremium * PLAN_MULTIPLIERS.elite),
      tierMultiplier: PLAN_MULTIPLIERS.elite,
      coveragePercent: PLAN_COVERAGE.elite,
      riskBadge: 'Maximum protection',
      tagline: 'For high-risk and long-route workers',
      features: ['Severe event fast lane', 'High payout ceiling', 'Premium support lane'],
      color: '#0F172A',
      emoji: '🏆',
    },
  ];
}

/**
 * @param {InsuranceInputs} inputs
 */
export function calculateInsurancePlans(inputs) {
  const quote = calculateInsuranceQuote(inputs);
  const plans = buildPlanTiers(quote.anchorPremium);
  return {
    ...quote,
    plans,
  };
}
