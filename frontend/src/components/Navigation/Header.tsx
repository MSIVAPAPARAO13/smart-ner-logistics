import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Play,
  Globe,
  Bell,
  HardHat,
  ShieldCheck,
  RotateCcw,
  Radio,
  Sliders,
  Sparkles,
  ChevronDown,
  UserCog,
} from 'lucide-react';
import type { ActiveScreen } from './Sidebar';
import { useTranslation } from '../../i18n/LanguageContext';
import { type SupportedLanguage, LANGUAGE_LABELS } from '../../i18n/translations';
import { setActiveRole, getActiveRole } from '../../api/client';

const ROLES = [
  { value: 'ADMIN', label: 'Admin', color: '#dc2626' },
  { value: 'COMMAND_OPERATOR', label: 'Cmd Operator', color: '#0051d5' },
  { value: 'DISTRICT_OFFICER', label: 'District Officer', color: '#7c3aed' },
  { value: 'FLEET_MANAGER', label: 'Fleet Manager', color: '#0891b2' },
  { value: 'FIELD_OFFICER', label: 'Field Officer', color: '#d97706' },
  { value: 'SUPPLY_MANAGER', label: 'Supply Manager', color: '#059669' },
  { value: 'ANALYST_VIEWER', label: 'Analyst', color: '#64748b' },
];

interface HeaderProps {
  activeScreen: ActiveScreen;
  wsConnected: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
  activeAlertsCount: number;
  onOpenReportModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenMultilingualModal: () => void;
  onOpenChecklistModal: () => void;
  onOpenWhatIfModal?: () => void;
  onOpenJudgeModal?: () => void;
  onTriggerDemo: () => void;
  onResetDemo: () => void;
  /** Legacy: kept for backward compatibility, use language context directly */
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
  activeRole?: string;
  onRoleChange?: (role: string) => void;
}

const screenTitleMap: Record<ActiveScreen, string> = {
  'command-center': 'Command Center — Geospatial Logistics Intelligence',
  'fleet-and-deliveries': 'Fleet & Deliveries — Live Vehicle Operations',
  'network-accessibility': 'Network Accessibility — Roads & Bridges Corridor Matrix',
  'ai-routing': 'AI Routing — Multi-Candidate Logistics Optimization',
  'supply-continuity': 'Supply Continuity — Stockout Prevention & Healthcare Logistics',
  'field-operations': 'Field Operations — Incident Lifecycle & Offline Reporter',
  'alerts': 'Central Emergency Alerts & Multilingual Dispatch',
  'analytics': 'Analytics & Operational Benchmarks',
  'administration': 'System Administration & RBAC Management',
};

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  wsConnected,
  isOnline,
  offlineQueueCount,
  activeAlertsCount,
  onOpenReportModal,
  onOpenAlertsModal,
  onOpenMultilingualModal,
  onOpenChecklistModal,
  onOpenWhatIfModal,
  onOpenJudgeModal,
  onTriggerDemo,
  onResetDemo,
  activeRole,
  onRoleChange,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  const currentRole = activeRole || getActiveRole();
  const currentRoleMeta = ROLES.find(r => r.value === currentRole) ?? ROLES[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (role: string) => {
    setActiveRole(role);
    onRoleChange?.(role);
    setRoleMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-b border-[#e2e8f0] z-40 flex items-center justify-between px-5">
      {/* Left Breadcrumb */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#64748b]">
            <span>Operational View</span>
            <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
            <span className="font-semibold text-[#0f172a] truncate">
              {screenTitleMap[activeScreen]}
            </span>
          </div>
          <span className="text-[11px] text-[#64748b] truncate">
            Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim
          </span>
        </div>

        {/* Demo Scenario Quick Trigger */}
        <div className="hidden 2xl:flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
          <span className="px-2 py-0.5 rounded bg-[#f3e8ff] text-[#6b21a8] font-mono text-[10px] font-bold uppercase tracking-wider">
            DEMO SCENARIO
          </span>
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0051d5] text-white font-mono text-[11px] font-semibold hover:bg-[#003ea8] transition cursor-pointer shadow-sm"
            type="button"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Hero Simulation</span>
          </button>
          {onOpenWhatIfModal && (
            <button
              onClick={onOpenWhatIfModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-mono text-[11px] font-bold transition cursor-pointer shadow-xs"
              type="button"
            >
              <Sliders className="w-3 h-3 text-purple-700" />
              <span>What-If Simulator</span>
            </button>
          )}
          <button
            onClick={onResetDemo}
            title="Reset Simulation"
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Live Clock */}
        <div className="hidden lg:flex flex-col items-end text-right border-r border-[#e2e8f0] pr-3">
          <span className="font-mono text-[12px] text-[#0f172a] font-bold tracking-tight">
            {timeString || '14:32:10 IST'}
          </span>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
            <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            Open-Meteo Live • IMD: Ready
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {/* Offline Sync Badge */}
          <div
            className={`px-2 py-1 rounded font-mono text-[10px] border flex items-center gap-1 ${
              isOnline
                ? offlineQueueCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <span>{isOnline ? (offlineQueueCount > 0 ? `Syncing (${offlineQueueCount})` : 'Online') : `Offline (${offlineQueueCount})`}</span>
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-bold transition cursor-pointer"
              style={{ backgroundColor: currentRoleMeta.color + '18', borderColor: currentRoleMeta.color + '60', color: currentRoleMeta.color }}
              title="Switch RBAC Role (Demo)"
              type="button"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>{currentRoleMeta.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-[180px] py-1">
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Role (Demo)
                </div>
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 flex items-center gap-2 transition ${currentRole === role.value ? 'bg-blue-50' : ''}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                    <span>{role.label}</span>
                    {currentRole === role.value && <span className="ml-auto text-[10px] font-mono text-blue-600">ACTIVE</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report Incident */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0f172a] text-white hover:bg-[#1e293b] text-[11px] font-medium transition cursor-pointer"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Incident</span>
          </button>

          {/* Multilingual Broadcaster */}
          <button
            onClick={onOpenMultilingualModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#faf5ff] text-[#7e22ce] border border-[#e9d5ff] hover:bg-[#f3e8ff] text-[11px] font-medium transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#9333ea]" />
            <span>6 Languages</span>
          </button>

          {/* Audit Matrix */}
          <button
            onClick={onOpenChecklistModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] text-[11px] font-medium transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Matrix</span>
          </button>

          {/* Judge Pitch */}
          {onOpenJudgeModal && (
            <button
              onClick={onOpenJudgeModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b1c30] text-emerald-300 border border-emerald-500/60 hover:bg-[#131b2e] text-[11px] font-bold transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Judge Pitch</span>
            </button>
          )}
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlertsModal}
          className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          title="Active Central Alerts"
        >
          <Bell className="w-4 h-4 text-slate-700" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Language Selector — wired to LanguageContext for instant UI switch */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label="Select Regional Language"
            className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] py-1 pl-2.5 pr-6 rounded border border-slate-300 outline-none cursor-pointer"
          >
            {(Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][]).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Close role menu on outside click */}
      {roleMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
      )}
    </header>
  );
};
