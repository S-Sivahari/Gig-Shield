import { useMemo } from 'react';

export interface PremiumInputs {
  weeklyIncome: number;        // ₹
  vehicleType: '2-wheeler' | '4-wheeler' | '';
  hasSafetyGear: boolean;      // Waterproof equipment
  weatherMultiplier: number;   // From useWeatherRisk
  weatherReason: string;       // Human-readable reason
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
}

// ─── Core Math Engine ───────────────────────────────────────────────────────

export function calculatePremium(inputs: PremiumInputs): PremiumBreakdown {
  const { weeklyIncome, vehicleType, hasSafetyGear, weatherMultiplier, weatherReason, city } = inputs;

  // Step 1: Base Premium = 2% of weekly income
  const basePremium = weeklyIncome * 0.02;

  // Step 2: Weather risk adjustment
  const weatherAdjusted = basePremium * weatherMultiplier;
  const weatherDelta = weatherAdjusted - basePremium;

  // Step 3: Vehicle vulnerability factor
  const vehicleMultiplier = vehicleType === '4-wheeler' ? 0.9 : vehicleType === '2-wheeler' ? 1.2 : 1.0;
  const vehicleAdjusted = weatherAdjusted * vehicleMultiplier;
  const vehicleDelta = vehicleAdjusted - weatherAdjusted;

  // Step 4: Safety gear incentive (-5%)
  const gearPercentage = hasSafetyGear ? 0.05 : 0;
  const gearDiscount = vehicleAdjusted * gearPercentage;
  const finalPremium = Math.max(1, Math.round(vehicleAdjusted - gearDiscount));

  const reasons: BreakdownItem[] = [
    {
      label: 'Base Premium (2% of weekly income)',
      value: Math.round(basePremium),
      type: 'base',
      note: `2% × ₹${weeklyIncome.toLocaleString()}`,
    },
  ];

  if (weatherDelta !== 0) {
    reasons.push({
      label: weatherMultiplier > 1.0
        ? `Weather Risk — ${city}`
        : `Weather — Clear conditions`,
      value: Math.round(Math.abs(weatherDelta)),
      type: weatherDelta > 0 ? 'add' : 'sub',
      note: weatherReason,
    });
  }

  if (vehicleDelta !== 0) {
    reasons.push({
      label: vehicleType === '2-wheeler'
        ? '2-Wheeler Vulnerability (+20%)'
        : '4-Wheeler Stability Discount (−10%)',
      value: Math.round(Math.abs(vehicleDelta)),
      type: vehicleDelta > 0 ? 'add' : 'sub',
      note: vehicleType === '2-wheeler' ? 'Higher road exposure factor' : 'Lower road risk factor',
    });
  }

  if (gearDiscount > 0) {
    reasons.push({
      label: 'Safety Gear Discount (−5%)',
      value: Math.round(gearDiscount),
      type: 'sub',
      note: 'Waterproof equipment reduces claim likelihood',
    });
  }

  reasons.push({
    label: 'Your Weekly Premium',
    value: finalPremium,
    type: 'total',
  });

  return {
    basePremium: Math.round(basePremium),
    weatherAdjusted: Math.round(weatherAdjusted),
    vehicleAdjusted: Math.round(vehicleAdjusted),
    gearDiscount: Math.round(gearDiscount),
    finalPremium,
    weatherMultiplier,
    vehicleMultiplier,
    gearPercentage,
    reasons,
  };
}

// ─── Plan Picker Factory ─────────────────────────────────────────────────────

export function buildPlans(basePremium: number): PlanOption[] {
  return [
    {
      id: 'basic',
      name: 'Basic',
      emoji: '🛡️',
      multiplier: 1.0,
      premium: basePremium,
      tagline: 'Covers Red-Alert weather only.',
      features: [
        'Heavy rain & storm payouts',
        '1× income replacement',
        'Auto-claim trigger',
      ],
      color: '#3B82F6',
    },
    {
      id: 'shield_plus',
      name: 'Shield+',
      emoji: '⚡',
      multiplier: 1.25,
      premium: Math.round(basePremium * 1.25),
      tagline: 'Covers moderate rain + 1.5× Payout + Heatwave protection.',
      features: [
        'All Basic benefits',
        '1.5× income replacement',
        'Heatwave & AQI spike cover',
        'Moderate rain included',
      ],
      color: '#8B5CF6',
      recommended: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      emoji: '👑',
      multiplier: 1.5,
      premium: Math.round(basePremium * 1.5),
      tagline: 'Covers Riots/Curfews + 2× Payout + Shield Wallet Rollover.',
      features: [
        'All Shield+ benefits',
        '2× income replacement',
        'Riot & curfew cover',
        'Shield Wallet rollover',
        'Priority claim settlement',
      ],
      color: '#F59E0B',
    },
  ];
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export function usePremiumEngine(inputs: PremiumInputs) {
  const breakdown = useMemo(() => calculatePremium(inputs), [
    inputs.weeklyIncome,
    inputs.vehicleType,
    inputs.hasSafetyGear,
    inputs.weatherMultiplier,
    inputs.weatherReason,
    inputs.city,
  ]);

  const plans = useMemo(() => buildPlans(breakdown.finalPremium), [breakdown.finalPremium]);

  return { breakdown, plans };
}
