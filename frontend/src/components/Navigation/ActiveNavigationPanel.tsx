import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, X, Volume2, VolumeX, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, ArrowUp, MapPin,
} from 'lucide-react';
import type { RouteCandidate, RouteStep, RoutePlanResult } from './RoutePlannerCard';
import { useTranslation } from '../../i18n/LanguageContext';

interface ActiveNavigationPanelProps {
  route: RouteCandidate;
  planResult: RoutePlanResult;
  onExit: () => void;
  onReroute?: (newRoute: RouteCandidate) => void;
}

function getManeuverIcon(type: string): React.ReactNode {
  switch (type?.toLowerCase()) {
    case 'turn-left':
      return <ChevronLeft className="w-16 h-16 text-white" strokeWidth={2.5} />;
    case 'turn-right':
      return <ChevronRight className="w-16 h-16 text-white" strokeWidth={2.5} />;
    case 'arrive':
      return <CheckCircle2 className="w-16 h-16 text-emerald-300" strokeWidth={2} />;
    case 'depart':
      return <Navigation className="w-16 h-16 text-sky-300" strokeWidth={2} />;
    default:
      return <ArrowUp className="w-16 h-16 text-white" strokeWidth={2.5} />;
  }
}

function getManeuverLabel(type: string, t: any): string {
  switch (type?.toLowerCase()) {
    case 'turn-left': return t.route.turnLeft;
    case 'turn-right': return t.route.turnRight;
    case 'arrive': return t.route.arrive;
    case 'depart': return 'Depart';
    default: return t.route.continueStr;
  }
}

