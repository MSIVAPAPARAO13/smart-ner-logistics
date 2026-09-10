import React from 'react';
import { Shield, Radio, CloudRain, Navigation, FileText, Bell, Wifi, WifiOff, Globe, Brain } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
  activeAlertsCount: number;
  onOpenReportModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenMultilingualModal?: () => void;
  onOpenChecklistModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  isOnline,
  offlineQueueCount,
  activeAlertsCount,
  onOpenReportModal,
  onOpenAlertsModal,
  onOpenMultilingualModal,
  onOpenChecklistModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-500 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Shield className="w-6 h-6 text-white font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-0.5 rounded border border-purple-500/40 flex items-center gap-1">
              <Brain className="w-3 h-3" /> SIH26002 • Phase 5 Production
            </span>
            <h1 className="text-lg font-bold tracking-wide text-white">
              NER Smart Logistics & Accessibility Intelligence Platform
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Ministry of Development of North Eastern Region (MDoNER) • Real-Time Multilingual Disaster Corridor AI
          </p>
        </div>
      </div>

      {/* Data Source Honesty Badges */}
      <div className="hidden xl:flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-300">RRNCO Graph Neural</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">OR-Tools + LightGBM</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Open-Meteo API</span>
        </div>
      </div>

      {/* Actions & Alerts */}
      <div className="flex items-center space-x-2.5">
        {/* Offline Sync State Badge */}
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
          isOnline
            ? offlineQueueCount > 0
              ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700'
            : 'bg-rose-950 text-rose-400 border-rose-800'
        }`}>
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
          <span>{isOnline ? (offlineQueueCount > 0 ? `Syncing (${offlineQueueCount})` : 'SYNCED') : `OFFLINE (${offlineQueueCount})`}</span>
        </div>

        {/* Multilingual Dispatch Button */}
        {onOpenMultilingualModal && (
          <button
            onClick={onOpenMultilingualModal}
            className="flex items-center space-x-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm shadow-purple-900/30"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>🌐 6 NER Languages</span>
          </button>
        )}

        {/* SIH Audit & Readiness Matrix Button */}
        {onOpenChecklistModal && (
          <button
            onClick={onOpenChecklistModal}
            className="flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm shadow-emerald-900/30"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Audit Matrix</span>
          </button>
        )}

        {/* Central Alerts Button */}
        <button
          onClick={onOpenAlertsModal}
          className="relative flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition cursor-pointer"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Field Report Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition cursor-pointer"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Field Incident</span>
        </button>

        {/* Live WebSocket Status */}
        <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          wsConnected
            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
            : 'bg-rose-950/60 border border-rose-800 text-rose-400'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-400' : 'text-rose-400'}`} />
          <span>{wsConnected ? 'LIVE FEED' : 'RECONNECTING'}</span>
        </div>
      </div>
    </header>
  );
};
