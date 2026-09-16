export type ClockMode = 'digital' | 'analog' | 'dual' | 'flip';

export type ClockTheme = 'dark' | 'oled' | 'light' | 'amber' | 'sage';

export type DateFormat = 'full' | 'standard' | 'compact' | 'iso';

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
}
