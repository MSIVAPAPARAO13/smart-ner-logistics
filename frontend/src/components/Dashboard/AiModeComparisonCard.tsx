import React, { useState, useEffect } from 'react';
import type { StrategyComparisonResponse, StrategyResult } from '../../types';
import { fetchStrategyComparison } from '../../api/client';
import { 
  Zap, 
  Brain, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Award
} from 'lucide-react';

interface AiModeComparisonCardProps {
  onSelectRoute?: (route: StrategyResult | null) => void;
  selectedMode?: string | null;
}

export const AiModeComparisonCard: React.FC<AiModeComparisonCardProps> = ({
  onSelectRoute,
}) => {
  const [data, setData] = useState<StrategyComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<string>('MEDICINE');
  const [selectedPriority, setSelectedPriority] = useState<string>('CRITICAL');
  const [activeTabMode, setActiveTabMode] = useState<string>('MODE_D_HYBRID');

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStrategyComparison({
        origin: 'Guwahati, Assam',
        destination: 'Silchar, Assam',
        cargo_type: selectedCargo,
        priority: selectedPriority,
      });
      setData(res);
      if (res.selected_strategy) {
        setActiveTabMode(res.selected_strategy);
        if (onSelectRoute && res.strategies[res.selected_strategy]) {
          onSelectRoute(res.strategies[res.selected_strategy]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate strategy comparisons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [selectedCargo, selectedPriority]);

  const handleSelectMode = (modeKey: string, strategy: StrategyResult) => {
    setActiveTabMode(modeKey);
    if (onSelectRoute) {
      onSelectRoute(strategy);
    }
  };

  const getModeBadge = (modeKey: string) => {
    switch (modeKey) {
      case 'MODE_A_BASELINE':
        return { label: 'Mode A: Baseline', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', color: '#3b82f6' };
      case 'MODE_B_CONTEXT':
        return { label: 'Mode B: Context-Aware', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', color: '#f59e0b' };
      case 'MODE_C_NEURAL':
        return { label: 'Mode C: Neural RRNCO', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', color: '#a855f7' };
      case 'MODE_D_HYBRID':
        return { label: 'Mode D: Hybrid Optimal', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', color: '#10b981' };
      default:
        return { label: modeKey, bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', color: '#64748b' };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-5 text-slate-100">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            <h2 className="text-lg font-bold tracking-wide text-white">
              Deep Learning AI Routing Benchmarks (RRNCO vs Heuristic)
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Phase 4 DL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation of OSRM baseline vs LightGBM context vs Graph Neural Candidate vs Hybrid OR-Tools Engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cargo Select */}
          <select
            value={selectedCargo}
            onChange={(e) => setSelectedCargo(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="MEDICINE">📦 Medicine (Fragile)</option>
            <option value="ESSENTIAL_FOOD">🌾 Essential Food</option>
            <option value="PETROLEUM">⛽ Petroleum Fuel</option>
            <option value="HEAVY_EQUIPMENT">🚜 Heavy Equipment</option>
          </select>

          {/* Priority Select */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="CRITICAL">🚨 Critical</option>
            <option value="HIGH">⚡ High</option>
            <option value="NORMAL">📋 Normal</option>
          </select>

          <button
            onClick={loadComparison}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
            title="Recalculate AI benchmarks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading or Error State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">
            Propagating edge embeddings through Asymmetric Graph Neural Network...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* Delta Performance Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Time Saved (vs Baseline)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {data.delta_analysis.time_saved_vs_baseline_min > 0
                    ? `${data.delta_analysis.time_saved_vs_baseline_min} min faster`
                    : '0 min (baseline)'}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Disruption Risk Cut</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">
                  {data.delta_analysis.risk_reduction_pct}% reduction
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Neural Confidence</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-purple-400">
                  {(data.delta_analysis.neural_confidence * 100).toFixed(1)}% Logits
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Selected Mode</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  {data.selected_strategy.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(data.strategies).map(([modeKey, strat]) => {
              const badge = getModeBadge(modeKey);
              const isSelected = activeTabMode === modeKey;
              const isRecommended = data.selected_strategy === modeKey;

              return (
                <div
                  key={modeKey}
                  onClick={() => handleSelectMode(modeKey, strat)}
                  className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  {/* Top Badge & Recommend Pin */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    {isRecommended && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                        <CheckCircle className="w-3 h-3" /> Winner
                      </span>
                    )}
                  </div>

                  {/* Route Name & Core Metrics */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{strat.route_name}</h3>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-700/50">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Travel Time</span>
                        <span className="font-bold text-white">{strat.predicted_travel_time_min} min</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distance</span>
                        <span className="font-bold text-white">{strat.distance_km} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Disruption Risk</span>
                        <span
                          className={`font-bold ${
                            strat.disruption_risk_score > 0.6
                              ? 'text-rose-400'
                              : strat.disruption_risk_score > 0.3
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {(strat.disruption_risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Max Slope</span>
                        <span className="font-bold text-slate-300">{strat.max_gradient_pct}%</span>
                      </div>
                    </div>

                    {/* Terrain & Neural metrics */}
                    <div className="text-[10px] text-slate-400 flex flex-col gap-0.5">
                      <div className="flex justify-between">
                        <span>Elevation Gain:</span>
                        <span className="text-slate-200 font-medium">+{strat.elevation_gain_m}m</span>
                      </div>
                      {strat.neural_score !== undefined && (
                        <div className="flex justify-between">
                          <span>Neural Attention:</span>
                          <span className="text-purple-300 font-medium">
                            {strat.neural_attention_weight ? (strat.neural_attention_weight * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Select Action */}
                  <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-semibold ${
                        strat.feasibility_status === 'FEASIBLE'
                          ? 'text-emerald-400'
                          : 'text-rose-400 flex items-center gap-1'
                      }`}
                    >
                      {strat.feasibility_status === 'FEASIBLE' ? '✓ Feasible' : '⚠ Violations'}
                    </span>
                    <button
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Active on Map' : 'Preview Route'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Decision Reasoning Box */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Multi-Strategy Autonomous Analysis</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        </>
      )}
    </div>
  );
};
