import React from 'react';
import { Clock, TrendingUp, Navigation, AlertCircle } from 'lucide-react';
import type { SimulationStatus } from '../../types';

interface EtaComparisonCardProps {
  simulation: SimulationStatus | null;
}

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
};

export const EtaComparisonCard: React.FC<EtaComparisonCardProps> = ({ simulation }) => {
  const isAlternate = simulation?.route_type === 'ALTERNATE';
  const delay = simulation?.delay_min || 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            ETA & Travel Delay Intelligence
          </h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isAlternate
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : 'bg-blue-950 text-blue-400 border-blue-800'
          }`}
        >
          {isAlternate ? 'ALTERNATE ROUTE (NH-27)' : 'PRIMARY ROUTE (NH-6)'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Original ETA */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Baseline Travel Time</div>
          <div className="text-lg font-bold text-slate-200 mt-0.5 font-mono">
            {formatMinutes(simulation?.original_eta_min || 540)}
          </div>
          <div className="text-[10px] text-slate-500">NH-6 Standard Corridor</div>
        </div>

        {/* Current Revised ETA */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Current Estimated ETA</div>
          <div className="text-lg font-bold text-cyan-400 mt-0.5 font-mono">
            {formatMinutes(simulation?.current_eta_min || 540)}
          </div>
          <div className="text-[10px] text-slate-500">Live Geometry Recalculated</div>
        </div>
      </div>

      {/* Delay & Distance Banner */}
      <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/60">
        <div className="flex items-center space-x-1.5">
          <TrendingUp className={`w-4 h-4 ${delay > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="text-xs text-slate-300">Predicted Delay:</span>
          <b className={`text-xs font-mono font-bold ${delay > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {delay > 0 ? `+${delay} min` : '0 min (On Schedule)'}
          </b>
        </div>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <Navigation className="w-3.5 h-3.5 text-slate-400" />
          <span>Rem: <b>{simulation?.distance_remaining_km || 316.5} km</b></span>
        </div>
      </div>

      {isAlternate && (
        <div className="mt-2.5 bg-amber-950/40 border border-amber-800/60 rounded-md p-2 text-[11px] text-amber-300 flex items-start space-x-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <b>Reroute Active</b>: Heavy flash flood on NH-6 bypass avoided via NH-27/NH-54 Nagaon-Haflong corridor.
          </span>
        </div>
      )}
    </div>
  );
};
