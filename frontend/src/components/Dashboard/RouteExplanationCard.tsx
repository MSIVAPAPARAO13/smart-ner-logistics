import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import type { ContextRouteResponse, Road, SimulationStatus } from '../../types';

interface RouteExplanationCardProps {
  contextRoute?: ContextRouteResponse | null;
  cargoPriority: string;
  roads?: Road[];
  simulation?: SimulationStatus | null;
}

export const RouteExplanationCard: React.FC<RouteExplanationCardProps> = ({
  contextRoute,
  cargoPriority,
}) => {
  const candidates = contextRoute?.candidates || [];
  const recommended =
    contextRoute?.selected_route ||
    candidates.find((c) => c.is_recommended) ||
    candidates[0];
  const other = candidates.find((c) => !c.is_recommended);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Context-Aware Routing Rationale
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
          LightGBM Optimization
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Route Decision:</span>
          </div>
          <div className="font-semibold text-slate-200">
            {recommended?.route_name || 'NH-27 Safe Hill Bypass (Guwahati -> Nagaon -> Silchar)'}
          </div>
          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
            {recommended?.selection_summary ||
              contextRoute?.optimization_note ||
              `Selected for ${cargoPriority} priority transport due to optimal balance of travel time and low terrain risk.`}
          </p>
        </div>

        {/* Route Risk Comparison Matrix */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
            <div className="font-bold text-slate-300">NH-6 Direct Corridor</div>
            <div className="text-slate-500">Dist: 316 km</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ML Risk:</span>
              <b className="text-rose-400 font-mono">
                {other ? `${(other.disruption_risk_score * 100).toFixed(0)}%` : '85%'}
              </b>
            </div>
            <div className="text-[10px] text-rose-400/80">⚠️ High Inundation Risk</div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-emerald-900/40 space-y-1">
            <div className="font-bold text-emerald-300">NH-27 4-Lane Bypass</div>
            <div className="text-slate-500">Dist: 347 km (+31 km)</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ML Risk:</span>
              <b className="text-emerald-400 font-mono">
                {recommended ? `${(recommended.disruption_risk_score * 100).toFixed(0)}%` : '18%'}
              </b>
            </div>
            <div className="text-[10px] text-emerald-400">✓ Safe Hill Bypass</div>
          </div>
        </div>
      </div>
    </div>
  );
};
