import React from 'react';
import { GitBranch, AlertOctagon, ArrowDown, Truck, ShieldAlert, HeartPulse } from 'lucide-react';
import type { SupplyImpactGraph } from '../../types';

interface InventoryImpactPanelProps {
  impact: SupplyImpactGraph | null;
}

export const InventoryImpactPanel: React.FC<InventoryImpactPanelProps> = ({ impact }) => {
  if (!impact) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Corridor Disruption Impact Graph
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
          Cascading Risk
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Node 1: Disrupted Road */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-200">{impact.road_name}</div>
              <div className="text-[10px] text-rose-400">Status: {impact.corridor_status} (Inundation Hazard)</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Sector 17</span>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Node 2: Affected Convoys & Shipments */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
              <Truck className="w-3.5 h-3.5" />
              <span>Convoys Affected</span>
            </div>
            <div className="text-base font-bold text-slate-100 font-mono">{impact.total_vehicles_affected} Vehicles</div>
            <div className="text-[10px] text-slate-400">NER-MED-01, FOOD-02</div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-rose-900/40 space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-400 font-semibold text-[11px]">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Critical Lifeline</span>
            </div>
            <div className="text-base font-bold text-rose-400 font-mono">ICU Medicine</div>
            <div className="text-[10px] text-slate-400">Silchar Civil Hospital</div>
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Node 3: Resulting Stockout & Mitigation Protocol */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Recommended Bypass Solution:</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
              Active
            </span>
          </div>
          <div className="font-semibold text-slate-200 text-[11px]">{impact.mitigation_bypass}</div>
          <p className="text-[10px] text-slate-400">
            Diverts critical cargo via 4-lane mountain expressway, avoiding flooded gorge and keeping delivery within hospital safe threshold.
          </p>
        </div>
      </div>
    </div>
  );
};
