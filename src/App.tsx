/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings } from './types';
import { DigitalFace } from './components/DigitalFace';
import { AnalogFace } from './components/AnalogFace';
import { FlipFace } from './components/FlipFace';
import { DualFace } from './components/DualFace';
import { ClockToolbar } from './components/ClockToolbar';
import { playTick, playChime } from './utils/audio';

const STORAGE_KEY = 'large_clock_preferences_v1';

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

      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        // Cycle mode
        const order: ClockSettings['mode'][] = ['digital', 'analog', 'flip', 'dual'];
        const nextIdx = (order.indexOf(settings.mode) + 1) % order.length;
        updateSettings({ mode: order[nextIdx] });
      } else if (e.key.toLowerCase() === 't') {
        // Cycle theme
        const themes: ClockSettings['theme'][] = ['dark', 'oled', 'light', 'amber', 'sage'];
        const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
        updateSettings({ theme: themes[nextIdx] });
      } else if (e.key.toLowerCase() === 's') {
        updateSettings({ showSeconds: !settings.showSeconds });
      } else if (e.key === '2') {
        updateSettings({ is24Hour: !settings.is24Hour });
      } else if (e.key.toLowerCase() === 'd') {
        updateSettings({ showDate: !settings.showDate });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.mode, settings.theme, settings.showSeconds, settings.is24Hour, settings.showDate, toggleFullscreen, updateSettings]);

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
          <DigitalFace now={now} settings={settings} />
        )}
        {settings.mode === 'analog' && (
          <AnalogFace now={now} settings={settings} />
        )}
        {settings.mode === 'flip' && (
          <FlipFace now={now} settings={settings} />
        )}
        {settings.mode === 'dual' && (
          <DualFace now={now} settings={settings} />
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
