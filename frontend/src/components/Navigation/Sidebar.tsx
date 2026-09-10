import React, { useEffect, useState } from 'react';
import {
  Radio,
  Truck,
  Route,
  Brain,
  Package,
  HardHat,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Sliders,
  Map,
  FileText,
  Hospital,
  ClipboardList,
} from 'lucide-react';
import { fetchCurrentUser } from '../../api/client';

export type ActiveScreen =
  | 'command-center'
  | 'fleet-and-deliveries'
  | 'network-accessibility'
  | 'ai-routing'
  | 'supply-continuity'
  | 'field-operations'
  | 'alerts'
  | 'analytics'
  | 'administration';

interface NavItem {
  id: ActiveScreen;
  label: string;
  icon: React.ElementType;
  badge?: number;
  roles?: string[]; // undefined = visible to all
}

interface SidebarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  activeAlertsCount: number;
  wsConnected: boolean;
  activeRole?: string;
  offlineQueueCount?: number;
}

const ROLE_NAV: Record<string, NavItem[]> = {
  ADMIN: [
    { id: 'command-center', label: 'Command Center', icon: Radio },
    { id: 'fleet-and-deliveries', label: 'Fleet & Deliveries', icon: Truck },
    { id: 'network-accessibility', label: 'Network Accessibility', icon: Route },
    { id: 'ai-routing', label: 'AI Routing', icon: Brain },
    { id: 'supply-continuity', label: 'Supply Continuity', icon: Package },
    { id: 'field-operations', label: 'Field Operations', icon: HardHat },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'administration', label: 'Administration', icon: ShieldAlert },
  ],
  COMMAND_OPERATOR: [
    { id: 'command-center', label: 'Command Center', icon: Radio },
    { id: 'fleet-and-deliveries', label: 'Fleet & Deliveries', icon: Truck },
    { id: 'ai-routing', label: 'AI Routing', icon: Brain },
    { id: 'network-accessibility', label: 'Accessibility Network', icon: Route },
    { id: 'supply-continuity', label: 'Supply Continuity', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ],
  DISTRICT_OFFICER: [
    { id: 'command-center', label: 'District Command', icon: Map },
    { id: 'network-accessibility', label: 'Local Roads & Bridges', icon: Route },
    { id: 'field-operations', label: 'District Incidents', icon: FileText },
    { id: 'supply-continuity', label: 'Hospitals & Supply', icon: Hospital },
    { id: 'alerts', label: 'District Alerts', icon: AlertTriangle },
  ],
  FLEET_MANAGER: [
    { id: 'fleet-and-deliveries', label: 'Fleet & Convoys', icon: Truck },
    { id: 'ai-routing', label: 'Route Rerouting', icon: Brain },
    { id: 'network-accessibility', label: 'Road Conditions', icon: Route },
    { id: 'alerts', label: 'Fleet Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Telematics Analytics', icon: BarChart3 },
  ],
  FIELD_OFFICER: [
    { id: 'field-operations', label: 'Field Reconnaissance', icon: HardHat },
    { id: 'network-accessibility', label: 'Road Status', icon: Route },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  ],
  SUPPLY_MANAGER: [
    { id: 'supply-continuity', label: 'Supply Continuity', icon: Package },
    { id: 'command-center', label: 'Depot Overview', icon: Map },
    { id: 'network-accessibility', label: 'Route Conditions', icon: Route },
    { id: 'alerts', label: 'Stockout Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Inventory Analytics', icon: BarChart3 },
  ],
  ANALYST_VIEWER: [
    { id: 'analytics', label: 'Operational Analytics', icon: BarChart3 },
    { id: 'command-center', label: 'Operational Map', icon: Map },
    { id: 'network-accessibility', label: 'Network Reports', icon: Route },
    { id: 'alerts', label: 'Incident Reports', icon: ClipboardList },
  ],
};

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'ADMIN', color: '#dc2626' },
  COMMAND_OPERATOR: { label: 'CMD OPS', color: '#0051d5' },
  DISTRICT_OFFICER: { label: 'DISTRICT', color: '#7c3aed' },
  FLEET_MANAGER: { label: 'FLEET', color: '#0891b2' },
  FIELD_OFFICER: { label: 'FIELD', color: '#d97706' },
  SUPPLY_MANAGER: { label: 'SUPPLY', color: '#059669' },
  ANALYST_VIEWER: { label: 'ANALYST', color: '#64748b' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  activeAlertsCount,
  wsConnected,
  activeRole = 'ADMIN',
  offlineQueueCount = 0,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, [activeRole]);

  const navItems = ROLE_NAV[activeRole] ?? ROLE_NAV['ADMIN'];
  const roleBadge = ROLE_BADGES[activeRole] ?? { label: activeRole, color: '#64748b' };

  const userInitials = currentUser
    ? currentUser.avatar_initials || currentUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : activeRole.slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0f172a] text-white z-50 flex flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.2)] border-r border-[#1e293b]">
      <div className="flex flex-col">
        {/* Emblem & Brand Header */}
        <div className="p-4 flex items-center gap-3 bg-[#0b1c30] border-b border-[#1e293b]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#0051d5] to-[#9333ea] flex items-center justify-center shadow-md p-1.5 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-base tracking-tight text-white truncate">NER CONNECT</span>
            <span className="text-[10px] font-mono text-[#93c5fd] truncate uppercase tracking-wider">
              Regional Logistics Intel • NER
            </span>
          </div>
        </div>

        {/* Operational Scope Banner */}
        <div className="px-4 py-2 bg-[#0b1c30]/90 flex items-center justify-between border-b border-[#1e293b]/70">
          <span className="text-[10px] font-mono text-[#94a3b8] tracking-wider uppercase">
            8 NE States Operational
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white font-semibold" style={{ backgroundColor: roleBadge.color }}>
            {roleBadge.label}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 p-2 pt-3">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            const Icon = item.icon;
            const badgeVal = item.id === 'alerts' ? activeAlertsCount : (item.id === 'field-operations' && offlineQueueCount > 0 ? offlineQueueCount : 0);
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0051d5] text-white font-semibold shadow-sm'
                    : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#94a3b8]'}`} />
                <span className="text-[13px] flex-1 truncate">{item.label}</span>
                {badgeVal > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#dc2626] text-white font-mono text-[10px] font-bold animate-pulse">
                    {badgeVal}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Section */}
      <div className="p-3 flex flex-col gap-2 bg-[#0b1c30] border-t border-[#1e293b]">
        {/* Latency & Telemetry Ping */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#131b2e] border border-[#1e293b]">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-[11px] font-mono text-white font-medium">
              {wsConnected ? 'Operational • Low Latency' : 'Offline / Reconnecting'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#94a3b8]">{wsConnected ? '24ms' : '--'}</span>
        </div>

        {/* Dynamic User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#131b2e]/60 border border-[#1e293b]/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-200">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[12px] font-bold text-white truncate">
              {currentUser?.name || 'NER Operator'}
            </span>
            <span className="text-[10px] text-[#94a3b8] truncate">
              {currentUser?.department || activeRole.replace(/_/g, ' ')}
            </span>
            <span className="text-[9px] font-mono text-[#60a5fa] truncate">
              {currentUser?.organization_district || 'Regional Command'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-[#94a3b8]">
          <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </span>
          <span className="text-[10px] font-mono text-[#64748b]">v5.0 PROD</span>
        </div>
      </div>
    </aside>
  );
};
