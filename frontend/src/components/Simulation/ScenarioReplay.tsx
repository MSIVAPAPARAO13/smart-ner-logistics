import React from 'react';
import { Film, SkipForward, RotateCcw, Clock } from 'lucide-react';
import type { ScenarioState } from '../../types';

interface ScenarioReplayProps {
  scenarioState: ScenarioState | null;
  onStepForward: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const ScenarioReplay: React.FC<ScenarioReplayProps> = ({
  scenarioState,
  onStepForward,
  onReset,
  isLoading = false,
}) => {
  if (!scenarioState) return null;

  const currentStep = scenarioState.current_step;
  const stages = scenarioState.all_stages || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Film className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Deterministic Scenario Replay
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-bold">
          Step {currentStep + 1} / {stages.length}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-slate-200">{scenarioState.scenario_name}</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Stage: {scenarioState.current_stage?.stage} ({scenarioState.current_stage?.time})</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {scenarioState.current_stage?.description}
          </p>
        </div>

        {/* Step Scrubber Timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Timeline Progression</span>
            <span>{Math.round(((currentStep + 1) / stages.length) * 100)}%</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {stages.map((stg, idx) => (
              <div
                key={stg.step}
                className={`h-2 rounded transition-all ${
                  idx <= currentStep
                    ? idx === currentStep
                      ? 'bg-emerald-400 animate-pulse ring-1 ring-emerald-300'
                      : 'bg-emerald-600'
                    : 'bg-slate-800'
                }`}
                title={`${stg.time} - ${stg.stage}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onStepForward}
            disabled={isLoading || currentStep >= stages.length - 1}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              currentStep >= stages.length - 1
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>STEP FORWARD</span>
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET TIMELINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
