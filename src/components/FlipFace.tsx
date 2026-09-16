import React from 'react';
import { ClockSettings } from '../types';
import { formatTimeParts, formatDateString } from '../utils/timeFormat';

interface FlipFaceProps {
  now: Date;
  settings: ClockSettings;
}

interface FlipCardProps {
  value: string;
  label?: string;
  theme: string;
  scale?: number;
}

const FlipCard: React.FC<FlipCardProps> = ({ value, label, theme }) => {
  const isLight = theme === 'light';
  const isAmber = theme === 'amber';
  const isOled = theme === 'oled';

  const cardBg = isLight
    ? 'bg-gradient-to-b from-gray-100 to-gray-200 border-gray-300 shadow-md'
    : isOled
    ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-neutral-800'
    : isAmber
    ? 'bg-gradient-to-b from-[#2a1b0d] to-[#191007] border-[#4a3118]'
    : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/80 shadow-lg';

  const textColor = isLight
    ? 'text-gray-900'
    : isAmber
    ? 'text-amber-400'
    : 'text-white';

  const dividerColor = isLight ? 'border-gray-400/40' : 'border-black/70';

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl border px-3 sm:px-6 py-2 sm:py-4 ${cardBg}`}
        style={{ minWidth: 'clamp(3.8rem, 13vw, 9.5rem)' }}
      >
        {/* Top/Bottom Split Line */}
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 border-b ${dividerColor} z-10`} />
        
        {/* Side Notches */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/40 rounded-r-sm" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/40 rounded-l-sm" />

        {/* Digit */}
        <span 
          className={`font-mono font-bold tracking-tight select-none tabular-nums ${textColor}`}
          style={{
            fontSize: 'clamp(2.8rem, 11vw, 7.5rem)',
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
      </div>

      {label && (
        <span className="mt-2 text-[10px] sm:text-xs font-mono font-medium tracking-widest uppercase opacity-60">
          {label}
        </span>
      )}
    </div>
  );
};

export const FlipFace: React.FC<FlipFaceProps> = ({ now, settings }) => {
  const time = formatTimeParts(now, settings.is24Hour);
  const dateInfo = formatDateString(now, settings.dateFormat);

  const isLight = settings.theme === 'light';
  const isAmber = settings.theme === 'amber';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 select-none my-auto">
      {/* Flip Cards Container */}
      <div id="flip-clock-display" className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
        <FlipCard value={time.hours} label="HOURS" theme={settings.theme} />

        <div className="flex flex-col gap-2 py-4">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLight ? 'bg-gray-700' : isAmber ? 'bg-amber-500' : 'bg-white'}`} />
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLight ? 'bg-gray-700' : isAmber ? 'bg-amber-500' : 'bg-white'}`} />
        </div>

        <FlipCard value={time.minutes} label="MINUTES" theme={settings.theme} />

        {settings.showSeconds && (
          <>
            <div className="flex flex-col gap-2 py-4">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLight ? 'bg-gray-700' : isAmber ? 'bg-amber-500' : 'bg-white'}`} />
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isLight ? 'bg-gray-700' : isAmber ? 'bg-amber-500' : 'bg-white'}`} />
            </div>
            <FlipCard value={time.seconds} label="SECONDS" theme={settings.theme} />
          </>
        )}

        {!settings.is24Hour && (
          <div className="ml-1 sm:ml-2">
            <FlipCard value={time.period} label="AM/PM" theme={settings.theme} />
          </div>
        )}
      </div>

      {/* Prominent Large Date */}
      {settings.showDate && (
        <div id="flip-clock-date" className="mt-10 sm:mt-14 text-center">
          <div 
            className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase ${
              isLight ? 'text-gray-900' : isAmber ? 'text-amber-300' : 'text-white'
            }`}
            style={{
              fontFamily: 'Space Grotesk, Plus Jakarta Sans, sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            {dateInfo.weekday}
          </div>
          <div 
            className={`mt-2 text-lg sm:text-2xl md:text-3xl font-medium tracking-wide ${
              isLight ? 'text-gray-600' : isAmber ? 'text-amber-500/80' : 'text-slate-400'
            }`}
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {dateInfo.formattedDate}
          </div>
        </div>
      )}
    </div>
  );
};
