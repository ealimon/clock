/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings, WeatherData, WeatherLocation } from './types';
import { DigitalFace } from './components/DigitalFace';
import { AnalogFace } from './components/AnalogFace';
import { FlipFace } from './components/FlipFace';
import { DualFace } from './components/DualFace';
import { ClockToolbar } from './components/ClockToolbar';
import { WeatherWidget } from './components/WeatherWidget';
import { playTick, playChime } from './utils/audio';
import { fetchWeather, getDefaultCoordinatesForTimezone } from './utils/weather';

const STORAGE_KEY = 'large_clock_preferences_v1';
const WEATHER_CACHE_KEY = 'large_clock_weather_cache_v1';

const DEFAULT_SETTINGS: ClockSettings = {
  mode: 'digital',
  theme: 'dark',
  is24Hour: false,
  showSeconds: true,
  showDate: true,
  dateFormat: 'full',
  smoothSeconds: true,
  blinkColon: false,
  soundEnabled: false,
  chimeHourly: false,
  fontSizeScale: 1.0,
  showWeather: true,
  tempUnit: 'fahrenheit',
};

export default function App() {
  // Load saved settings or fallback to defaults
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Storage access disabled or corrupt
    }
    return DEFAULT_SETTINGS;
  });

  const [now, setNow] = useState<Date>(() => new Date());
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherData;
        // Keep cache valid for 30 minutes
        if (Date.now() - parsed.lastUpdated < 30 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  });
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const prevSecondRef = useRef<number>(now.getSeconds());
  const prevHourRef = useRef<number>(now.getHours());
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize settings with localStorage
  const updateSettings = useCallback((partial: Partial<ClockSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Weather fetcher function
  const loadWeather = useCallback(async (forcedLocation?: WeatherLocation | null) => {
    if (!settings.showWeather) return;

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const targetLocation = forcedLocation !== undefined ? forcedLocation : settings.customLocation;

      if (targetLocation && !targetLocation.isAuto) {
        // Use custom searched location
        const data = await fetchWeather(
          targetLocation.latitude,
          targetLocation.longitude,
          settings.tempUnit,
          targetLocation.name
        );
        setWeather(data);
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
      } else if (navigator.geolocation) {
        // Use browser geolocation
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const data = await fetchWeather(
                pos.coords.latitude,
                pos.coords.longitude,
                settings.tempUnit
              );
              setWeather(data);
              localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
              setWeatherLoading(false);
            } catch (err) {
              setWeatherError((err as Error).message);
              setWeatherLoading(false);
            }
          },
          async (geoErr) => {
            // Geolocation denied or timed out; fallback gracefully to timezone coords
            console.warn('Geolocation unavailable or denied:', geoErr.message);
            try {
              const tzCoord = getDefaultCoordinatesForTimezone();
              const data = await fetchWeather(
                tzCoord.latitude,
                tzCoord.longitude,
                settings.tempUnit,
                tzCoord.name
              );
              setWeather(data);
              localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
            } catch (fallbackErr) {
              setWeatherError((fallbackErr as Error).message);
            } finally {
              setWeatherLoading(false);
            }
          },
          { timeout: 8000, maximumAge: 60000 }
        );
        return; // Asynchronous callback handles setWeatherLoading(false)
      } else {
        // No geolocation available at all
        const tzCoord = getDefaultCoordinatesForTimezone();
        const data = await fetchWeather(
          tzCoord.latitude,
          tzCoord.longitude,
          settings.tempUnit,
          tzCoord.name
        );
        setWeather(data);
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      setWeatherError((err as Error).message);
    } finally {
      setWeatherLoading(false);
    }
  }, [settings.showWeather, settings.tempUnit, settings.customLocation]);

  // Initial and recurring weather load (every 20 minutes)
  useEffect(() => {
    if (settings.showWeather) {
      loadWeather();
      const interval = setInterval(() => {
        loadWeather();
      }, 20 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.showWeather, settings.tempUnit, settings.customLocation, loadWeather]);

  // Handle location selection
  const handleSelectLocation = useCallback((loc: WeatherLocation | null) => {
    if (loc === null) {
      // Return to auto GPS
      updateSettings({ customLocation: undefined });
      loadWeather(null);
    } else {
      updateSettings({ customLocation: loc });
      loadWeather(loc);
    }
  }, [updateSettings, loadWeather]);

  // Handle temperature unit toggle
  const handleToggleTempUnit = useCallback(() => {
    const nextUnit = settings.tempUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    updateSettings({ tempUnit: nextUnit });
  }, [settings.tempUnit, updateSettings]);

  // Time loop with requestAnimationFrame for smooth sweeping second hand or exact interval
  useEffect(() => {
    let animFrameId: number;

    const tick = () => {
      const currentDate = new Date();
      setNow(currentDate);

      const currentSec = currentDate.getSeconds();
      const currentMin = currentDate.getMinutes();
      const currentHour = currentDate.getHours();

      // Second changed
      if (currentSec !== prevSecondRef.current) {
        prevSecondRef.current = currentSec;

        // Tick audio
        if (settings.soundEnabled) {
          playTick(currentSec === 0);
        }

        // Hourly chime check
        if (settings.chimeHourly && currentMin === 0 && currentSec === 0 && currentHour !== prevHourRef.current) {
          prevHourRef.current = currentHour;
          playChime();
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [settings.soundEnabled, settings.chimeHourly]);

  // Handle controls auto-hide after inactivity
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      showControlsTemporarily();
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });

    // Initial timeout
    inactivityTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [showControlsTemporarily]);

  // Fullscreen state listener and toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen may be restricted in some iframes
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'm') {
        // Cycle mode
        const order: ClockSettings['mode'][] = ['digital', 'analog', 'flip', 'dual'];
        const nextIdx = (order.indexOf(settings.mode) + 1) % order.length;
        updateSettings({ mode: order[nextIdx] });
      } else if (key === 't') {
        // Cycle theme
        const themes: ClockSettings['theme'][] = ['dark', 'oled', 'light', 'amber', 'sage'];
        const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
        updateSettings({ theme: themes[nextIdx] });
      } else if (key === 's') {
        updateSettings({ showSeconds: !settings.showSeconds });
      } else if (e.key === '2') {
        updateSettings({ is24Hour: !settings.is24Hour });
      } else if (key === 'd') {
        updateSettings({ showDate: !settings.showDate });
      } else if (key === 'w') {
        updateSettings({ showWeather: !settings.showWeather });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.mode, settings.theme, settings.showSeconds, settings.is24Hour, settings.showDate, settings.showWeather, toggleFullscreen, updateSettings]);

  // Background style based on theme
  const getThemeBackgroundClass = () => {
    switch (settings.theme) {
      case 'oled':
        return 'bg-black text-white';
      case 'light':
        return 'bg-[#f8f9fa] text-gray-900';
      case 'amber':
        return 'bg-[#120b04] text-[#fbbf24]';
      case 'sage':
        return 'bg-[#091512] text-[#d1fae5]';
      case 'dark':
      default:
        return 'bg-[#0b0f17] text-white';
    }
  };

  // Weather slot component to inject into face components
  const weatherElement = settings.showWeather ? (
    <WeatherWidget
      weather={weather}
      loading={weatherLoading}
      error={weatherError}
      theme={settings.theme}
      tempUnit={settings.tempUnit}
      onRefresh={() => loadWeather()}
      onSelectLocation={handleSelectLocation}
      onToggleUnit={handleToggleTempUnit}
    />
  ) : null;

  return (
    <main
      id="clock-main-app"
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden transition-colors duration-500 font-sans ${getThemeBackgroundClass()}`}
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
      onClick={showControlsTemporarily}
    >
      {/* Subtle radial ambient gradient behind clock face */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-700"
        style={{
          background: settings.theme === 'light'
            ? 'radial-gradient(circle at center, rgba(229, 231, 235, 0.5) 0%, rgba(248, 249, 250, 1) 70%)'
            : settings.theme === 'amber'
            ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.08) 0%, rgba(18, 11, 4, 1) 70%)'
            : settings.theme === 'sage'
            ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.06) 0%, rgba(9, 21, 18, 1) 70%)'
            : settings.theme === 'oled'
            ? 'transparent'
            : 'radial-gradient(circle at center, rgba(30, 41, 59, 0.35) 0%, rgba(11, 15, 23, 1) 75%)',
        }}
      />

      {/* Main Clock Face Display Zone */}
      <section 
        id="clock-face-viewport"
        className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full"
      >
        {settings.mode === 'digital' && (
          <DigitalFace now={now} settings={settings} weatherSlot={weatherElement} />
        )}
        {settings.mode === 'analog' && (
          <AnalogFace now={now} settings={settings} weatherSlot={weatherElement} />
        )}
        {settings.mode === 'flip' && (
          <FlipFace now={now} settings={settings} weatherSlot={weatherElement} />
        )}
        {settings.mode === 'dual' && (
          <DualFace now={now} settings={settings} weatherSlot={weatherElement} />
        )}
      </section>

      {/* Unobtrusive Bottom Control Bar */}
      <ClockToolbar
        settings={settings}
        updateSettings={updateSettings}
        isVisible={controlsVisible}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </main>
  );
}
