import React from 'react';
import { ClockSettings } from '../types';
import { formatTimeParts, formatDateString, getTimezoneDetails } from '../utils/timeFormat';

interface DigitalFaceProps {
  now: Date;
  settings: ClockSettings;
}

export const DigitalFace: React.FC<DigitalFaceProps> = ({ now, settings }) => {
  const time = formatTimeParts(now, settings.is24Hour);
  const dateInfo = formatDateString(now, settings.dateFormat);
  const tz = getTimezoneDetails();

  const isLight = settings.theme === 'light';
  const isAmber = settings.theme === 'amber';
  const isOled = settings.theme === 'oled';

  // Digit colors
  const timeColor = isLight
    ? 'text-gray-900'
    : isAmber
    ? 'text-amber-400'
    : 'text-white';

  const colonColor = isLight
    ? 'text-gray-400'
    : isAmber
    ? 'text-amber-600'
    : 'text-slate-500';

  const secondsColor = isLight
    ? 'text-gray-600'
    : isAmber
    ? 'text-amber-500'
    : 'text-slate-400';

  const dateHeadingColor = isLight
    ? 'text-gray-950'
    : isAmber
    ? 'text-amber-300'
    : 'text-white';

  const dateSubColor = isLight
    ? 'text-gray-600'
    : isAmber
    ? 'text-amber-500/80'
    : 'text-slate-400';

  const badgeBg = isLight
    ? 'bg-gray-200/70 text-gray-800 border-gray-300'
    : isOled
    ? 'bg-neutral-900 text-neutral-300 border-neutral-800'
    : isAmber
    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
    : 'bg-slate-800/80 text-slate-300 border-slate-700/60';

  const colonBlinkOpacity = settings.blinkColon && now.getSeconds() % 2 === 0 ? 'opacity-20' : 'opacity-100';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 select-none my-auto">
      {/* Top glanceable info bar (Timezone & Day Progress) */}
      <div className="flex items-center gap-3 text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 opacity-70">
        <span className="px-2.5 py-1 rounded-md border text-[11px] sm:text-xs font-mono tracking-widest ${badgeBg}">
          {tz.name} ({tz.offset})
        </span>
        <span className="hidden sm:inline-block">•</span>
        <span className="hidden sm:inline-block font-mono text-xs">
          Week {dateInfo.weekNumber} / Day {dateInfo.dayOfYear}
        </span>
      </div>

      {/* Primary Large Time Display */}
      <div 
        id="digital-clock-display"
        className="flex items-baseline justify-center tracking-tighter tabular-nums font-mono leading-none"
        style={{
          fontSize: `clamp(4.2rem, 16vw, ${13 * settings.fontSizeScale}rem)`,
        }}
      >
        {/* Hours */}
        <span className={`font-semibold ${timeColor}`}>
          {time.hours}
        </span>

        {/* Colon */}
        <span 
          className={`mx-1 sm:mx-2 transition-opacity duration-200 font-light ${colonColor} ${colonBlinkOpacity}`}
        >
          :
        </span>

        {/* Minutes */}
        <span className={`font-semibold ${timeColor}`}>
          {time.minutes}
        </span>

        {/* Seconds (optional) */}
        {settings.showSeconds && (
          <div className="flex flex-col justify-start ml-2 sm:ml-4 self-center">
            <span 
              className={`font-mono font-medium tracking-normal ${secondsColor}`}
              style={{
                fontSize: `clamp(1.75rem, 6vw, ${5 * settings.fontSizeScale}rem)`,
                lineHeight: '1',
              }}
            >
              {time.seconds}
            </span>
          </div>
        )}

        {/* 12-Hour AM/PM Pill */}
        {!settings.is24Hour && (
          <div className="ml-3 sm:ml-5 self-center">
            <span 
              className={`inline-block px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-lg md:text-xl font-bold font-sans uppercase tracking-widest ${badgeBg}`}
            >
              {time.period}
            </span>
          </div>
        )}
      </div>

      {/* Prominent Large Date Display */}
      {settings.showDate && (
        <div id="digital-clock-date" className="mt-8 sm:mt-12 text-center w-full max-w-3xl">
          {/* Day of Week */}
          <div 
            className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase ${dateHeadingColor}`}
            style={{
              fontFamily: 'Space Grotesk, Plus Jakarta Sans, sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            {dateInfo.weekday}
          </div>

          {/* Full Date String */}
          <div 
            className={`mt-2 text-lg sm:text-2xl md:text-3xl font-medium tracking-wide ${dateSubColor}`}
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {dateInfo.formattedDate}
          </div>

          {/* Clean minimal hairline divider & day progress indicator */}
          <div className="mt-6 sm:mt-8 w-48 sm:w-64 h-1 mx-auto rounded-full overflow-hidden bg-gray-500/20">
            <div 
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `${((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100}%`,
                backgroundColor: isAmber ? '#f59e0b' : isLight ? '#2563eb' : '#38bdf8',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
