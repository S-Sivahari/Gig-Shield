export interface UnderwriterWeatherData {
  isRaining: boolean;
  rainMm: number;
  condition?: string;
  source?: string;
}

export interface UnderwriterInputs {
  income: number;
  city: string;
  vehicle: '2-wheeler' | '4-wheeler' | '';
  weatherData: UnderwriterWeatherData;
}

export interface UnderwriterPlan {
  id: 'basic' | 'shield_plus' | 'elite';
  name: string;
  premium: number;
  tierMultiplier: number;
  riskBadge: string;
  tagline: string;
  features: string[];
  color: string;
  emoji: string;
  recommended?: boolean;
}

export interface UnderwriterBreakdownItem {
  label: string;
  value: number;
  type: 'base' | 'add' | 'total';
  note?: string;
}

export interface UnderwriterResult {
  basePremium: number;
  cityRiskFactor: number;
  vehicleFactor: number;
  combinedFactor: number;
  anchorPremium: number;
  isDisrupted: boolean;
  riskBadge: string;
  plans: UnderwriterPlan[];
  breakdown: UnderwriterBreakdownItem[];
}

export function calculateUnderwrittenPlans(inputs: UnderwriterInputs): UnderwriterResult;
