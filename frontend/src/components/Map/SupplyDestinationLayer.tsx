import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createDestinationIcon = (type: 'HOSPITAL' | 'DEPOT' | 'RELIEF', status: string) => {
  const bgColor =
    status === 'CRITICAL'
      ? '#e11d48'
      : status === 'AT_RISK'
      ? '#f59e0b'
      : '#10b981';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${bgColor};
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${bgColor}80;
        border: 2px solid #ffffff;
      ">
        <span style="color: white; font-size: 13px; font-weight: bold;">
          ${type === 'HOSPITAL' ? '🏥' : type === 'RELIEF' ? '⛺' : '🏢'}
        </span>
      </div>
    `,
    className: 'custom-destination-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const DESTINATIONS = [
  {
    id: 'DEST-SILCHAR-HOSPITAL',
    name: 'Silchar Civil Hospital & Regional Store',
    district: 'Cachar',
    type: 'HOSPITAL' as const,
    coords: [24.8333, 92.7789] as [number, number],
    status: 'AT_RISK',
    supply: 'Emergency ICU Life-Saving Medicines',
  },
  {
    id: 'DEST-HAFLONG-RELIEF',
    name: 'Haflong Disaster Relief Distribution Centre',
    district: 'Dima Hasao',
    type: 'RELIEF' as const,
    coords: [25.1700, 93.0200] as [number, number],
    status: 'SAFE',
    supply: 'Monsoon Tarpaulins & Survival Kits',
  },
  {
    id: 'DEST-SILCHAR-FCI',
    name: 'Silchar Regional Food Grain Depot (FCI)',
    district: 'Cachar',
    type: 'DEPOT' as const,
    coords: [24.8450, 92.7950] as [number, number],
    status: 'SAFE',
    supply: 'Essential Rice & Pulses Buffer',
  },
];

export const SupplyDestinationLayer: React.FC = () => {
  return (
    <>
      {DESTINATIONS.map((dest) => (
        <Marker
          key={dest.id}
          position={dest.coords}
          icon={createDestinationIcon(dest.type, dest.status)}
        >
          <Popup className="custom-popup">
            <div className="text-xs p-1 space-y-1">
              <div className="font-bold text-slate-900">{dest.name}</div>
              <div className="text-[11px] text-slate-600">District: {dest.district}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Supply: {dest.supply}</div>
              <div className="text-[10px] font-mono text-slate-500">
                Health Status: <b>{dest.status}</b>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
