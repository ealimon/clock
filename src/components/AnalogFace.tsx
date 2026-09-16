import React from 'react';
import { ClockSettings } from '../types';
import { formatDateString } from '../utils/timeFormat';

interface AnalogFaceProps {
  now: Date;
  settings: ClockSettings;
}

export const AnalogFace: React.FC<AnalogFaceProps> = ({ now, settings }) => {
  const dateInfo = formatDateString(now, settings.dateFormat);
  
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Angle calculations
  const secondFrac = settings.smoothSeconds
    ? (seconds * 1000 + milliseconds) / 60000
    : seconds / 60;
  const secondAngle = secondFrac * 360;

  const minuteFrac = (minutes * 60 + seconds) / 3600;
  const minuteAngle = minuteFrac * 360;

  const hourFrac = (hours * 60 + minutes) / 720;
  const hourAngle = hourFrac * 360;

  // Theme-specific color styles
  const isLight = settings.theme === 'light';
  const isAmber = settings.theme === 'amber';
  const isOled = settings.theme === 'oled';

  const dialBg = isLight
    ? 'rgba(255, 255, 255, 0.95)'
    : isOled
    ? '#000000'
    : isAmber
    ? '#1c150c'
    : '#12141a';

  const bezelBorder = isLight
    ? '#d1d5db'
    : isOled
    ? '#262626'
    : isAmber
    ? '#4a3318'
    : '#2d3342';

  const majorTickColor = isLight
    ? '#111827'
    : isAmber
    ? '#fbbf24'
    : '#f3f4f6';

  const minorTickColor = isLight
    ? '#9ca3af'
    : isAmber
    ? '#784e1b'
    : '#4b5563';

  const numberColor = isLight
    ? '#111827'
    : isAmber
    ? '#fef3c7'
    : '#f9fafb';

  const hourHandColor = isLight
    ? '#111827'
    : isAmber
    ? '#fbbf24'
    : '#ffffff';

  const minuteHandColor = isLight
    ? '#1f2937'
    : isAmber
    ? '#f59e0b'
    : '#e5e7eb';

  const secondHandColor = isLight
    ? '#dc2626' // Mondaine / Swiss railway red
    : isAmber
    ? '#ef4444'
    : '#f43f5e';

  // Tick marks generation (60 marks)
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0;
    const angle = (i * 6) * (Math.PI / 180);
    const outerR = 175;
    const innerR = isHour ? 155 : 167;
    const x1 = 200 + outerR * Math.sin(angle);
    const y1 = 200 - outerR * Math.cos(angle);
    const x2 = 200 + innerR * Math.sin(angle);
    const y2 = 200 - innerR * Math.cos(angle);

    return {
      index: i,
      isHour,
      x1,
      y1,
      x2,
      y2,
    };
  });

  // Hour numerals (1 through 12)
  const numerals = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = (num * 30) * (Math.PI / 180);
    const r = 132;
    const x = 200 + r * Math.sin(angle);
    const y = 200 - r * Math.cos(angle) + 7; // optical center correction
    return { num, x, y };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6 select-none">
      {/* Clock Face Container */}
      <div 
        id="analog-clock-container"
        className="relative flex items-center justify-center w-full aspect-square max-w-[min(76vh,540px)] transition-transform duration-300"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-2xl"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="faceGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={dialBg} stopOpacity="1" />
              <stop offset="95%" stopColor={dialBg} stopOpacity="1" />
              <stop offset="100%" stopColor={isLight ? '#e5e7eb' : '#0a0a0c'} stopOpacity="1" />
            </radialGradient>
            <filter id="handShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity={isLight ? "0.2" : "0.5"} />
            </filter>
          </defs>

          {/* Outer Bezel Ring */}
          <circle
            cx="200"
            cy="200"
            r="192"
            fill="url(#faceGradient)"
            stroke={bezelBorder}
            strokeWidth="5"
          />

          {/* Subtle Inner Track Ring */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke={minorTickColor}
            strokeWidth="0.8"
            opacity="0.3"
          />

          {/* Tick marks */}
          {ticks.map((t) => (
            <line
              key={t.index}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isHour ? majorTickColor : minorTickColor}
              strokeWidth={t.isHour ? 3.5 : 1.5}
              strokeLinecap="round"
            />
          ))}

          {/* Hour numerals */}
          {numerals.map(({ num, x, y }) => (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              fill={numberColor}
              fontSize="24"
              fontFamily="Space Grotesk, Plus Jakarta Sans, sans-serif"
              fontWeight="600"
              style={{ userSelect: 'none' }}
            >
              {num}
            </text>
          ))}

          {/* Integrated Date Complication Window (at 3 o'clock position) */}
          {settings.showDate && (
            <g transform="translate(258, 187)">
              {/* Bezel */}
              <rect
                x="0"
                y="0"
                width="64"
                height="26"
                rx="4"
                fill={isLight ? '#f3f4f6' : isAmber ? '#291d10' : '#1e222d'}
                stroke={bezelBorder}
                strokeWidth="1.5"
              />
              <text
                x="32"
                y="18"
                textAnchor="middle"
                fill={isAmber ? '#fbbf24' : isLight ? '#111827' : '#e2e8f0'}
                fontSize="12"
                fontWeight="700"
                fontFamily="DM Mono, monospace"
                letterSpacing="0.5"
              >
                {dateInfo.weekday.slice(0, 3).toUpperCase()} {dateInfo.dayNumber}
              </text>
            </g>
          )}

          {/* Hour Hand */}
          <g
            transform={`rotate(${hourAngle} 200 200)`}
            filter="url(#handShadow)"
          >
            <rect
              x="196"
              y="95"
              width="8"
              height="115"
              rx="4"
              fill={hourHandColor}
            />
            {/* Center counterweight */}
            <rect
              x="196.5"
              y="200"
              width="7"
              height="20"
              rx="3"
              fill={hourHandColor}
              opacity="0.8"
            />
          </g>

          {/* Minute Hand */}
          <g
            transform={`rotate(${minuteAngle} 200 200)`}
            filter="url(#handShadow)"
          >
            <rect
              x="197.5"
              y="55"
              width="5"
              height="155"
              rx="2.5"
              fill={minuteHandColor}
            />
            {/* Counterbalance tail */}
            <rect
              x="198"
              y="200"
              width="4"
              height="26"
              rx="2"
              fill={minuteHandColor}
              opacity="0.8"
            />
          </g>

          {/* Second Hand (if enabled) */}
          {settings.showSeconds && (
            <g
              transform={`rotate(${secondAngle} 200 200)`}
              filter="url(#handShadow)"
            >
              {/* Long thin sweep needle */}
              <line
                x1="200"
                y1="235"
                x2="200"
                y2="42"
                stroke={secondHandColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Distinctive classic second-hand red circle pip */}
              <circle
                cx="200"
                cy="62"
                r="5"
                fill={secondHandColor}
              />
              {/* Counter-weight dot */}
              <circle
                cx="200"
                cy="235"
                r="3"
                fill={secondHandColor}
              />
            </g>
          )}

          {/* Center Pin / Cap */}
          <circle
            cx="200"
            cy="200"
            r="7"
            fill={secondHandColor}
            stroke={hourHandColor}
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="200"
            r="2.5"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Prominent Large Date Below Clock */}
      {settings.showDate && (
        <div id="clock-date-banner" className="mt-8 text-center px-4">
          <div 
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1"
            style={{
              color: isLight ? '#111827' : isAmber ? '#fbbf24' : '#f8fafc',
              fontFamily: 'Space Grotesk, Plus Jakarta Sans, sans-serif',
            }}
          >
            {dateInfo.weekday}
          </div>
          <div 
            className="text-base sm:text-xl md:text-2xl font-medium tracking-wide opacity-80"
            style={{
              color: isLight ? '#4b5563' : isAmber ? '#d97706' : '#94a3b8',
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
