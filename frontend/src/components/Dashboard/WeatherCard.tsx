import React from 'react';
import { CloudRain, AlertTriangle } from 'lucide-react';
import type { WeatherObservation } from '../../types';

interface WeatherCardProps {
  weather: WeatherObservation | null;
  onRefresh?: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-center text-xs text-[#64748b]">
        <span>Loading corridor meteorology...</span>
      </div>
    );
  }

  // Format source badge text and styling
  let badgeText = 'Open-Meteo';
  let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (weather.is_cached || weather.source_type === 'CACHE') {
    badgeText = 'Open-Meteo • Cached';
    badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
  } else if (weather.source === 'CLIMATOLOGY_FALLBACK' || weather.source_type === 'FALLBACK') {
    badgeText = 'Climatology Fallback';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (weather.source === 'SIMULATION') {
    badgeText = 'Simulation';
    badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (weather.source === 'IMD_GOVERNMENT') {
    badgeText = 'IMD • Government';
    badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  }

  // Warning level styling
  const warningColors = {
    GREEN: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    YELLOW: 'bg-amber-100 text-amber-800 border-amber-300',
    ORANGE: 'bg-orange-100 text-orange-800 border-orange-300',
    RED: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
  };

  const warningClass = warningColors[weather.warning_level] || warningColors.GREEN;

  const rain = weather.rain_mm ?? weather.precipitation_mm ?? 0.0;
  const temp = weather.temperature_c ?? 26.0;
  const precipProb = weather.precipitation_probability ?? 0.0;
  const wind = weather.wind_speed_kmh ?? 10.0;
  const humidity = weather.humidity_percent ?? 65.0;

  return (
    <div className="p-3 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs flex flex-col gap-2.5">
      {/* Header with Title & Lineage Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">
            Corridor Meteorology
          </span>
          <span className="text-[13px] font-bold text-[#0f172a] truncate">
            {weather.location_name || 'Guwahati Corridor'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${badgeBg}`}>
            {badgeText}
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${warningClass}`}>
            {weather.warning_level}
          </span>
        </div>
      </div>

      {/* Main Temperature & Weather Condition */}
      <div className="flex items-center justify-between bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <CloudRain className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#0f172a]">
              {weather.weather_condition}
            </span>
            <span className="text-[10px] text-[#64748b]">
              Humidity: <b>{humidity.toFixed(0)}%</b>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[18px] font-bold font-mono text-[#0f172a]">
            {temp.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <div className="p-2 rounded bg-[#f8fafc] border border-[#e2e8f0] flex flex-col">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Rainfall</span>
          <span className={`font-mono font-bold text-[12px] ${rain > 20 ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
            {rain.toFixed(1)} mm
          </span>
        </div>

        <div className="p-2 rounded bg-[#f8fafc] border border-[#e2e8f0] flex flex-col">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Rain Prob</span>
          <span className="font-mono font-bold text-[12px] text-[#0f172a]">
            {precipProb.toFixed(0)}%
          </span>
        </div>

        <div className="p-2 rounded bg-[#f8fafc] border border-[#e2e8f0] flex flex-col">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Wind</span>
          <span className="font-mono font-bold text-[12px] text-[#0f172a]">
            {wind.toFixed(1)} km/h
          </span>
        </div>
      </div>

      {/* Risk Alert Indicator if Heavy Rain */}
      {weather.risk_inputs && (weather.risk_inputs.heavy_rain || weather.risk_inputs.extreme_rain) && (
        <div className="p-2 rounded bg-rose-50 border border-rose-200 flex items-start gap-1.5 text-[10px] text-rose-900">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>
            <b>High Precipitation Risk:</b> Infiltration &amp; slope runoff elevated. Automated rerouting monitoring active.
          </span>
        </div>
      )}

      {/* Timestamp footer */}
      <div className="flex items-center justify-between text-[9px] font-mono text-[#94a3b8] pt-0.5 border-t border-[#f1f5f9]">
        <span>Northeast Logistics Theater</span>
        <span>Updated just now</span>
      </div>
    </div>
  );
};
