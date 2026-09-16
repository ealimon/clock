import { WeatherData, TemperatureUnit, WeatherLocation } from '../types';

export interface WeatherConditionInfo {
  label: string;
  iconName: 'Sun' | 'Moon' | 'CloudSun' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning';
}

export function getWeatherConditionInfo(code: number, isDay = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        label: 'Mainly Clear',
        iconName: isDay ? 'CloudSun' : 'Cloud',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'Cloud',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        iconName: 'CloudRain',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudSnow',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snow',
        iconName: 'CloudSnow',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRain',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
      };
    default:
      return {
        label: 'Fair',
        iconName: isDay ? 'Sun' : 'Cloud',
      };
  }
}

/**
 * Reverse geocodes coordinates to a friendly city/locality name using free client-side API
 */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      if (city) {
        const region = data.principalSubdivisionCode ? `, ${data.principalSubdivisionCode.split('-')[1] || data.principalSubdivisionCode}` : (data.countryCode ? `, ${data.countryCode}` : '');
        return `${city}${region}`;
      }
    }
  } catch {
    // Fallback if network fails
  }
  return 'Local Area';
}

/**
 * Fetches current weather and daily highs/lows from Open-Meteo
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit,
  customCityName?: string
): Promise<WeatherData> {
  const tempUnitParam = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnitParam = unit === 'fahrenheit' ? 'mph' : 'kmh';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnitParam}&wind_speed_unit=${windUnitParam}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;
  const daily = data.daily;

  let cityName = customCityName;
  if (!cityName) {
    cityName = await reverseGeocode(latitude, longitude);
  }

  const isDay = current?.is_day === 1;
  const conditionInfo = getWeatherConditionInfo(current?.weather_code ?? 0, isDay);

  return {
    temperature: Math.round(current?.temperature_2m ?? 0),
    tempMax: Math.round(daily?.temperature_2m_max?.[0] ?? current?.temperature_2m ?? 0),
    tempMin: Math.round(daily?.temperature_2m_min?.[0] ?? current?.temperature_2m ?? 0),
    weatherCode: current?.weather_code ?? 0,
    condition: conditionInfo.label,
    humidity: Math.round(current?.relative_humidity_2m ?? 0),
    windSpeed: Math.round(current?.wind_speed_10m ?? 0),
    locationName: cityName,
    unit,
    lastUpdated: Date.now(),
  };
}

/**
 * Approximate coordinate fallback for the user's timezone if GPS is denied or delayed
 */
export function getDefaultCoordinatesForTimezone(): { latitude: number; longitude: number; name: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, { lat: number; lon: number; name: string }> = {
      'America/New_York': { lat: 40.7128, lon: -74.006, name: 'New York, US' },
      'America/Chicago': { lat: 41.8781, lon: -87.6298, name: 'Chicago, US' },
      'America/Denver': { lat: 39.7392, lon: -104.9903, name: 'Denver, US' },
      'America/Los_Angeles': { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, US' },
      'America/Phoenix': { lat: 33.4484, lon: -112.074, name: 'Phoenix, US' },
      'America/Anchorage': { lat: 61.2181, lon: -149.9003, name: 'Anchorage, US' },
      'Pacific/Honolulu': { lat: 21.3069, lon: -157.8583, name: 'Honolulu, US' },
      'America/Toronto': { lat: 43.6532, lon: -79.3832, name: 'Toronto, CA' },
      'America/Vancouver': { lat: 49.2827, lon: -123.1207, name: 'Vancouver, CA' },
      'Europe/London': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
      'Europe/Paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, FR' },
      'Europe/Berlin': { lat: 52.52, lon: 13.405, name: 'Berlin, DE' },
      'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, JP' },
      'Australia/Sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, AU' },
    };

    if (tz && map[tz]) {
      return { latitude: map[tz].lat, longitude: map[tz].lon, name: map[tz].name };
    }
  } catch {
    // ignore
  }
  // Default to US East / UTC baseline
  return { latitude: 40.7128, longitude: -74.006, name: 'New York, US' };
}

export async function searchCities(query: string): Promise<WeatherLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map((r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => {
      const parts = [r.name];
      if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
      if (r.country) parts.push(r.country);
      return {
        latitude: r.latitude,
        longitude: r.longitude,
        name: parts.join(', '),
        isAuto: false,
      };
    });
  } catch {
    return [];
  }
}
