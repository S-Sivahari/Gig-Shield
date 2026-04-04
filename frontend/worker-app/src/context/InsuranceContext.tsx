import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import {
  calculateInsurancePlans,
  type InsurancePlan,
  type InsuranceQuote,
} from '../services/InsuranceEngine.js';
import {
  DEFAULT_WEATHER_THRESHOLDS,
  checkDisruption,
  normalizeThresholds,
  type DisruptionReport,
  type WeatherMonitorData,
  type WeatherThresholds,
} from '../services/WeatherMonitor.js';
import { getCityWeather } from '../mocks/cityWeatherMock.js';

const STORAGE_KEY = 'gigshield_user_data';
const WEATHER_STORAGE_KEY = 'gigshield_weather_state';
const WEATHER_THRESHOLDS_KEY = 'gigshield_weather_thresholds';
const DEV_MODE_KEY = 'gigshield_developer_mode';
const CLAIM_HISTORY_KEY = 'gigshield_claim_history';
const WALLET_LEDGER_KEY = 'gigshield_wallet_ledger';
const CROSS_APP_DISRUPTION_COOKIE = 'gigshield_active_disruption';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type VehicleType = '2-wheeler' | '4-wheeler' | '';

interface WorkerProfile {
  income: number;
  city: string;
  zone: string;
  vehicle: VehicleType;
  persona: string;
  safetyGearBool: boolean;
}

interface RegistrationData {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone?: string;
  aadhaarNumber: string;
  dlNumber: string;
  aadhaarFile: string | null;
  dlFile: string | null;
  platform: string;
  avgHours: string;
  primaryZone: string;
  experienceMonths: string;
  city: string;
  vehicleType: VehicleType;
  workProofName: string;
  weeklyIncome: string;
  workingDays: string;
  coveragePercent: string;
  selectedPlan: InsurancePlan['id'];
  finalPremium: number;
  planName: string;
  upiId: string;
  accountNo: string;
  ifscCode: string;
  loginId: string;
  password: string;
  confirmPassword: string;
  persona: string;
  safetyGearBool: boolean;
  policyAccepted: boolean;
  policyReadAll: boolean;
  policyProgress: number;
  loginMethod?: string;
}

interface AutoClaimEvent {
  id: string;
  zone: string;
  city: string;
  rainfallMm: number;
  level: DisruptionReport['level'];
  estimatedPayout: number;
  status: 'Pending' | 'Approved';
  createdAt: string;
  processedAt?: string;
}

interface WalletLedger {
  safetyNetBalance: number;
  communityPoolBalance: number;
  totalPremiumsCollected: number;
  weeksContributed: number;
  lastWeekIndex: number;
  lastPremium: number;
}

type ProtectionState = 'Active' | 'At Risk' | 'Disrupted';

interface InsuranceContextValue {
  workerProfile: WorkerProfile;
  plans: InsurancePlan[];
  pricingQuote: InsuranceQuote;
  weatherData: WeatherMonitorData;
  weatherThresholds: WeatherThresholds;
  disruptionReport: DisruptionReport;
  isDisrupted: boolean;
  selectedPlanId: InsurancePlan['id'];
  shieldWallet: number;
  weeklyWalletContribution: number;
  weeklyCommunityContribution: number;
  communityPoolBalance: number;
  totalPremiumsCollected: number;
  payoutEstimate: number;
  developerMode: boolean;
  protectionState: ProtectionState;
  autoClaimNotification: string | null;
  claimsHistory: AutoClaimEvent[];
  registrationData: RegistrationData;
  updateRegistrationData: (patch: Partial<RegistrationData>) => void;
  updateWorkerProfile: (patch: Partial<WorkerProfile>) => void;
  updateWeatherData: (patch: Partial<WeatherMonitorData>) => void;
  updateWeatherThresholds: (patch: Partial<WeatherThresholds>) => void;
  simulateHeavyRain: () => void;
  resetWeather: () => void;
  toggleDeveloperMode: () => void;
  selectPlan: (planId: InsurancePlan['id']) => void;
}

