import React from 'react';
import { Truck, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import type { Vehicle, SimulationStatus } from '../../types';

interface VehicleStatusCardProps {
  vehicle: Vehicle | null;
  simulation: SimulationStatus | null;
}

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({ vehicle, simulation }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Logistics Vehicle
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
            PRIORITY: CRITICAL
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Vehicle Identifier</div>
            <div className="font-bold text-slate-200">{vehicle?.id || 'NER-TRK-01'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Registration No</div>
            <div className="font-mono font-bold text-slate-300">{vehicle?.vehicle_number || 'AS-01-GC-4482'}</div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Essential Cargo Manifest</div>
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency Medical Supplies (Life-Saving Drugs)</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
          <div className="flex items-start space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span><b>From:</b> Guwahati Integrated Logistics Hub</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span><b>To:</b> Silchar Civil Hospital & Regional Medical Store</span>
          </div>
        </div>
      </div>

      {/* Speed & Heading Stats */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-1">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Speed: <b className="text-white">{simulation?.vehicle_speed_kmh || 0} km/h</b></span>
        </div>
        <div>
          <span>Heading: <b className="text-white">{simulation?.vehicle_heading || 0}°</b></span>
        </div>
      </div>
    </div>
  );
};
