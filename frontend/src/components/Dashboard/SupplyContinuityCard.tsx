import React from 'react';
import { Package, AlertCircle, Clock, Truck, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { DistrictAssessment } from '../../types';

interface SupplyContinuityCardProps {
  assessments: DistrictAssessment[];
}

export const SupplyContinuityCard: React.FC<SupplyContinuityCardProps> = ({ assessments }) => {
  const medAssessment = assessments.find((a) => a.supply_type === 'EMERGENCY_MEDICINE') || assessments[0];
  if (!medAssessment) return null;

  const { metrics } = medAssessment;
  const isCritical = metrics.status === 'CRITICAL';
  const isAtRisk = metrics.status === 'AT_RISK';
  const isWatch = metrics.status === 'WATCH';

  const getStatusBadge = () => {
    if (isCritical) {
      return (
        <span className="flex items-center gap-1 bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
          <AlertCircle className="w-3 h-3" />
          CRITICAL STOCKOUT RISK
        </span>
      );
    }
    if (isAtRisk) {
      return (
        <span className="flex items-center gap-1 bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3" />
          AT RISK
        </span>
      );
    }
    if (isWatch) {
      return (
        <span className="bg-yellow-950 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold">
          WATCH
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
        <ShieldCheck className="w-3 h-3" />
        SAFE
      </span>
    );
  };

  // Stock gauge calculation
  const stockPercentage = Math.min(100, Math.max(10, (metrics.current_stock / (metrics.critical_threshold * 1.5)) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Supply Continuity & Stockout Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          MDoNER Lifeline
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* District & Supply Target */}
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">District Destination:</span>
            <span className="font-bold text-slate-200">{medAssessment.district_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Lifeline Commodity:</span>
            <span className="font-semibold text-emerald-400">{medAssessment.supply_name}</span>
          </div>

          {/* Visual Stockout Gauge */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Hospital Stock Level:</span>
              <span className="font-mono font-bold text-slate-200">
                {metrics.current_stock} Units (~{metrics.hours_until_stockout}h reserve)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-rose-500 animate-pulse' : isAtRisk ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Incoming Shipment Status */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">{medAssessment.assigned_vehicle || 'NER-MED-01'}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>ETA: <b>{metrics.incoming_eta_hours}h</b></span>
              </div>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>
      </div>
    </div>
  );
};
