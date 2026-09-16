import React, { useState } from 'react';
import { ClockTheme, FinancialNewsItem, MarketIndexItem } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  X, 
  RefreshCw,
  Gauge
} from 'lucide-react';

interface FinancialTickerProps {
  indices: MarketIndexItem[];
  news: FinancialNewsItem[];
  theme: ClockTheme;
  speed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
  onClose: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const FinancialTicker: React.FC<FinancialTickerProps> = ({
  indices,
  news,
  theme,
  speed,
  onSpeedChange,
  onClose,
  onRefresh,
  loading = false,
}) => {
  const [isPausedManually, setIsPausedManually] = useState(false);

  const isLight = theme === 'light';
  const isAmber = theme === 'amber';
  const isOled = theme === 'oled';
  const isSage = theme === 'sage';

  // Theme-specific container background and borders
  const tickerBg = isLight
    ? 'bg-white/95 text-gray-900 border-gray-200 shadow-lg'
    : isOled
    ? 'bg-black text-neutral-200 border-neutral-800'
    : isAmber
    ? 'bg-[#181109] text-amber-200 border-[#3d2710]'
    : isSage
    ? 'bg-[#091512] text-emerald-100 border-emerald-900/40'
    : 'bg-[#0d131f]/95 text-slate-200 border-slate-800/80 shadow-xl';

  const badgeBg = isLight
    ? 'bg-blue-600 text-white'
    : isAmber
    ? 'bg-amber-500 text-black'
    : isSage
    ? 'bg-emerald-600 text-white'
    : 'bg-blue-500 text-white';

  const sourceBadgeBg = isLight
    ? 'bg-gray-100 text-gray-700 border-gray-200'
    : isAmber
    ? 'bg-[#2b1c0c] text-amber-300 border-amber-900/40'
    : isSage
    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50'
    : 'bg-slate-800 text-slate-300 border-slate-700/60';

  const indexItemBg = isLight
    ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-900 border-gray-200'
    : isAmber
    ? 'bg-[#221609] hover:bg-[#2e1d0d] text-amber-100 border-amber-950'
    : isSage
    ? 'bg-[#0e211c] hover:bg-[#153029] text-emerald-100 border-emerald-900/40'
    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-800';

  const speedClass = 
    speed === 'slow'
      ? 'ticker-track-slow'
      : speed === 'fast'
      ? 'ticker-track-fast'
      : 'ticker-track-normal';

  const nextSpeed = 
    speed === 'normal' ? 'fast' : speed === 'fast' ? 'slow' : 'normal';

  const renderTickerContent = (prefix: string) => (
    <div className="flex items-center gap-6 shrink-0 pr-6">
      {/* Live Market Indices First */}
      <div className="flex items-center gap-2">
        {indices.map((idx) => (
          <div
            key={`${prefix}-idx-${idx.symbol}`}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-mono select-none ${indexItemBg}`}
          >
            <span className="font-semibold">{idx.symbol}</span>
            <span className="opacity-75">{idx.price}</span>
            <span 
              className={`flex items-center text-[11px] font-bold ${
                idx.isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {idx.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {idx.change}
            </span>
          </div>
        ))}
      </div>

      <span className="opacity-25 select-none font-light text-sm">•</span>

      {/* Financial News Headlines */}
      <div className="flex items-center gap-6">
        {news.map((item) => (
          <div 
            key={`${prefix}-news-${item.id}`}
            className="flex items-center gap-2 text-xs select-none"
          >
            <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-semibold tracking-wider ${sourceBadgeBg}`}>
              {item.source}
            </span>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 hover:underline hover:text-blue-500 transition-colors font-medium whitespace-nowrap"
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              <span className="font-medium whitespace-nowrap">{item.title}</span>
            )}
            {item.time && (
              <span className="text-[10px] opacity-50 font-mono">
                {item.time}
              </span>
            )}
            <span className="opacity-25 select-none font-light ml-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      id="clock-financial-news-ticker"
      className={`fixed bottom-0 left-0 right-0 z-30 h-8 sm:h-9 border-t backdrop-blur-md flex items-center justify-between text-xs overflow-hidden transition-colors ${tickerBg}`}
    >
      {/* Left Pinned Badge */}
      <div className="shrink-0 z-10 flex items-center h-full pl-3 pr-3 border-r border-inherit bg-inherit shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${badgeBg}`}>
            MARKETS
          </span>
        </div>
      </div>

      {/* Center Scrolling News Track */}
      <div 
        className="ticker-container flex-1 overflow-hidden h-full flex items-center cursor-pointer relative"
        title="Hover to pause scrolling. Click headlines to read."
      >
        <div 
          className={`flex items-center ${speedClass}`}
          style={{ animationPlayState: isPausedManually ? 'paused' : undefined }}
        >
          {renderTickerContent('track-1')}
          {renderTickerContent('track-2')}
        </div>
      </div>

      {/* Right Pinned Utility Controls */}
      <div className="shrink-0 z-10 flex items-center gap-1 h-full px-2 border-l border-inherit bg-inherit">
        {/* Speed button */}
        <button
          onClick={() => onSpeedChange(nextSpeed)}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity text-[10px] font-mono cursor-pointer uppercase"
          title={`Ticker speed: ${speed} (click to change)`}
          aria-label="Change ticker speed"
        >
          <Gauge className="w-3 h-3" />
          <span className="hidden xs:inline">{speed}</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          title="Refresh financial news and quotes"
          aria-label="Refresh financial news"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          title="Hide financial ticker (press N to toggle)"
          aria-label="Hide financial ticker"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
