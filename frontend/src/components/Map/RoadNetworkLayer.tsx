import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { Road } from '../../types';

interface RoadNetworkLayerProps {
  roads: Road[];
}

export const RoadNetworkLayer: React.FC<RoadNetworkLayerProps> = ({ roads }) => {
  const getRoadColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#10b981'; // Emerald Green
      case 'WATCH':
        return '#f59e0b'; // Amber
      case 'RISK':
        return '#f97316'; // Orange
      case 'CRITICAL':
      case 'BLOCKED':
        return '#ef4444'; // Red
      default:
        return '#64748b';
    }
  };

  return (
    <>
      {roads.map((road) => {
        const positions: [number, number][] = (road.geometry_geojson || []).map(
          ([lng, lat]) => [lat, lng]
        );

        if (positions.length < 2) return null;

        const isBlocked = road.current_status === 'BLOCKED' || road.current_status === 'CRITICAL';

        return (
          <Polyline
            key={road.id}
            positions={positions}
            pathOptions={{
              color: getRoadColor(road.current_status),
              weight: isBlocked ? 6 : 4,
              opacity: 0.85,
              dashArray: isBlocked ? '8, 8' : undefined,
            }}
          >
            <Tooltip sticky>
              <div className="text-xs p-1">
                <div className="font-bold text-slate-900">{road.road_name}</div>
                <div className="text-slate-600">
                  {road.origin} ➔ {road.destination} ({road.distance_km} km)
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                      road.current_status === 'OPEN'
                        ? 'bg-emerald-600'
                        : road.current_status === 'BLOCKED'
                        ? 'bg-rose-600'
                        : 'bg-amber-600'
                    }`}
                  >
                    STATUS: {road.current_status}
                  </span>
                  <span className="text-slate-700">
                    Score: <b>{road.accessibility_score}/100</b>
                  </span>
                </div>
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
};
