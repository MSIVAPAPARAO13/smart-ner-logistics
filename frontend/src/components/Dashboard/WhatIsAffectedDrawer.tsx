import React, { useState, useEffect } from 'react';
import {
  X,
  AlertOctagon,
  Truck,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { fetchWhatIsAffected } from '../../api/client';

interface WhatIsAffectedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roadId?: string;
  bridgeId?: string;
  incidentId?: string;
  onApproveReroute?: () => void;
}

export const WhatIsAffectedDrawer: React.FC<WhatIsAffectedDrawerProps> = ({
  isOpen,
  onClose,
  roadId,
  bridgeId,
  incidentId,
  onApproveReroute,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsApproved(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchWhatIsAffected({ roadId, bridgeId, incidentId })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to calculate downstream impact');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, roadId, bridgeId, incidentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-full bg-[#0b1c30] text-slate-100 shadow-2xl flex flex-col border-l border-slate-700/80 overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-[#0f172a] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700 text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Operational Impact Analysis
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/60 text-red-300 border border-red-700">
                  WHAT IS AFFECTED?
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dynamic consequence propagation across routes, fleet, and lifeline healthcare inventories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Activity className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs font-mono">Computing downstream network propagation...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
              <p className="font-bold">Impact Engine Query Failed</p>
              <p className="mt-1 font-mono text-[11px]">{error}</p>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Incident Context Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    Target Corridor Disruption
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                    {data.incident.severity} SEVERITY
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {data.incident.target_corridor_names.join(', ') || 'NH-6 Corridor'}
                </div>
                <div className="text-[11px] text-red-300">
                  Cause: {data.incident.cause}
                </div>
              </div>

              {/* 4-Metric Operational Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>VEHICLES</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {data.affected_summary.vehicles_affected_count}
                  </div>
                  <div className="text-[10px] text-slate-400">In Disruption Path</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 font-bold">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>CRITICAL SHIPMENTS</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {data.affected_summary.critical_deliveries_count}
                  </div>
                  <div className="text-[10px] text-slate-400">Emergency Medicine</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>FACILITIES</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {data.affected_summary.hospitals_at_risk_count}
                  </div>
                  <div className="text-[10px] text-slate-400">Hospitals at Risk</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>MAX DELAY</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    +{data.affected_summary.max_delay_hours}h
                  </div>
                  <div className="text-[10px] text-slate-400">Without Bypass</div>
                </div>
              </div>

              {/* Hospital Lifeline Facilities at Risk */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Lifeline Healthcare Inventories &amp; Stockout Countdown
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Formula: Stock / Hourly Burn
                  </span>
                </div>

                <div className="space-y-2">
                  {data.facilities_at_risk.map((fac: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-sm">{fac.facility_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {fac.district_name} • Category: <span className="text-cyan-300">{fac.supply_category}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            fac.stockout_risk === 'CRITICAL'
                              ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}
                        >
                          {fac.stockout_risk} STOCKOUT RISK
                        </span>
                      </div>

                      {/* Stockout Window vs Arrival Comparison */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <div>
                          <div className="text-slate-500 text-[10px]">CURRENT STOCK WINDOW</div>
                          <div className="text-amber-400 font-bold mt-0.5">{fac.hours_until_stockout}h Remaining</div>
                          <div className="text-[9px] text-slate-500">Burn: {fac.hourly_consumption} units/h</div>
                        </div>

                        <div>
                          <div className="text-slate-500 text-[10px]">UNMITIGATED ARRIVAL</div>
                          <div className="text-red-400 font-bold mt-0.5">
                            {fac.disrupted_eta_hours}h ETA <span className="text-[10px] font-normal">(STOCKOUT)</span>
                          </div>
                          <div className="text-[9px] text-red-500">+{fac.delay_hours}h Delay on NH-6</div>
                        </div>

                        <div>
                          <div className="text-slate-500 text-[10px]">OPTIMIZED BYPASS ETA</div>
                          <div className="text-emerald-400 font-bold mt-0.5">{fac.rerouted_eta_hours}h ETA (SAFE)</div>
                          <div className="text-[9px] text-emerald-500">Stockout Prevented ✓</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation Card */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>RECOMMENDED MITIGATION ACTION</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Saves {data.recommended_action.eta_saving_hours} Hours
                  </span>
                </div>

                <div className="text-sm font-bold text-white">
                  {data.recommended_action.recommended_action_text}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {data.recommended_action.reason}
                </p>

                <div className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/80">
                  <strong>Expected Operational Outcome:</strong> {data.recommended_action.expected_outcome}
                </div>

                {!isApproved ? (
                  <button
                    onClick={() => {
                      setIsApproved(true);
                      if (onApproveReroute) onApproveReroute();
                    }}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <span>APPROVE DISPATCH REROUTING VIA {data.recommended_action.bypass_corridor}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-full mt-2 py-2.5 px-4 bg-emerald-900/80 border border-emerald-600 text-emerald-200 rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>REROUTING DISPATCH AUTHORIZED &amp; BROADCAST VIA WEBSOCKET</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
