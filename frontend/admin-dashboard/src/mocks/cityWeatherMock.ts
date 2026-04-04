export interface CityWeatherMockRecord {
  city: string;
  rainfallMm: number;
  riskScore: number;
  condition: 'clear' | 'cloudy' | 'rain';
}

export const CITY_WEATHER_MOCK: CityWeatherMockRecord[] = [
  { city: 'Mumbai', rainfallMm: 22, riskScore: 88, condition: 'rain' },
  { city: 'Delhi', rainfallMm: 4, riskScore: 62, condition: 'cloudy' },
  { city: 'Bangalore', rainfallMm: 16, riskScore: 74, condition: 'rain' },
  { city: 'Hyderabad', rainfallMm: 2, riskScore: 54, condition: 'clear' },
  { city: 'Chennai', rainfallMm: 19, riskScore: 79, condition: 'rain' },
  { city: 'Kolkata', rainfallMm: 24, riskScore: 90, condition: 'rain' },
  { city: 'Pune', rainfallMm: 11, riskScore: 58, condition: 'cloudy' },
  { city: 'Ahmedabad', rainfallMm: 1, riskScore: 49, condition: 'clear' },
  { city: 'Jaipur', rainfallMm: 0, riskScore: 45, condition: 'clear' },
  { city: 'Lucknow', rainfallMm: 8, riskScore: 57, condition: 'cloudy' },
];

export function getCityWeather(city: string): CityWeatherMockRecord {
  const normalized = city.trim().toLowerCase();
  return CITY_WEATHER_MOCK.find((row) => row.city.toLowerCase() === normalized)
    ?? { city, rainfallMm: 6, riskScore: 55, condition: 'cloudy' };
}