const defaultRegistrationData: RegistrationData = {
  fullName: '',
  age: '',
  gender: '',
  email: '',
  phone: '',
  aadhaarNumber: '',
  dlNumber: '',
  aadhaarFile: null,
  dlFile: null,
  platform: '',
  avgHours: '',
  primaryZone: '',
  experienceMonths: '',
  city: 'Mumbai',
  vehicleType: '',
  workProofName: '',
  weeklyIncome: '',
  workingDays: '6',
  coveragePercent: '70%',
  selectedPlan: 'shield_plus',
  finalPremium: 0,
  planName: 'Shield+',
  upiId: '',
  accountNo: '',
  ifscCode: '',
  loginId: '',
  password: '',
  confirmPassword: '',
  persona: 'courier',
  safetyGearBool: false,
  policyAccepted: false,
  policyReadAll: false,
  policyProgress: 0,
};

const InsuranceContext = createContext<InsuranceContextValue | undefined>(undefined);

function loadRegistrationData(): RegistrationData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultRegistrationData;
    const parsed = JSON.parse(stored) as Partial<RegistrationData>;
    return { ...defaultRegistrationData, ...parsed };
  } catch {
    return defaultRegistrationData;
  }
}

function loadWeatherData(city: string): WeatherMonitorData {
  try {
    const stored = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (!stored) return buildWeatherFromCity(city);
    const parsed = JSON.parse(stored) as Partial<WeatherMonitorData>;
    return {
      isRaining: Boolean(parsed.isRaining),
      rainMm: Number(parsed.rainMm) || 0,
      condition: parsed.condition || 'clear',
      source: parsed.source || 'mock',
    };
  } catch {
    return buildWeatherFromCity(city);
  }
}

function loadWeatherThresholds(): WeatherThresholds {
  try {
    const stored = localStorage.getItem(WEATHER_THRESHOLDS_KEY);
    if (!stored) return DEFAULT_WEATHER_THRESHOLDS;
    return normalizeThresholds(JSON.parse(stored) as Partial<WeatherThresholds>);
  } catch {
    return DEFAULT_WEATHER_THRESHOLDS;
  }
}

function loadDeveloperMode(): boolean {
  return localStorage.getItem(DEV_MODE_KEY) === '1';
}

