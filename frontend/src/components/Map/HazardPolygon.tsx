import React from 'react';
import { Polygon, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Hazard } from '../../types';

interface HazardPolygonProps {
  hazards: Hazard[];
}

const createHazardMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        background: #dc2626;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(220, 38, 38, 0.8);
        animation: pulse 1s infinite alternate;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19H4.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const HazardPolygon: React.FC<HazardPolygonProps> = ({ hazards }) => {
  const activeHazards = hazards.filter((h) => h.is_active);

  return (
    <>
      {activeHazards.map((hazard) => {
        const polyCoords = hazard.polygon_geojson[0] || [];
        const latLngs: [number, number][] = polyCoords.map(([lng, lat]) => [lat, lng]);

        if (latLngs.length < 3) return null;

        return (
          <React.Fragment key={hazard.id}>
            {/* Flood Polygon */}
            <Polygon
              positions={latLngs}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#dc2626',
                fillOpacity: 0.45,
                weight: 2.5,
                dashArray: '4, 4',
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1">
                  <div className="font-bold text-rose-600 flex items-center gap-1">
                    ⚠️ {hazard.hazard_type} DISRUPTION ZONE
                  </div>
                  <div className="font-medium text-slate-800">{hazard.location_name}</div>
                  <div className="text-slate-500 mt-1">Severity: <b>{hazard.severity}</b></div>
                  <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded mt-1">
                    {hazard.is_simulated ? 'Controlled Simulation Scenario' : 'Real-Time Alert'}
                  </div>
                </div>
              </Tooltip>
            </Polygon>

            {/* Central Warning Marker */}
            <Marker
              position={[hazard.center_lat, hazard.center_lng]}
              icon={createHazardMarkerIcon()}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-rose-700 flex items-center gap-1">
                    <span>⚠️</span> {hazard.hazard_type} DETECTED
                  </div>
                  <div className="font-medium mt-1">{hazard.location_name}</div>
                  <p className="mt-1 text-slate-600">{hazard.description}</p>
                  <div className="mt-2 text-[11px] space-y-0.5 border-t pt-1">
                    <div>Affected Roads: <b>{hazard.affected_road_ids?.join(', ') || 'NH-6'}</b></div>
                    <div>Affected Bridges: <b>{hazard.affected_bridge_ids?.join(', ') || 'Lubha Bridge'}</b></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};
