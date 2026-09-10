import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Bridge } from '../../types';

interface BridgeLayerProps {
  bridges: Bridge[];
}

const createBridgeIcon = (status: string) => {
  const isClosed = status === 'CLOSED';
  const color = isClosed ? '#ef4444' : '#3b82f6';
  
  return L.divIcon({
    className: 'custom-bridge-marker',
    html: `
      <div style="
        background: ${color};
        width: 22px;
        height: 22px;
        border-radius: 4px;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19V7l8-4 8 4v12M4 12h16M12 3v16"/>
        </svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export const BridgeLayer: React.FC<BridgeLayerProps> = ({ bridges }) => {
  return (
    <>
      {bridges.map((bridge) => (
        <Marker
          key={bridge.id}
          position={[bridge.latitude, bridge.longitude]}
          icon={createBridgeIcon(bridge.accessibility_status)}
        >
          <Tooltip>
            <span className="font-semibold">{bridge.name}</span> ({bridge.accessibility_status})
          </Tooltip>
          <Popup>
            <div className="p-1 text-xs">
              <div className="font-bold text-slate-900">{bridge.name}</div>
              <div className="text-slate-500">River: {bridge.river_name || 'N/A'}</div>
              <div className="mt-1 space-y-0.5">
                <div>Status: <b className={bridge.accessibility_status === 'OPEN' ? 'text-emerald-600' : 'text-rose-600'}>{bridge.accessibility_status}</b></div>
                <div>Water Level: <b>{bridge.water_level_m}m</b> (Danger: {bridge.danger_water_level_m}m)</div>
                <div>Load Limit: <b>{bridge.load_limit_tons} Tons</b></div>
                <div>Clearance: <b>{bridge.clearance_status}</b></div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
