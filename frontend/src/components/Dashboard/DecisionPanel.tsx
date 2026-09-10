import React from 'react';
import { Compass, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import type { DecisionItem } from '../../types';

interface DecisionPanelProps {
  decisions: DecisionItem[];
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ decisions }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Response Decisions
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          AI Action Protocol
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {decisions.map((dec) => {
          const isCritical = dec.priority === 'CRITICAL';
          const isHigh = dec.priority === 'HIGH';

          return (
            <div
              key={dec.id}
              className={`p-3 rounded-lg border space-y-1.5 ${
                isCritical
                  ? 'bg-slate-950/80 border-rose-900/60'
                  : isHigh
                  ? 'bg-slate-950/80 border-amber-900/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-1.5 font-bold text-slate-100">
                  {dec.status === 'EXECUTED' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCritical ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span>{dec.title}</span>
                </div>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isCritical
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : isHigh
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {dec.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{dec.rationale}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Target: <b className="text-slate-300">{dec.target_corridor}</b></span>
                <span>Vehicle: <b className="text-emerald-400">{dec.vehicle_id}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
