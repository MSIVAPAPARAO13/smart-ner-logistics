import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { FieldReport } from '../../types';

interface FieldReportLayerProps {
  reports: FieldReport[];
}

const createReportIcon = (severity: string) => {
  const color = severity === 'CRITICAL' || severity === 'HIGH' ? '#e11d48' : '#d97706';
  return L.divIcon({
    className: 'custom-report-pin',
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const FieldReportLayer: React.FC<FieldReportLayerProps> = ({ reports }) => {
  return (
    <>
      {reports.map((rep) => (
        <Marker
          key={rep.id}
          position={[rep.latitude, rep.longitude]}
          icon={createReportIcon(rep.severity)}
        >
          <Tooltip>
            <span><b>{rep.incident_type}</b> ({rep.location_name})</span>
          </Tooltip>
          <Popup>
            <div className="p-1 text-xs max-w-[220px]">
              <div className="font-bold text-slate-100 flex items-center justify-between">
                <span>{rep.incident_type}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  {rep.severity}
                </span>
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">{rep.location_name} • {rep.district}</div>

              {rep.photo_url && (
                <div className="mt-2 rounded overflow-hidden border border-slate-700 max-h-32">
                  <img src={rep.photo_url} alt="Field Observation" className="w-full object-cover" />
                </div>
              )}

              <p className="mt-2 text-slate-300 text-[11px] leading-tight">{rep.description}</p>
              <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-500">
                Reported by {rep.officer_name} ({rep.department})
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