function loadClaimsHistory(): AutoClaimEvent[] {
  try {
    const stored = localStorage.getItem(CLAIM_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as AutoClaimEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadWalletLedger(): WalletLedger {
  try {
    const stored = localStorage.getItem(WALLET_LEDGER_KEY);
    if (!stored) {
      return {
        safetyNetBalance: 0,
        communityPoolBalance: 0,
        totalPremiumsCollected: 0,
        weeksContributed: 0,
        lastWeekIndex: -1,
        lastPremium: 0,
      };
    }

    const parsed = JSON.parse(stored) as Partial<WalletLedger>;
    return {
      safetyNetBalance: Number(parsed.safetyNetBalance) || 0,
      communityPoolBalance: Number(parsed.communityPoolBalance) || 0,
      totalPremiumsCollected: Number(parsed.totalPremiumsCollected) || 0,
      weeksContributed: Number(parsed.weeksContributed) || 0,
      lastWeekIndex: Number.isFinite(parsed.lastWeekIndex) ? Number(parsed.lastWeekIndex) : -1,
      lastPremium: Number(parsed.lastPremium) || 0,
    };
  } catch {
    return {
      safetyNetBalance: 0,
      communityPoolBalance: 0,
      totalPremiumsCollected: 0,
      weeksContributed: 0,
      lastWeekIndex: -1,
      lastPremium: 0,
    };
  }
}

function writeDisruptionSignalCookie(payload: {
  city: string;
  zone: string;
  rainfallMm: number;
  level: string;
  status: string;
  estimatedPayout: number;
  updatedAt: string;
}) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${CROSS_APP_DISRUPTION_COOKIE}=${encoded}; path=/; max-age=1800; SameSite=Lax`;
}

function clearDisruptionSignalCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${CROSS_APP_DISRUPTION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function buildWeatherFromCity(city: string): WeatherMonitorData {
  const weather = getCityWeather(city || 'Mumbai');
  return {
    isRaining: weather.rainfallMm > 0,
    rainMm: weather.rainfallMm,
    condition: weather.condition,
    source: 'mock',
  };
}

function toWorkerProfile(data: RegistrationData): WorkerProfile {
  return {
    income: Number(data.weeklyIncome) || 0,
    city: data.city || 'Mumbai',
    zone: data.primaryZone || data.city || 'Default zone',
    vehicle: data.vehicleType || '',
    persona: data.persona || 'courier',
    safetyGearBool: Boolean(data.safetyGearBool),
  };
}

export const InsuranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(loadRegistrationData);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile>(() => toWorkerProfile(loadRegistrationData()));
  const [weatherData, setWeatherData] = useState<WeatherMonitorData>(() => loadWeatherData(toWorkerProfile(loadRegistrationData()).city));
  const [weatherThresholds, setWeatherThresholds] = useState<WeatherThresholds>(loadWeatherThresholds);
  const [developerMode, setDeveloperMode] = useState<boolean>(loadDeveloperMode);
  const [claimsHistory, setClaimsHistory] = useState<AutoClaimEvent[]>(loadClaimsHistory);
  const [walletLedger, setWalletLedger] = useState<WalletLedger>(loadWalletLedger);
  const [autoClaimNotification, setAutoClaimNotification] = useState<string | null>(null);
  const previousTriggeredRef = useRef<boolean>(false);

  const disruptionReport = useMemo(() => checkDisruption(weatherData, weatherThresholds), [weatherData, weatherThresholds]);

  const underwritten = useMemo(() => {
    return calculateInsurancePlans({
      weeklyIncome: workerProfile.income,
      zone: workerProfile.zone,
      vehicleType: workerProfile.vehicle,
      persona: workerProfile.persona,
      safetyGearBool: workerProfile.safetyGearBool,
      disruptionLevel: disruptionReport.level,
    });
  }, [
    workerProfile.income,
    workerProfile.zone,
    workerProfile.vehicle,
    workerProfile.persona,
    workerProfile.safetyGearBool,
    disruptionReport.level,
  ]);

  const protectionState: ProtectionState = disruptionReport.level === 'none'
    ? 'Active'
    : disruptionReport.level === 'watch'
      ? 'At Risk'
      : 'Disrupted';

  const selectedPlanId = registrationData.selectedPlan || 'shield_plus';
  const selectedPlan = underwritten.plans.find((plan) => plan.id === selectedPlanId) ?? underwritten.plans[1];
  const weeklyWalletContribution = Math.round(selectedPlan.premium * 0.3);
  const weeklyCommunityContribution = Math.max(0, selectedPlan.premium - weeklyWalletContribution);
  const shieldWallet = walletLedger.safetyNetBalance;
  const communityPoolBalance = walletLedger.communityPoolBalance;
  const totalPremiumsCollected = walletLedger.totalPremiumsCollected;
  const planPayoutMultiplier = selectedPlan.payoutMultiplier || 1;

  const protectionCap = Math.round((workerProfile.income || 0) * ((selectedPlan?.coveragePercent || 70) / 100));
  const fullPayoutEstimate = Math.round(protectionCap * (disruptionReport.payoutPercent / 100) * planPayoutMultiplier);
  const cappedReliefPayout = Math.round(fullPayoutEstimate * 0.3);
  const payoutEstimate = disruptionReport.autoPayoutEligible
    ? Math.max(120, Math.min(650, cappedReliefPayout))
    : 0;

  useEffect(() => {
    setRegistrationData((prev) => {
      const next = {
        ...prev,
        finalPremium: selectedPlan.premium,
        planName: selectedPlan.name,
      };
      return next;
    });
  }, [selectedPlan.premium, selectedPlan.name]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationData));
  }, [registrationData]);

  useEffect(() => {
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weatherData));
  }, [weatherData]);

  useEffect(() => {
    localStorage.setItem(WEATHER_THRESHOLDS_KEY, JSON.stringify(weatherThresholds));
  }, [weatherThresholds]);

  useEffect(() => {
    localStorage.setItem(DEV_MODE_KEY, developerMode ? '1' : '0');
  }, [developerMode]);

  useEffect(() => {
    localStorage.setItem(CLAIM_HISTORY_KEY, JSON.stringify(claimsHistory));
  }, [claimsHistory]);

  useEffect(() => {
    localStorage.setItem(WALLET_LEDGER_KEY, JSON.stringify(walletLedger));
  }, [walletLedger]);

  useEffect(() => {
    const weeklyPremium = selectedPlan.premium;
    if (weeklyPremium <= 0) return;

    setWalletLedger((prev) => {
      const currentWeekIndex = Math.floor(Date.now() / WEEK_MS);
      const cycles = prev.lastWeekIndex < 0 ? 1 : Math.max(0, currentWeekIndex - prev.lastWeekIndex);

      if (cycles <= 0) {
        if (prev.lastPremium === weeklyPremium) return prev;
        return { ...prev, lastPremium: weeklyPremium };
      }

      const personalPerCycle = Math.round(weeklyPremium * 0.3);
      const communityPerCycle = Math.max(0, weeklyPremium - personalPerCycle);

      return {
        safetyNetBalance: prev.safetyNetBalance + (personalPerCycle * cycles),
        communityPoolBalance: prev.communityPoolBalance + (communityPerCycle * cycles),
        totalPremiumsCollected: prev.totalPremiumsCollected + (weeklyPremium * cycles),
        weeksContributed: prev.weeksContributed + cycles,
        lastWeekIndex: currentWeekIndex,
        lastPremium: weeklyPremium,
      };
    });
  }, [selectedPlan.premium]);

  useEffect(() => {
    setWeatherData((prev) => (prev.source === 'simulated' ? prev : buildWeatherFromCity(workerProfile.city)));
  }, [workerProfile.city]);

  useEffect(() => {
    if (!developerMode && weatherData.source === 'simulated') {
      setWeatherData(buildWeatherFromCity(workerProfile.city));
    }
  }, [developerMode, weatherData.source, workerProfile.city]);

  useEffect(() => {
    const wasTriggered = previousTriggeredRef.current;
    const isTriggered = disruptionReport.triggered;

    if (isTriggered && !wasTriggered) {
      const effectivePayout = Math.max(0, payoutEstimate || 180);
      const zoneName = workerProfile.zone || workerProfile.city || 'your zone';
      const event: AutoClaimEvent = {
        id: `CLM-${Date.now()}`,
        zone: zoneName,
        city: workerProfile.city,
        rainfallMm: disruptionReport.rainMm,
        level: disruptionReport.level,
        estimatedPayout: effectivePayout,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      setClaimsHistory((prev) => [event, ...prev].slice(0, 30));
      setAutoClaimNotification(
        `⚠️ Rain detected in ${zoneName}. Estimated Payout: ₹${effectivePayout.toLocaleString('en-IN')}.`,
      );
    }

    if (!isTriggered && wasTriggered) {
      setAutoClaimNotification(null);
      clearDisruptionSignalCookie();
    }

    previousTriggeredRef.current = isTriggered;
  }, [disruptionReport.triggered, disruptionReport.level, disruptionReport.rainMm, workerProfile.zone, workerProfile.city, payoutEstimate]);

  useEffect(() => {
    if (!disruptionReport.triggered) return;

    writeDisruptionSignalCookie({
      city: workerProfile.city || 'Mumbai',
      zone: workerProfile.zone || workerProfile.city || 'Unknown zone',
      rainfallMm: disruptionReport.rainMm,
      level: disruptionReport.level,
      status: protectionState,
      estimatedPayout: payoutEstimate,
      updatedAt: new Date().toISOString(),
    });
  }, [
    disruptionReport.triggered,
    disruptionReport.rainMm,
    disruptionReport.level,
    workerProfile.city,
    workerProfile.zone,
    protectionState,
    payoutEstimate,
  ]);

  useEffect(() => {
    const pendingClaim = claimsHistory.find((claim) => claim.status === 'Pending');
    if (!pendingClaim) return;

    const timer = window.setTimeout(() => {
      setClaimsHistory((prev) => prev.map((claim) => (
        claim.id === pendingClaim.id
          ? { ...claim, status: 'Approved', processedAt: new Date().toISOString() }
          : claim
      )));
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [claimsHistory]);

  const updateRegistrationData = (patch: Partial<RegistrationData>) => {
    setRegistrationData((prev) => {
      const next = { ...prev, ...patch };
      setWorkerProfile((current) => ({
        income: Number(next.weeklyIncome) || 0,
        city: next.city || current.city,
        zone: next.primaryZone || next.city || current.zone,
        vehicle: next.vehicleType || current.vehicle,
        persona: next.persona || current.persona,
        safetyGearBool: Boolean(next.safetyGearBool),
      }));
      return next;
    });
  };

  const updateWorkerProfile = (patch: Partial<WorkerProfile>) => {
    setWorkerProfile((prev) => {
      const next = { ...prev, ...patch };
      setRegistrationData((form) => ({
        ...form,
        weeklyIncome: String(next.income || ''),
        city: next.city,
        primaryZone: next.zone,
        vehicleType: next.vehicle,
        persona: next.persona,
        safetyGearBool: next.safetyGearBool,
      }));
      return next;
    });
  };

  const updateWeatherData = (patch: Partial<WeatherMonitorData>) => {
    setWeatherData((prev) => ({ ...prev, ...patch }));
  };

  const updateWeatherThresholds = (patch: Partial<WeatherThresholds>) => {
    setWeatherThresholds((prev) => normalizeThresholds({ ...prev, ...patch }));
  };

  const simulateHeavyRain = () => {
    setWeatherData({
      isRaining: true,
      rainMm: Math.max(weatherThresholds.severe + 4, 28),
      condition: 'heavy-rain',
      source: 'simulated',
    });
  };

  const resetWeather = () => {
    setWeatherData(buildWeatherFromCity(workerProfile.city));
  };

  const toggleDeveloperMode = () => {
    setDeveloperMode((prev) => !prev);
  };

  const selectPlan = (planId: InsurancePlan['id']) => {
    setRegistrationData((prev) => ({ ...prev, selectedPlan: planId }));
  };

  const value: InsuranceContextValue = {
    workerProfile,
    plans: underwritten.plans,
    pricingQuote: underwritten,
    weatherData,
    weatherThresholds,
    disruptionReport,
    isDisrupted: disruptionReport.triggered,
    selectedPlanId,
    shieldWallet,
    weeklyWalletContribution,
    weeklyCommunityContribution,
    communityPoolBalance,
    totalPremiumsCollected,
    payoutEstimate,
    developerMode,
    protectionState,
    autoClaimNotification,
    claimsHistory,
    registrationData,
    updateRegistrationData,
    updateWorkerProfile,
    updateWeatherData,
    updateWeatherThresholds,
    simulateHeavyRain,
    resetWeather,
    toggleDeveloperMode,
    selectPlan,
  };

  return <InsuranceContext.Provider value={value}>{children}</InsuranceContext.Provider>;
};

export function useInsurance(): InsuranceContextValue {
  const ctx = useContext(InsuranceContext);
  if (!ctx) {
    throw new Error('useInsurance must be used within InsuranceProvider');
  }
  return ctx;
}
