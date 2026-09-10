import React from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import type { WeatherObservation } from '../../types';

interface WeatherRiskLayerProps {
  weather: WeatherObservation[];
}

export const WeatherRiskLayer: React.FC<WeatherRiskLayerProps> = ({ weather }) => {
  return (
    <>
      {weather.map((obs, idx) => {
        const rain = obs.rain_mm ?? obs.precipitation_mm ?? 0.0;
        const isSevere = obs.warning_level === 'RED' || rain > 30.0;
        const isHigh = obs.warning_level === 'ORANGE' || rain > 15.0;
        const isWatch = obs.warning_level === 'YELLOW' || rain > 5.0;

        const color = isSevere ? '#dc2626' : isHigh ? '#ea580c' : isWatch ? '#f59e0b' : '#0284c7';

        let sourceLabel = 'Open-Meteo';
        if (obs.is_cached || obs.source_type === 'CACHE') {
          sourceLabel = 'Open-Meteo • Cached';
        } else if (obs.source === 'CLIMATOLOGY_FALLBACK' || obs.source_type === 'FALLBACK') {
          sourceLabel = 'Climatology Baseline';
        } else if (obs.source === 'SIMULATION') {
          sourceLabel = 'Simulation';
        }

        return (
          <Circle
            key={idx}
            center={[obs.latitude, obs.longitude]}
            radius={isSevere ? 22000 : isHigh ? 16000 : 10000}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSevere ? 0.35 : isHigh ? 0.22 : 0.12,
              weight: 1.5,
              dashArray: isSevere ? undefined : '4, 6',
            }}
          >
            <Tooltip sticky>
              <div className="text-xs p-1 min-w-[170px]">
                <div className="font-bold text-slate-900 flex items-center justify-between gap-2">
                  <span>{obs.location_name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                    {obs.warning_level || 'GREEN'}
                  </span>
                </div>
                <div className="text-slate-600 mt-0.5">Condition: <b>{obs.weather_condition}</b></div>
                <div className="text-slate-600">Rainfall: <b>{rain.toFixed(1)} mm/h</b> ({obs.precipitation_probability.toFixed(0)}% prob)</div>
                <div className="text-slate-600">Wind: <b>{obs.wind_speed_kmh?.toFixed(1) || 10} km/h</b></div>
                <div className="text-slate-600">Soil Moisture: <b>{obs.soil_moisture_m3_m3?.toFixed(2) || 0.35} m³/m³</b></div>
                <div className="text-[10px] text-blue-700 font-mono mt-1 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Source:</span>
                  <span className="font-bold">{sourceLabel}</span>
                </div>
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
};
