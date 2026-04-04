export interface CityWeatherMockRecord {
  city: string;
  rainfallMm: number;
  riskScore: number;
  condition: 'clear' | 'cloudy' | 'rain';
}

export const CITY_WEATHER_MOCK: CityWeatherMockRecord[];

export function getCityWeather(city: string): CityWeatherMockRecord;
