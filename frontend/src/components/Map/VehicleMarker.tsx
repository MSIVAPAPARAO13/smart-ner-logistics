import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { SimulationStatus, Vehicle } from '../../types';

interface VehicleMarkerProps {
  simulation: SimulationStatus | null;
  vehicle: Vehicle | null;
}

const getVehicleColor = (vehicleId: string, isRerouted: boolean) => {
  if (vehicleId.includes('MED')) return isRerouted ? '#10b981' : '#e11d48';
  if (vehicleId.includes('FOOD')) return '#f59e0b';
  if (vehicleId.includes('RELIEF')) return '#06b6d4';
  if (vehicleId.includes('CON')) return '#8b5cf6';
  return isRerouted ? '#10b981' : '#3b82f6';
};

const createTruckIcon = (heading: number, vehicleId: string, isRerouted: boolean) => {
  const color = getVehicleColor(vehicleId, isRerouted);

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.25;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          transform: rotate(${heading}deg);
          transition: transform 0.3s ease;
          background: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({ simulation, vehicle }) => {
  if (!simulation) return null;

  const lat = simulation.vehicle_lat;
  const lng = simulation.vehicle_lng;
  const isRerouted = simulation.route_type === 'ALTERNATE';

  const otherFleet = (simulation.fleet_positions || []).filter(
    (f) => f.vehicle_id !== simulation.vehicle_id && f.vehicle_id !== 'NER-TRK-01'
  );

  return (
    <>
      {/* Primary Vehicle Marker (NER-MED-01) */}
      <Marker
        position={[lat, lng]}
        icon={createTruckIcon(simulation.vehicle_heading, simulation.vehicle_id, isRerouted)}
      >
        <Tooltip permanent direction="top" offset={[0, -18]}>
          <div className="font-bold text-[10px] text-slate-900 bg-white/95 px-1.5 py-0.5 rounded shadow border border-slate-300">
            {simulation.vehicle_id} • {simulation.vehicle_speed_kmh} km/h
          </div>
        </Tooltip>
        <Popup>
          <div className="p-1 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {vehicle?.vehicle_number || 'AS-01-GC-4482'} ({simulation.vehicle_id})
            </div>
            <div className="mt-1 space-y-0.5 text-slate-600 text-[11px]">
              <div>Cargo: <b className="text-emerald-700">{vehicle?.cargo_type.replace(/_/g, ' ')}</b></div>
              <div>Priority: <b className="text-rose-600 font-bold">{vehicle?.priority}</b></div>
              <div>Heading: <b>{simulation.vehicle_heading}°</b></div>
              <div>Active Route: <b className={isRerouted ? 'text-emerald-600' : 'text-blue-600'}>{simulation.route_type}</b></div>
              <div>Remaining Dist: <b>{simulation.distance_remaining_km} km</b></div>
              <div>Stage: <b>{simulation.scenario_stage}</b></div>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Additional Fleet Convoy Markers */}
      {otherFleet.map((f) => (
        <Marker
          key={f.vehicle_id}
          position={[f.lat, f.lng]}
          icon={createTruckIcon(simulation.vehicle_heading, f.vehicle_id, isRerouted)}
        >
          <Tooltip permanent direction="top" offset={[0, -16]}>
            <div className="font-bold text-[9px] text-slate-900 bg-white/90 px-1 py-0.5 rounded shadow">
              {f.vehicle_id}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};
