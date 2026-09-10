import React from 'react';
import { Play, Pause, RotateCcw, CloudLightning, Zap, Gauge, Layers } from 'lucide-react';
import type { SimulationStatus } from '../../types';

interface SimulationControlsProps {
  simulation: SimulationStatus | null;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  onStart: () => void;
  onPause: () => void;
  onTriggerFlood: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulation,
  selectedPriority,
  onPriorityChange,
  onStart,
  onPause,
  onTriggerFlood,
  onReset,
  onSpeedChange,
}) => {
  const isRunning = simulation?.is_running || false;
  const isFloodTriggered = simulation?.scenario_stage === 'ALTERNATE_ROUTE_ACTIVE' || simulation?.scenario_stage === 'ROAD_BLOCKED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Simulation Engine
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Stage: <b className="text-emerald-400">{simulation?.scenario_stage || 'READY'}</b>
        </span>
      </div>

      {/* Cargo Priority Selector */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cargo Priority:</span>
        </div>
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:outline-none"
        >
          <option value="CRITICAL">CRITICAL (Emergency Medicine)</option>
          <option value="HIGH">HIGH (Food Grains / Relief)</option>
          <option value="MEDIUM">MEDIUM (Agricultural Produce)</option>
          <option value="NORMAL">NORMAL (Construction Materials)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {/* Play / Pause Toggle */}
        <button
          onClick={isRunning ? onPause : onStart}
          className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition cursor-pointer shadow-md ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>PAUSE SIMULATION</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>START DISPATCH</span>
            </>
          )}
        </button>

        {/* Trigger Flood CTA */}
        <button
          onClick={onTriggerFlood}
          disabled={isFloodTriggered}
          className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-bold text-xs transition cursor-pointer shadow-md ${
            isFloodTriggered
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white animate-pulse'
          }`}
        >
          <CloudLightning className="w-4 h-4" />
          <span>{isFloodTriggered ? 'FLOOD SCENARIO ACTIVE' : 'TRIGGER FLOOD (NH-6)'}</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>RESET CORRIDOR</span>
        </button>

        {/* Speed Controls */}
        <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speed:</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                  simulation?.speed_multiplier === speed
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
