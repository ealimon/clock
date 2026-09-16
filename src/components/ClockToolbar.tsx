import React, { useState } from 'react';
import { 
  ClockSettings, 
  ClockMode, 
  ClockTheme, 
  DateFormat 
} from '../types';
import { 
  Clock, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Settings2, 
  X, 
  Check, 
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  CloudSun,
  Newspaper
} from 'lucide-react';

interface ClockToolbarProps {
  settings: ClockSettings;
  updateSettings: (partial: Partial<ClockSettings>) => void;
  isVisible: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const ClockToolbar: React.FC<ClockToolbarProps> = ({
  settings,
  updateSettings,
  isVisible,
  isFullscreen,
  toggleFullscreen,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isLight = settings.theme === 'light';
  const isAmber = settings.theme === 'amber';

  const barBg = isLight
    ? 'bg-white/85 text-gray-800 border-gray-200/90 shadow-lg backdrop-blur-md'
    : isAmber
    ? 'bg-[#1c1308]/90 text-amber-300 border-[#3d2710] shadow-2xl backdrop-blur-md'
    : 'bg-gray-900/85 text-slate-200 border-slate-800 shadow-2xl backdrop-blur-md';

  const buttonActiveBg = isLight
    ? 'bg-gray-900 text-white'
    : isAmber
    ? 'bg-amber-500 text-black font-semibold'
    : 'bg-white text-slate-900 font-semibold';

  const buttonInactiveBg = isLight
    ? 'hover:bg-gray-100 text-gray-700'
    : isAmber
    ? 'hover:bg-amber-950/60 text-amber-400/80'
    : 'hover:bg-slate-800 text-slate-300';

  const modes: { id: ClockMode; label: string }[] = [
    { id: 'digital', label: 'Digital' },
    { id: 'analog', label: 'Analog' },
    { id: 'flip', label: 'Flip' },
    { id: 'dual', label: 'Dual' },
  ];

  const themes: { id: ClockTheme; label: string; bgBadge: string }[] = [
    { id: 'dark', label: 'Studio', bgBadge: 'bg-slate-800' },
    { id: 'oled', label: 'OLED Black', bgBadge: 'bg-black border border-neutral-700' },
    { id: 'light', label: 'Paper Light', bgBadge: 'bg-neutral-100 border border-neutral-300' },
    { id: 'amber', label: 'Warm Amber', bgBadge: 'bg-amber-600' },
    { id: 'sage', label: 'Sage', bgBadge: 'bg-emerald-800' },
  ];

  const dateFormats: { id: DateFormat; label: string; example: string }[] = [
    { id: 'full', label: 'Full', example: 'Tuesday, September 15, 2026' },
    { id: 'standard', label: 'Standard', example: 'Sep 15, 2026' },
    { id: 'compact', label: 'Compact', example: '9/15/2026' },
    { id: 'iso', label: 'ISO', example: '2026-09-15' },
  ];

  return (
    <>
      {/* Floating Toolbar */}
      <nav
        id="clock-main-toolbar"
        aria-label="Clock Controls"
        className={`fixed ${
          settings.showNewsTicker ? 'bottom-11 sm:bottom-12' : 'bottom-5'
        } left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border ${barBg}`}>
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-black/10 dark:bg-white/5">
            {modes.map((m) => (
              <button
                key={m.id}
                id={`btn-mode-${m.id}`}
                onClick={() => updateSettings({ mode: m.id })}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  settings.mode === m.id ? buttonActiveBg : buttonInactiveBg
                }`}
                title={`Switch to ${m.label} face`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-current opacity-20 mx-0.5" />

          {/* 12h / 24h Toggle */}
          <button
            id="btn-toggle-hours"
            onClick={() => updateSettings({ is24Hour: !settings.is24Hour })}
            className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
              settings.is24Hour ? buttonActiveBg : buttonInactiveBg
            }`}
            title="Toggle 12/24 Hour format"
          >
            {settings.is24Hour ? '24H' : '12H'}
          </button>

          {/* Seconds Toggle */}
          <button
            id="btn-toggle-seconds"
            onClick={() => updateSettings({ showSeconds: !settings.showSeconds })}
            className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              settings.showSeconds ? buttonActiveBg : buttonInactiveBg
            }`}
            title="Toggle Seconds display"
          >
            :SS
          </button>

          {/* Weather Toggle */}
          <button
            id="btn-toggle-weather"
            onClick={() => updateSettings({ showWeather: !settings.showWeather })}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              settings.showWeather ? buttonActiveBg : buttonInactiveBg
            }`}
            title={settings.showWeather ? 'Hide weather' : 'Show weather'}
            aria-label={settings.showWeather ? 'Hide weather' : 'Show weather'}
          >
            <CloudSun className="w-3.5 h-3.5" />
          </button>

          {/* Financial News Ticker Toggle */}
          <button
            id="btn-toggle-news"
            onClick={() => updateSettings({ showNewsTicker: !settings.showNewsTicker })}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              settings.showNewsTicker ? buttonActiveBg : buttonInactiveBg
            }`}
            title={settings.showNewsTicker ? 'Hide financial news ticker (N)' : 'Show financial news ticker (N)'}
            aria-label={settings.showNewsTicker ? 'Hide financial news ticker' : 'Show financial news ticker'}
          >
            <Newspaper className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              settings.soundEnabled ? buttonActiveBg : buttonInactiveBg
            }`}
            title={settings.soundEnabled ? 'Mute tick sound' : 'Enable tick sound'}
            aria-label={settings.soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${buttonInactiveBg}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Open Detailed Settings */}
          <button
            id="btn-open-settings"
            onClick={() => setShowSettingsModal(true)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showSettingsModal ? buttonActiveBg : buttonInactiveBg
            }`}
            title="Preferences and appearance"
            aria-label="Open settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Preferences & Customization Modal */}
      {showSettingsModal && (
        <div 
          id="clock-settings-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            id="clock-settings-modal"
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isLight
                ? 'bg-white text-gray-900 border-gray-200'
                : isAmber
                ? 'bg-[#181109] text-amber-100 border-[#3d2710]'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-500/20 mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 opacity-70" />
                <h2 className="text-lg font-semibold tracking-tight">Clock Preferences</h2>
              </div>
              <button
                id="btn-close-settings-modal"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            <div className="space-y-5 text-sm max-h-[70vh] overflow-y-auto pr-1">
              {/* Theme Palette */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  Theme & Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      id={`theme-opt-${t.id}`}
                      onClick={() => updateSettings({ theme: t.id })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                        settings.theme === t.id
                          ? 'border-blue-500 ring-2 ring-blue-500/30 font-semibold'
                          : 'border-gray-500/20 hover:border-gray-500/40'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${t.bgBadge}`} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Format Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  Date Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dateFormats.map((df) => (
                    <button
                      key={df.id}
                      id={`date-format-opt-${df.id}`}
                      onClick={() => updateSettings({ dateFormat: df.id })}
                      className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                        settings.dateFormat === df.id
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-gray-500/20 hover:border-gray-500/40'
                      }`}
                    >
                      <span className="font-semibold text-xs">{df.label}</span>
                      <span className="text-[11px] opacity-60 font-mono truncate w-full">{df.example}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-gray-500/20">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Display Date</div>
                    <div className="text-xs opacity-60">Show day of week and date prominently</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-show-date"
                    checked={settings.showDate}
                    onChange={(e) => updateSettings({ showDate: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Display Weather</div>
                    <div className="text-xs opacity-60">Show temperature and conditions in your area</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-show-weather"
                    checked={settings.showWeather}
                    onChange={(e) => updateSettings({ showWeather: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                {/* Temperature Unit */}
                {settings.showWeather && (
                  <div className="flex items-center justify-between pl-3 border-l-2 border-blue-500/40">
                    <div>
                      <div className="font-medium text-xs">Temperature Unit</div>
                      <div className="text-[11px] opacity-60">Fahrenheit (°F) or Celsius (°C)</div>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/10 dark:bg-white/10">
                      <button
                        type="button"
                        onClick={() => updateSettings({ tempUnit: 'fahrenheit' })}
                        className={`px-2 py-1 rounded text-xs font-mono font-medium cursor-pointer ${
                          settings.tempUnit === 'fahrenheit' ? buttonActiveBg : buttonInactiveBg
                        }`}
                      >
                        °F
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettings({ tempUnit: 'celsius' })}
                        className={`px-2 py-1 rounded text-xs font-mono font-medium cursor-pointer ${
                          settings.tempUnit === 'celsius' ? buttonActiveBg : buttonInactiveBg
                        }`}
                      >
                        °C
                      </button>
                    </div>
                  </div>
                )}

                {/* Financial News Ticker */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Financial News Ticker</div>
                    <div className="text-xs opacity-60">Live scrolling financial headlines & market indices (N)</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-show-news"
                    checked={settings.showNewsTicker}
                    onChange={(e) => updateSettings({ showNewsTicker: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                {/* Ticker Speed */}
                {settings.showNewsTicker && (
                  <div className="flex items-center justify-between pl-3 border-l-2 border-blue-500/40">
                    <div>
                      <div className="font-medium text-xs">Ticker Scroll Speed</div>
                      <div className="text-[11px] opacity-60">Slow, Normal, or Fast</div>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/10 dark:bg-white/10">
                      {(['slow', 'normal', 'fast'] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => updateSettings({ newsSpeed: spd })}
                          className={`px-2 py-1 rounded text-xs font-mono capitalize cursor-pointer ${
                            settings.newsSpeed === spd ? buttonActiveBg : buttonInactiveBg
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Hourly Chime</div>
                    <div className="text-xs opacity-60">Subtle harmonic tone on the hour</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-hourly-chime"
                    checked={settings.chimeHourly}
                    onChange={(e) => updateSettings({ chimeHourly: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Blinking Digital Colon</div>
                    <div className="text-xs opacity-60">Pulse separator every second</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-blink-colon"
                    checked={settings.blinkColon}
                    onChange={(e) => updateSettings({ blinkColon: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Smooth Sweeping Second Hand</div>
                    <div className="text-xs opacity-60">Analog hand glides continuously</div>
                  </div>
                  <input
                    type="checkbox"
                    id="checkbox-smooth-seconds"
                    checked={settings.smoothSeconds}
                    onChange={(e) => updateSettings({ smoothSeconds: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Size Slider */}
              <div className="pt-2 border-t border-gray-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Numeral Scale
                  </span>
                  <span className="font-mono text-xs opacity-75">
                    {Math.round(settings.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  id="range-font-scale"
                  min="0.8"
                  max="1.25"
                  step="0.05"
                  value={settings.fontSizeScale}
                  onChange={(e) => updateSettings({ fontSizeScale: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-500/20 flex justify-end">
              <button
                id="btn-done-settings"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
