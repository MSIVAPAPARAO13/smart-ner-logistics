import React from 'react';
import { Package, Building2 } from 'lucide-react';
import type { SupplyManifest, DistrictInventory } from '../../types';

interface SupplyStatusCardProps {
  supplies: SupplyManifest[];
  inventory?: DistrictInventory[];
  inventories?: DistrictInventory[];
}

export const SupplyStatusCard: React.FC<SupplyStatusCardProps> = ({
  supplies,
  inventory,
  inventories,
}) => {
  const items = inventory || inventories || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Supply Chain & District Reserves
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Lifeline Continuity
        </span>
      </div>

      {/* District Hospital Inventories */}
      <div className="space-y-2 mb-3 text-xs">
        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Regional Hospital Reserves (Silchar Civil)</span>
        </div>
        {items.map((inv) => (
          <div key={inv.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{inv.supply_type.replace(/_/g, ' ')}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  inv.stock_status === 'LOW'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {inv.stock_status}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  inv.stock_status === 'LOW' ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (inv.current_stock_units / inv.critical_threshold_units) * 60)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Current: <b>{inv.current_stock_units} Units</b></span>
              <span>Incoming: <b className="text-emerald-400">+{inv.incoming_units} Units</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Priority Manifest */}
      <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Active Lifeline Manifest</span>
          <span className="text-[10px] font-bold text-rose-400">CRITICAL PRIORITY</span>
        </div>
        <div className="font-bold text-slate-200 mt-1">
          {supplies[0]?.name || 'Life-Saving Drugs & Vaccines'}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>Payload: <b>{supplies[0]?.quantity_units || 8.5} Tons</b></span>
          <span>Status: <b className="text-emerald-400 font-semibold">{supplies[0]?.status || 'IN_TRANSIT'}</b></span>
        </div>
      </div>
    </div>
  );
};
