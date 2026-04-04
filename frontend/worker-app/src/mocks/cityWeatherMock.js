export const CITY_WEATHER_MOCK = [
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
  { city: 'Surat', rainfallMm: 18, riskScore: 76, condition: 'rain' },
  { city: 'Kochi', rainfallMm: 27, riskScore: 93, condition: 'rain' },
  { city: 'Nagpur', rainfallMm: 6, riskScore: 52, condition: 'cloudy' },
  { city: 'Indore', rainfallMm: 5, riskScore: 50, condition: 'cloudy' },
  { city: 'Bhopal', rainfallMm: 7, riskScore: 53, condition: 'cloudy' },
  { city: 'Patna', rainfallMm: 12, riskScore: 66, condition: 'rain' },
  { city: 'Vadodara', rainfallMm: 9, riskScore: 59, condition: 'cloudy' },
  { city: 'Coimbatore', rainfallMm: 10, riskScore: 61, condition: 'cloudy' },
  { city: 'Vizag', rainfallMm: 14, riskScore: 70, condition: 'rain' },
  { city: 'Thiruvananthapuram', rainfallMm: 25, riskScore: 92, condition: 'rain' },
];

export function getCityWeather(city) {
  const normalized = String(city || '').trim().toLowerCase();
  const match = CITY_WEATHER_MOCK.find((row) => row.city.toLowerCase() === normalized);
  return match || { city: city || 'Mumbai', rainfallMm: 6, riskScore: 55, condition: 'cloudy' };
}
