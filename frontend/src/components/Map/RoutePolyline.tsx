import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import type { RouteData, SimulationStatus, StrategyResult } from '../../types';

interface RoutePolylineProps {
  routes: RouteData[];
  simulation: SimulationStatus | null;
  previewRoute?: StrategyResult | null;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({ routes, simulation, previewRoute }) => {
  const isAlternateActive = simulation?.route_type === 'ALTERNATE';

  const previewPositions: [number, number][] = (previewRoute?.polyline_geojson || []).map(
    ([lng, lat]) => [lat, lng]
  );

  return (
    <>
      {/* If an AI Strategy Route is being previewed, render it prominently */}
      {previewPositions.length >= 2 && previewRoute && (
        <>
          <Polyline
            positions={previewPositions}
            pathOptions={{
              color: previewRoute.color_code || '#a855f7',
              weight: 10,
              opacity: 0.45,
            }}
          />
          <Polyline
            positions={previewPositions}
            pathOptions={{
              color: previewRoute.color_code || '#a855f7',
              weight: 5,
              opacity: 0.95,
              dashArray: previewRoute.mode === 'MODE_C_NEURAL' ? '8, 8' : undefined,
            }}
          >
            <Tooltip sticky permanent={false}>
              <div className="text-xs p-1.5 font-sans">
                <div className="font-bold text-purple-700">{previewRoute.mode_name}</div>
                <div className="text-slate-700 font-semibold">{previewRoute.route_name}</div>
                <div className="grid grid-cols-2 gap-x-2 mt-1 text-[11px] text-slate-600">
                  <div>Time: <b>{previewRoute.predicted_travel_time_min} min</b></div>
                  <div>Dist: <b>{previewRoute.distance_km} km</b></div>
                  <div>Risk: <b>{(previewRoute.disruption_risk_score * 100).toFixed(0)}%</b></div>
                  <div>Gain: <b>+{previewRoute.elevation_gain_m}m</b></div>
                </div>
                <div className="text-[10px] text-purple-600 font-bold mt-1">
                  ● ACTIVE STRATEGY PREVIEW
                </div>
              </div>
            </Tooltip>
          </Polyline>
        </>
      )}

      {routes.map((route) => {
        const positions: [number, number][] = (route.polyline_geojson || []).map(
          ([lng, lat]) => [lat, lng]
        );

        if (positions.length < 2) return null;

        const isPrimary = route.route_type === 'PRIMARY';
        const isCurrentActiveRoute = isPrimary ? !isAlternateActive : isAlternateActive;

        let strokeColor = '#3b82f6';
        if (isPrimary && isAlternateActive) {
          strokeColor = '#94a3b8';
        } else if (!isPrimary && isAlternateActive) {
          strokeColor = '#10b981';
        } else if (!isPrimary && !isAlternateActive) {
          strokeColor = '#64748b';
        }

        return (
          <React.Fragment key={route.id}>
            {/* Outer Glow / Casing */}
            {isCurrentActiveRoute && !previewRoute && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: isPrimary ? '#60a5fa' : '#34d399',
                  weight: 8,
                  opacity: 0.35,
                }}
              />
            )}

            {/* Main Polyline */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: strokeColor,
                weight: isCurrentActiveRoute ? 5 : 3,
                opacity: previewRoute ? 0.25 : isCurrentActiveRoute ? 0.95 : 0.4,
                dashArray: !isCurrentActiveRoute ? '6, 6' : undefined,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1">
                  <div className="font-bold">{route.route_name}</div>
                  <div>Distance: {route.distance_km} km</div>
                  <div>Est. Time: {route.estimated_duration_min} mins</div>
                  <div>Engine: <span className="font-mono text-emerald-600">{route.source_engine}</span></div>
                  {isCurrentActiveRoute && (
                    <div className="text-emerald-600 font-bold mt-0.5">● CURRENT ACTIVE ROUTE</div>
                  )}
                </div>
              </Tooltip>
            </Polyline>

            {/* Waypoint Endpoint Markers */}
            {isCurrentActiveRoute && (
              <>
                <CircleMarker
                  center={positions[0]}
                  radius={6}
                  pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                >
                  <Tooltip permanent direction="bottom" offset={[0, 8]}>
                    <span className="font-bold text-[10px]">ORIGIN: Guwahati</span>
                  </Tooltip>
                </CircleMarker>
                <CircleMarker
                  center={positions[positions.length - 1]}
                  radius={6}
                  pathOptions={{ color: '#ffffff', fillColor: '#10b981', fillOpacity: 1, weight: 2 }}
                >
                  <Tooltip permanent direction="top" offset={[0, -8]}>
                    <span className="font-bold text-[10px]">DESTINATION: Silchar</span>
                  </Tooltip>
                </CircleMarker>
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
