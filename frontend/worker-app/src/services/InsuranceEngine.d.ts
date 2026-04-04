export type DisruptionLevel = 'none' | 'watch' | 'alert' | 'severe';
export type InsurancePlanId = 'basic' | 'shield_plus' | 'elite';

export interface InsuranceInputs {
  weeklyIncome: number;
  zone: string;
  vehicleType: '2-wheeler' | '4-wheeler' | '';
  persona: string;
  safetyGearBool: boolean;
  disruptionLevel: DisruptionLevel;
}

export interface InsuranceBreakdownItem {
  label: string;
  value: number;
  type: 'base' | 'add' | 'sub' | 'total';
  note?: string;
}

export interface RiskCard {
  id: string;
  title: string;
  value: string;
  tone: 'low' | 'medium' | 'high';
  hint: string;
}

export interface InsurancePlan {
  id: InsurancePlanId;
  name: string;
  premium: number;
  tierMultiplier: number;
  coveragePercent: number;
  payoutMultiplier: number;
  riskBadge: string;
  tagline: string;
  features: string[];
  color: string;
  emoji: string;
  recommended?: boolean;
}

export interface InsuranceQuote {
  basePremium: number;
  zone: string;
  zoneFactor: number;
  vehicleFactor: number;
  personaFactor: number;
  disruptionFactor: number;
  safetyGearDiscount: number;
  totalMultiplier: number;
  anchorPremium: number;
  riskBadge: string;
  riskCards: RiskCard[];
  breakdown: InsuranceBreakdownItem[];
}

export interface InsuranceResult extends InsuranceQuote {
  plans: InsurancePlan[];
}

export function calculateInsuranceQuote(inputs: InsuranceInputs): InsuranceQuote;
export function buildPlanTiers(anchorPremium: number): InsurancePlan[];
export function calculateInsurancePlans(inputs: InsuranceInputs): InsuranceResult;
