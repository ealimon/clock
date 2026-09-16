import React, { useState } from 'react';
import { WeatherData, ClockTheme, TemperatureUnit, WeatherLocation } from '../types';
import { getWeatherConditionInfo, searchCities } from '../utils/weather';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  MapPin,
  RefreshCw,
  Search,
  X,
  Navigation,
  Loader2
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  theme: ClockTheme;
  tempUnit: TemperatureUnit;
  onRefresh: () => void;
  onSelectLocation: (location: WeatherLocation | null) => void;
  onToggleUnit: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  loading,
  error,
  theme,
  tempUnit,
  onRefresh,
  onSelectLocation,
  onToggleUnit,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [searching, setSearching] = useState(false);

  const isLight = theme === 'light';
  const isAmber = theme === 'amber';
  const isOled = theme === 'oled';

  // Theme-specific styles
  const pillBg = isLight
    ? 'bg-black/5 hover:bg-black/10 text-gray-800 border-gray-200/80'
    : isOled
    ? 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border-neutral-800'
    : isAmber
    ? 'bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border-amber-900/40'
    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10';

  const accentColor = isLight
    ? 'text-blue-600'
    : isAmber
    ? 'text-amber-400'
    : 'text-sky-400';

  const modalBg = isLight
    ? 'bg-white text-gray-900 border-gray-200 shadow-2xl'
    : isAmber
    ? 'bg-[#181109] text-amber-100 border-[#3d2710] shadow-2xl'
    : 'bg-slate-900 text-slate-100 border-slate-800 shadow-2xl';

  const inputBg = isLight
    ? 'bg-gray-100 border-gray-300 text-gray-900'
    : isAmber
    ? 'bg-[#291c0d] border-amber-900/60 text-amber-100'
    : 'bg-slate-800 border-slate-700 text-white';

  const renderWeatherIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} />;
      case 'Moon':
        return <Moon className={className} />;
      case 'CloudSun':
        return <CloudSun className={className} />;
      case 'Cloud':
        return <Cloud className={className} />;
      case 'CloudFog':
        return <CloudFog className={className} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'CloudSnow':
        return <CloudSnow className={className} />;
      case 'CloudLightning':
        return <CloudLightning className={className} />;
      default:
        return <Sun className={className} />;
    }
  };

  const conditionInfo = weather ? getWeatherConditionInfo(weather.weatherCode) : null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  return (
    <>
      <div 
        id="clock-weather-widget"
        className="flex items-center justify-center gap-2 select-none transition-all duration-300"
      >
        {loading && !weather ? (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs backdrop-blur-sm ${pillBg}`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70" />
            <span className="opacity-80">Loading weather...</span>
          </div>
        ) : error && !weather ? (
          <button
            onClick={onRefresh}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs backdrop-blur-sm cursor-pointer ${pillBg}`}
            title="Click to retry"
          >
            <RefreshCw className="w-3.5 h-3.5 opacity-70" />
            <span className="opacity-80">Check weather</span>
          </button>
        ) : weather ? (
          <div 
            className={`group relative flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm backdrop-blur-sm shadow-sm transition-colors ${pillBg}`}
          >
            {/* Weather Icon & Condition */}
            <div className="flex items-center gap-1.5">
              {conditionInfo && renderWeatherIcon(conditionInfo.iconName, `w-4 h-4 sm:w-5 sm:h-5 ${accentColor}`)}
              <span className="font-semibold tracking-tight">
                {weather.temperature}°{tempUnit === 'fahrenheit' ? 'F' : 'C'}
              </span>
            </div>

            <span className="opacity-30">•</span>

            {/* Condition text */}
            <span className="font-medium opacity-90 hidden xs:inline-block">
              {weather.condition}
            </span>

            {/* High / Low */}
            <span className="text-[11px] sm:text-xs opacity-65 font-mono">
              H:{weather.tempMax}° L:{weather.tempMin}°
            </span>

            <span className="opacity-30">•</span>

            {/* Location button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 hover:underline cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
              title="Change weather location"
            >
              <MapPin className="w-3 h-3 opacity-70" />
              <span className="truncate max-w-[110px] sm:max-w-[150px] font-medium">
                {weather.locationName}
              </span>
            </button>

            {/* Quick unit switch */}
            <button
              onClick={onToggleUnit}
              className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded border border-current opacity-60 hover:opacity-100 cursor-pointer font-mono uppercase"
              title={`Switch to °${tempUnit === 'fahrenheit' ? 'C' : 'F'}`}
            >
              °{tempUnit === 'fahrenheit' ? 'C' : 'F'}
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              title="Refresh weather"
              aria-label="Refresh weather"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Location Search Modal */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className={`w-full max-w-md rounded-2xl p-5 border ${modalBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-500/20 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 opacity-70" />
                <h3 className="text-base font-semibold">Weather Location</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Use Device Location Button */}
            <button
              onClick={() => {
                onSelectLocation(null); // null triggers auto GPS
                setShowLocationModal(false);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold mb-4 transition-colors cursor-pointer ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-blue-950/40 border-blue-800 text-blue-300 hover:bg-blue-900/50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Current Device Location (GPS)</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-500/20" />
              </div>
              <span className="relative px-2 text-[11px] uppercase tracking-wider opacity-50 bg-inherit font-medium">
                Or search city
              </span>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter city (e.g. Chicago, London, Tokyo)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/40 ${inputBg}`}
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-3.5 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 cursor-pointer transition-colors"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowLocationModal(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isLight
                        ? 'border-gray-200 hover:bg-gray-100'
                        : isAmber
                        ? 'border-[#3d2710] hover:bg-[#2e1d0d]'
                        : 'border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-medium truncate mr-2">{loc.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
