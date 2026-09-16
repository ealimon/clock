export type ClockMode = 'digital' | 'analog' | 'dual' | 'flip';

export type ClockTheme = 'dark' | 'oled' | 'light' | 'amber' | 'sage';

export type DateFormat = 'full' | 'standard' | 'compact' | 'iso';

export type TemperatureUnit = 'fahrenheit' | 'celsius';

export interface WeatherLocation {
  latitude: number;
  longitude: number;
  name: string;
  isAuto: boolean;
}

export interface WeatherData {
  temperature: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
  unit: TemperatureUnit;
  lastUpdated: number;
}

export interface FinancialNewsItem {
  id: string;
  title: string;
  source: string;
  url?: string;
  time?: string;
  category?: 'markets' | 'economy' | 'companies' | 'crypto' | 'commodities';
}

export interface MarketIndexItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

export interface ClockSettings {
  mode: ClockMode;
  theme: ClockTheme;
  is24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  dateFormat: DateFormat;
  smoothSeconds: boolean;
  blinkColon: boolean;
  soundEnabled: boolean;
  chimeHourly: boolean;
  fontSizeScale: number; // 0.8 to 1.3
  showWeather: boolean;
  tempUnit: TemperatureUnit;
  customLocation?: WeatherLocation;
  showNewsTicker: boolean;
  newsSpeed: 'slow' | 'normal' | 'fast';
}
