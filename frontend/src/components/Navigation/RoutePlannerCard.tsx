import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  MapPin, Navigation, RefreshCw, Truck, AlertTriangle, ChevronRight,
  CheckCircle2, XCircle, Loader2, ArrowRight, Clock, BarChart3,
} from 'lucide-react';
import { searchLocations, planRoute, type RoutePlanRequest } from '../../api/client';
import { useTranslation } from '../../i18n/LanguageContext';

interface LocationSuggestion {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface SelectedLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface RoutePlanResult {
  origin_name: string;
  origin_coords: [number, number];
  destination_name: string;
  destination_coords: [number, number];
  cargo_type: string;
  priority: string;
  active_corridor_condition: string;
  recommended_route: RouteCandidate;
  alternative_routes: RouteCandidate[];
  total_candidates_evaluated: number;
  data_source_lineage: string;
}

export interface RouteCandidate {
  route_id: string;
  route_name: string;
  route_type: string;
  distance_km: number;
  travel_time_min: number;
  predicted_delay_min: number;
  disruption_risk_score: number;
  reliability_score: number;
  accessibility_status: string;
  is_blocked: boolean;
  is_recommended: boolean;
  summary: string;
  why_this_route: string[];
  steps: RouteStep[];
  polyline_geojson: [number, number][];
  color_code: string;
}

export interface RouteStep {
  step_number: number;
  instruction: string;
  road_name: string;
  distance_km: number;
  duration_min: number;
  hazard_warning: string | null;
  maneuver_type: string;
}

interface RoutePlannerCardProps {
  onRoutePlanResult?: (result: RoutePlanResult) => void;
  onStartNavigation?: (route: RouteCandidate, result: RoutePlanResult) => void;
  onOriginChange?: (loc: SelectedLocation | null) => void;
  onDestChange?: (loc: SelectedLocation | null) => void;
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

const CARGO_OPTIONS = [
  { value: 'EMERGENCY_MEDICAL_SUPPLIES', label: 'Emergency Medical' },
  { value: 'FOOD_GRAINS', label: 'Food / Grains' },
  { value: 'RELIEF_EQUIPMENT', label: 'Relief Equipment' },
  { value: 'CONSTRUCTION_MATERIALS', label: 'Construction' },
  { value: 'FUEL', label: 'Fuel' },
];

const PRIORITY_OPTIONS = [
  { value: 'CRITICAL', label: '🔴 CRITICAL' },
  { value: 'HIGH', label: '🟠 HIGH' },
  { value: 'MEDIUM', label: '🟡 MEDIUM' },
  { value: 'NORMAL', label: '🟢 NORMAL' },
];

export const RoutePlannerCard: React.FC<RoutePlannerCardProps> = ({
  onRoutePlanResult,
  onStartNavigation,
  onOriginChange,
  onDestChange,
}) => {
  const { t } = useTranslation();

  // From / To selections
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [origin, setOrigin] = useState<SelectedLocation | null>(null);
  const [dest, setDest] = useState<SelectedLocation | null>(null);
  const [originLoading, setOriginLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);

  // Route params
  const [cargoType, setCargoType] = useState('EMERGENCY_MEDICAL_SUPPLIES');
  const [priority, setPriority] = useState('CRITICAL');
  const [vehicleWeight, setVehicleWeight] = useState(16.0);

  // Results
  const [planResult, setPlanResult] = useState<RoutePlanResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // ── Debounced search ─────────────────────────────────────────────────────────
  const searchOrigin = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setOriginSuggestions([]); return; }
      setOriginLoading(true);
      try {
        const res = await searchLocations(q, 6);
        setOriginSuggestions(res || []);
      } catch { setOriginSuggestions([]); }
      finally { setOriginLoading(false); }
    }, 350),
    []
  );

  const searchDest = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setDestSuggestions([]); return; }
      setDestLoading(true);
      try {
        const res = await searchLocations(q, 6);
        setDestSuggestions(res || []);
      } catch { setDestSuggestions([]); }
      finally { setDestLoading(false); }
    }, 350),
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOriginInput = (val: string) => {
    setOriginQuery(val);
    setOrigin(null);
    onOriginChange?.(null);
    searchOrigin(val);
  };

  const handleDestInput = (val: string) => {
    setDestQuery(val);
    setDest(null);
    onDestChange?.(null);
    searchDest(val);
  };

  const selectOrigin = (s: LocationSuggestion) => {
    const loc = { name: `${s.name}, ${s.state}`, lat: s.latitude, lng: s.longitude };
    setOrigin(loc);
    setOriginQuery(loc.name);
    setOriginSuggestions([]);
    onOriginChange?.(loc);
  };

  const selectDest = (s: LocationSuggestion) => {
    const loc = { name: `${s.name}, ${s.state}`, lat: s.latitude, lng: s.longitude };
    setDest(loc);
    setDestQuery(loc.name);
    setDestSuggestions([]);
    onDestChange?.(loc);
  };

  const handleOptimize = async () => {
    if (!origin || !dest) {
      setCalcError('Please select both origin and destination from the suggestions.');
      return;
    }
    setIsCalculating(true);
    setCalcError(null);
    setPlanResult(null);

    try {
      const payload: RoutePlanRequest = {
        origin: origin.name,
        destination: dest.name,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: dest.lat,
        dest_lng: dest.lng,
        origin_name: origin.name,
        destination_name: dest.name,
        cargo_type: cargoType,
        priority,
        avoid_hazards: true,
        vehicle_weight_tons: vehicleWeight,
      };
      const result = await planRoute(payload);
      setPlanResult(result);
      setSelectedRouteId(result.recommended_route?.route_id ?? null);
      onRoutePlanResult?.(result);
    } catch (err: any) {
      setCalcError(err?.message || 'Route planning failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const allRoutes = planResult
    ? [planResult.recommended_route, ...planResult.alternative_routes]
    : [];

  const selectedRoute = allRoutes.find(r => r.route_id === selectedRouteId) ?? allRoutes[0];

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col gap-4 text-white">
      <div className="flex items-center gap-2">
        <Navigation className="w-4 h-4 text-[#60a5fa]" />
        <h3 className="text-sm font-bold text-white tracking-tight">Dynamic Route Planner</h3>
        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
          AI-Powered
        </span>
      </div>

      {/* From */}
      <div className="relative">
        <label className="block text-[11px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
          {t.route.from}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
          <input
            type="text"
            value={originQuery}
            onChange={e => handleOriginInput(e.target.value)}
            placeholder={t.route.searchOrigin}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-10 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {originLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />}
          {origin && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />}
        </div>
        {originSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
            {originSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectOrigin(s)}
                className="w-full text-left px-4 py-2.5 text-[12px] text-slate-200 hover:bg-[#334155] flex items-center gap-2 transition border-b border-[#1e293b]/60 last:border-0"
              >
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="font-medium">{s.name}</span>
                <span className="text-slate-500 ml-auto">{s.state}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* To */}
      <div className="relative">
        <label className="block text-[11px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
          {t.route.to}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
          <input
            type="text"
            value={destQuery}
            onChange={e => handleDestInput(e.target.value)}
            placeholder={t.route.searchDest}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-10 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
          {destLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />}
          {dest && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />}
        </div>
        {destSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
            {destSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectDest(s)}
                className="w-full text-left px-4 py-2.5 text-[12px] text-slate-200 hover:bg-[#334155] flex items-center gap-2 transition border-b border-[#1e293b]/60 last:border-0"
              >
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="font-medium">{s.name}</span>
                <span className="text-slate-500 ml-auto">{s.state}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cargo & Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-mono uppercase tracking-wider">{t.route.cargoType}</label>
          <select
            value={cargoType}
            onChange={e => setCargoType(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-500"
          >
            {CARGO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-mono uppercase tracking-wider">{t.route.priority}</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-500"
          >
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Error */}
      {calcError && (
        <div className="flex items-center gap-2 bg-rose-900/30 border border-rose-700/50 rounded-lg px-3 py-2.5 text-[12px] text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{calcError}</span>
        </div>
      )}

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={isCalculating || !origin || !dest}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition ${
          isCalculating || !origin || !dest
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#0051d5] to-[#7c3aed] hover:from-[#003ea8] hover:to-[#6d28d9] text-white shadow-lg cursor-pointer'
        }`}
      >
        {isCalculating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /><span>{t.route.calculating}</span></>
        ) : (
          <><RefreshCw className="w-4 h-4" /><span>{t.route.optimize}</span></>
        )}
      </button>

      {/* Results */}
      {planResult && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Evaluated: <span className="text-white font-bold">{planResult.total_candidates_evaluated}</span> routes</span>
            <span className="ml-auto text-emerald-400">{planResult.data_source_lineage}</span>
          </div>

          {allRoutes.map((route) => {
            const isSelected = route.route_id === selectedRouteId;
            const riskPct = Math.round(route.disruption_risk_score * 100);
            const relPct = Math.round(route.reliability_score * 100);
            return (
              <div
                key={route.route_id}
                onClick={() => !route.is_blocked && setSelectedRouteId(route.route_id)}
                className={`rounded-xl border p-3.5 cursor-pointer transition ${
                  route.is_blocked
                    ? 'border-rose-700/50 bg-rose-900/10 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-[#1e293b] bg-[#1e293b]/60 hover:border-slate-500'
                }`}
                style={{ borderLeftColor: route.color_code, borderLeftWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {route.is_recommended && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white font-mono uppercase">
                          AI RECOMMENDED
                        </span>
                      )}
                      {route.is_blocked && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-700 text-white font-mono uppercase">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-semibold text-white leading-snug truncate">{route.route_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{route.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2.5">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Dist</p>
                    <p className="text-[12px] font-bold text-white">{route.distance_km.toFixed(0)}km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">ETA</p>
                    <p className="text-[12px] font-bold text-white">{formatTime(route.travel_time_min)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Risk</p>
                    <p className={`text-[12px] font-bold ${riskPct > 50 ? 'text-rose-400' : riskPct > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {riskPct}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Rely</p>
                    <p className={`text-[12px] font-bold ${relPct >= 75 ? 'text-emerald-400' : relPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {relPct}%
                    </p>
                  </div>
                </div>

                {route.why_this_route.length > 0 && isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-[#1e293b] space-y-1">
                    {route.why_this_route.slice(0, 3).map((r, i) => (
                      <p key={i} className="text-[11px] text-slate-300 leading-snug">{r}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Start Navigation Button */}
          {selectedRoute && !selectedRoute.is_blocked && (
            <button
              onClick={() => onStartNavigation?.(selectedRoute, planResult)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[13px] font-bold transition shadow-lg cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.route.startNavigation}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