/** Speak text via Web Speech API */
function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const ActiveNavigationPanel: React.FC<ActiveNavigationPanelProps> = ({
  route,
  planResult,
  onExit,
  onReroute,
}) => {
  const { t } = useTranslation();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [rerouteAlert, setRerouteAlert] = useState(false);
  const [distanceCountdown, setDistanceCountdown] = useState<number>(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps: RouteStep[] = route.steps.length > 0 ? route.steps : [];
  const currentStep = steps[currentStepIdx];
  const nextStep = steps[currentStepIdx + 1];

  // Compute remaining stats
  const remainingSteps = steps.slice(currentStepIdx);
  const remainingDist = remainingSteps.reduce((sum, s) => sum + (s.distance_km || 0), 0);
  const remainingTime = remainingSteps.reduce((sum, s) => sum + (s.duration_min || 0), 0);

  // Auto-advance simulation (every 8s for demo)
  useEffect(() => {
    if (steps.length === 0) return;

    // Initialize countdown
    setDistanceCountdown(currentStep?.distance_km ?? 0);

    // Voice the first step
    if (voiceEnabled && currentStep) {
      setTimeout(() => speak(`${getManeuverLabel(currentStep.maneuver_type, t)}: ${currentStep.instruction}`), 500);
    }

    // Simulate vehicle progress
    progressRef.current = setInterval(() => {
      setProgressPct(p => {
        const newPct = p + (100 / (steps.length * 10));
        return Math.min(newPct, 100);
      });
      setDistanceCountdown(d => Math.max(0, d - (currentStep?.distance_km ?? 1) / 10));
    }, 800);

    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [currentStepIdx]);

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const next = steps[currentStepIdx + 1];
      if (voiceEnabled && next) {
        speak(`In ${formatDist(next.distance_km)}, ${getManeuverLabel(next.maneuver_type, t)} onto ${next.road_name}`);
      }
      setCurrentStepIdx(i => i + 1);
      setProgressPct(((currentStepIdx + 1) / steps.length) * 100);
      setDistanceCountdown(next?.distance_km ?? 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(i => i - 1);
    }
  };

  const handleVoiceToggle = () => {
    setVoiceEnabled(v => {
      if (v) window.speechSynthesis.cancel();
      return !v;
    });
  };

  // Simulate a reroute alert after 15s (demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (planResult.alternative_routes.length > 0) {
        setRerouteAlert(true);
        if (voiceEnabled) speak('Route change detected. Flood risk increased on current road. Rerouting recommended.');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const isArrived = currentStepIdx >= steps.length - 1;

  return (
    <div className="fixed inset-0 z-[3000] flex pointer-events-none">
      {/* Navigation Panel — left side */}
      <div className="w-[380px] h-full bg-[#0b1422] border-r border-[#1e293b] flex flex-col text-white shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f1c2e] border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-bold text-white">Active Navigation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceToggle}
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              className="p-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-white transition cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onExit}
              title="Exit navigation"
              className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-rose-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Destination Summary */}
        <div className="px-4 py-3 bg-[#0f1c2e] border-b border-[#1e293b]/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-0.5">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Destination</span>
          </div>
          <p className="text-[13px] font-bold text-white truncate">{planResult.destination_name}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[12px] font-mono text-emerald-400 font-bold">{formatTime(remainingTime)}</span>
            <span className="text-[12px] font-mono text-slate-400">{formatDist(remainingDist)} remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-[#0b1422] border-b border-[#1e293b]/40">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>Route Progress</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Current Maneuver — BIG */}
        <div className={`flex-1 flex flex-col items-center justify-center px-4 py-6 ${
          isArrived ? 'bg-emerald-950/30' : 'bg-[#0b1422]'
        }`}>
          {isArrived ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              <div>
                <p className="text-xl font-bold text-white">You have arrived!</p>
                <p className="text-[13px] text-emerald-400 mt-1">{planResult.destination_name}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-28 h-28 rounded-2xl bg-[#0051d5] flex items-center justify-center shadow-2xl mb-4">
                {getManeuverIcon(currentStep?.maneuver_type ?? 'straight')}
              </div>
              <p className="text-2xl font-black text-white text-center mb-1">
                {getManeuverLabel(currentStep?.maneuver_type ?? 'straight', t)}
              </p>
              <p className="text-[13px] text-slate-400 text-center leading-snug max-w-[280px]">
                {currentStep?.instruction || 'Continue on route'}
              </p>
              {currentStep?.road_name && (
                <p className="mt-2 text-[11px] font-mono text-sky-400">{currentStep.road_name}</p>
              )}

              {/* Distance Countdown */}
              <div className="mt-4 px-5 py-2.5 rounded-xl bg-[#1e293b] border border-[#334155]">
                <p className="text-[11px] text-slate-500 font-mono text-center uppercase tracking-wider mb-0.5">
                  Distance to maneuver
                </p>
                <p className="text-2xl font-black text-white text-center font-mono">
                  {distanceCountdown > 0.5
                    ? formatDist(distanceCountdown)
                    : <span className="text-amber-400 animate-pulse">TURN NOW</span>
                  }
                </p>
              </div>

              {/* Hazard Warning */}
              {currentStep?.hazard_warning && (
                <div className="mt-3 flex items-start gap-2 bg-rose-900/30 border border-rose-700/50 rounded-xl px-3 py-2 w-full">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-300 leading-snug">{currentStep.hazard_warning}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Next Step Preview */}
        {nextStep && !isArrived && (
          <div className="px-4 py-3 bg-[#111827] border-t border-[#1e293b]/60">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Then</p>
            <p className="text-[12px] text-slate-300 leading-snug">{nextStep.instruction}</p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">in {formatDist(nextStep.distance_km)}</p>
          </div>
        )}

        {/* Step Controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#0f1c2e] border-t border-[#1e293b]">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="flex-1 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-[12px] font-medium text-slate-300 transition cursor-pointer"
          >
            ← Prev
          </button>
          <span className="text-[11px] font-mono text-slate-500">{currentStepIdx + 1}/{steps.length}</span>
          <button
            onClick={handleNextStep}
            disabled={isArrived}
            className="flex-1 py-2 rounded-lg bg-[#0051d5] hover:bg-[#003ea8] disabled:opacity-30 disabled:cursor-not-allowed text-[12px] font-medium text-white transition cursor-pointer"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Reroute Alert Banner */}
      {rerouteAlert && planResult.alternative_routes.length > 0 && (
        <div className="pointer-events-auto absolute top-4 left-[380px] right-4 bg-amber-900/90 backdrop-blur-md border border-amber-600 rounded-2xl p-4 shadow-2xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-amber-200">ROUTE CHANGE DETECTED</p>
            <p className="text-[12px] text-amber-300 mt-0.5">
              {planResult.alternative_routes[0]?.summary?.includes('blocked') || route.disruption_risk_score > 0.5
                ? 'Flood risk increased / Road blocked ahead.'
                : 'Better route available via alternative corridor.'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] font-mono text-amber-400">
                Old ETA: {formatTime(route.travel_time_min)} •
                New ETA: {formatTime(planResult.alternative_routes[0]?.travel_time_min ?? route.travel_time_min)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => {
                onReroute?.(planResult.alternative_routes[0]);
                setRerouteAlert(false);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold transition cursor-pointer"
            >
              ACCEPT REROUTE
            </button>
            <button
              onClick={() => setRerouteAlert(false)}
              className="px-4 py-2 rounded-lg bg-amber-800/50 hover:bg-amber-700/50 text-amber-300 text-[12px] font-medium transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
