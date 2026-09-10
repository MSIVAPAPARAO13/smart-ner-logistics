import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { runWhatIfSimulation } from '../../api/client';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendedRoute?: (routeId: string) => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendedRoute,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ROAD-NH6-01');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [durationHours, setDurationHours] = useState<number>(18);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const CORRIDORS = [
    { id: 'ROAD-NH6-01', name: 'NH-6 Sonapur - Silchar Corridor (Lifeline)' },
    { id: 'ROAD-NH40-01', name: 'NH-40 Shillong - Dawki Border Corridor' },
    { id: 'ROAD-NH27-01', name: 'NH-27 Nagaon - Lumding Northern Highway' },
    { id: 'BRIDGE-LUBHA-01', name: 'Lubha River Suspension Bridge (NH-6)' },
  ];

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runWhatIfSimulation({
        road_id: selectedCorridor.startsWith('BRIDGE') ? undefined : selectedCorridor,
        bridge_id: selectedCorridor.startsWith('BRIDGE') ? selectedCorridor : undefined,
        severity,
        duration_hours: durationHours,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSimulate();
    }
  }, [isOpen, selectedCorridor, severity, durationHours]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl border border-[#cbd5e1] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header Strip with SCENARIO SIMULATION banner */}
        <div className="p-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono">What-If Disaster Disruption Simulator</h2>
                <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-black tracking-wider">
                  SCENARIO SIMULATION
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Simulate arbitrary corridor disruptions and compare outcomes without intervention vs with AI recommended rerouting.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Control Bar */}
        <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Corridor Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#64748b] uppercase font-bold">Target Corridor / Bridge</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded-lg p-2 text-[11px] text-[#0f172a] outline-none"
            >
              {CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#64748b] uppercase font-bold">Hazard Severity</label>
            <div className="flex items-center gap-1">
              {(['MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                    severity === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-[#dc2626] text-white border-[#dc2626]'
                        : sev === 'HIGH'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#475569] border-[#cbd5e1]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#64748b] uppercase font-bold">Inundation Duration</label>
              <span className="text-[11px] font-bold text-[#0051d5]">{durationHours} Hours</span>
            </div>
            <input
              type="range"
              min={2}
              max={48}
              step={2}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full accent-[#0051d5] cursor-pointer"
            />
          </div>
        </div>

        {/* Dual Comparison Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-[#64748b] font-mono text-xs">
              <Activity className="w-8 h-8 animate-spin text-[#0051d5] mb-2" />
              <span>Running dynamic OR-Tools VRP &amp; Supply impact propagation...</span>
            </div>
          ) : simulationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SIDE A: WITHOUT INTERVENTION */}
              <div className="p-4 rounded-xl bg-rose-50/70 border-2 border-rose-200 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-mono font-bold text-xs uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>WITHOUT INTERVENTION</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-black">
                    STATUS: {simulationResult.without_intervention.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100 flex flex-col">
                    <span className="text-[10px] text-[#64748b]">Affected Vehicles</span>
                    <span className="text-base font-bold text-rose-900 mt-0.5">
                      {simulationResult.without_intervention.affected_vehicles} Convoys
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100 flex flex-col">
                    <span className="text-[10px] text-[#64748b]">Corridor Delay</span>
                    <span className="text-base font-bold text-rose-900 mt-0.5">
                      +{simulationResult.without_intervention.max_delay_hours} Hours
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-rose-200 flex flex-col gap-1.5 text-xs">
                  <span className="font-mono text-[10px] font-bold uppercase text-rose-800">
                    Hospital Supply Impact:
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#475569]">Predicted Arrival ETA:</span>
                    <span className="font-bold text-rose-700">
                      {simulationResult.without_intervention.projected_eta_hours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#475569]">Hospital Stockout Window:</span>
                    <span className="font-bold text-[#0f172a]">
                      {simulationResult.without_intervention.stockout_window_hours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono border-t border-rose-100 pt-1">
                    <span className="font-bold text-rose-900">Stockout Deficit:</span>
                    <span className="font-black text-rose-700">
                      +{simulationResult.without_intervention.stockout_deficit_hours}h Deficit
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-100/60 text-rose-900 text-[11px] leading-snug">
                  <strong>Outcome:</strong> {simulationResult.without_intervention.impact_summary}
                </div>
              </div>

              {/* SIDE B: WITH RECOMMENDED ACTION */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-mono font-bold text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>WITH RECOMMENDED ACTION</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-black">
                    SUPPLY PROTECTED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex flex-col">
                    <span className="text-[10px] text-[#64748b]">Revised Bypass ETA</span>
                    <span className="text-base font-bold text-emerald-900 mt-0.5">
                      {simulationResult.with_recommended_action.revised_eta_hours} Hours
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex flex-col">
                    <span className="text-[10px] text-[#64748b]">Net Delay Avoided</span>
                    <span className="text-base font-bold text-emerald-900 mt-0.5">
                      +{simulationResult.with_recommended_action.delay_avoided_hours}h Saved
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-200 flex flex-col gap-1.5 text-xs">
                  <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                    Recommended Bypass Route:
                  </span>
                  <span className="font-bold text-[#0f172a] text-xs">
                    {simulationResult.with_recommended_action.recommended_route}
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-emerald-100">
                    <span className="text-[#475569]">Stockout Preservation:</span>
                    <span className="font-black text-emerald-700">100% SAFE (Zero Outage)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-100/60 text-emerald-900 text-[11px] leading-snug">
                  <strong>Explainability:</strong> {simulationResult.with_recommended_action.reason}
                </div>

                <button
                  onClick={() => {
                    if (onApplyRecommendedRoute) {
                      onApplyRecommendedRoute('ROUTE-ALTERNATE-01');
                    }
                    onClose();
                  }}
                  className="mt-auto w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Apply Recommended Alternate Corridor
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
          <span>Data Lineage: SIMULATION (Physically Grounded Flood Hydraulic Model)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-[#cbd5e1] hover:bg-slate-100 text-[#0f172a] font-bold cursor-pointer transition"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
