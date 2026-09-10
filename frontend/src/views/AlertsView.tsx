import React, { useState } from 'react';
import {
  Bell,
  Globe,
  CheckCircle2,
  Search,
} from 'lucide-react';
import type { AlertItem } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  onOpenMultilingualModal: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onOpenMultilingualModal }) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback demo alerts
  const defaultAlerts: AlertItem[] = [
    {
      id: 'ALT-FL-001',
      title: 'NH-6 Sonapur Flood & Inundation Breach',
      message: 'Highway segment submerged (+1.4m water). Severe mudslide at Sonapur tunnel approach. Rerouting active via Lumding-Haflong.',
      severity: 'CRITICAL',
      alert_type: 'FLOOD_WARNING',
      entity_id: 'ROAD-NH06-SHL-SIL',
      recommended_action: 'Halt approach immediately. Divert all emergency convoys to NH-27 Lumding corridor.',
      is_active: true,
      created_at: '2026-09-07T12:21:00Z',
    },
    {
      id: 'ALT-BR-002',
      title: 'Lubha Suspension Bridge High Water Warning',
      message: 'River water level crossed +2.1m over safety danger mark. Single-lane light vehicle restrictions in place.',
      severity: 'WARNING',
      alert_type: 'BRIDGE_HAZARD',
      entity_id: 'BRG-LUBHA-01',
      recommended_action: 'Heavy multi-axle freight barred from crossing until structural clearance inspection.',
      is_active: true,
      created_at: '2026-09-07T12:15:00Z',
    },
    {
      id: 'ALT-RN-003',
      title: 'Monsoon Cloudburst Alert: Meghalaya Escarpment',
      message: 'IMD Doppler Radar detects intense convective precipitation exceeding 112mm/hr over East Jaintia Hills.',
      severity: 'WARNING',
      alert_type: 'WEATHER_ALERT',
      entity_id: 'DIST-MEG-EJH',
      recommended_action: 'Monitor real-time hydro sensors; prepare landslide barrier teams for deployment.',
      is_active: true,
      created_at: '2026-09-07T12:08:00Z',
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const filteredAlerts = displayAlerts.filter((a) => {
    if (severityFilter === 'CRITICAL' && a.severity !== 'CRITICAL' && a.severity !== 'DANGER') return false;
    if (severityFilter === 'WARNING' && a.severity !== 'WARNING') return false;
    if (severityFilter === 'INFO' && a.severity !== 'INFO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        (a.entity_id && a.entity_id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full p-5 gap-4 bg-[#f8f9ff]">
      {/* 1. BROADCAST CONTROLLER HEADER */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[#0f172a]">
                Emergency Disaster Alerts &amp; Multilingual Dispatch
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f3e8ff] text-[#6b21a8] font-mono text-[10px] font-bold">
                6 NER Languages Active
              </span>
            </div>
            <span className="text-[11px] text-[#64748b]">
              CAP-CP Compliant Regional Dispatches in English, Hindi, Assamese, Bengali, Khasi &amp; Bodo
            </span>
          </div>
        </div>

        {/* Launch Multilingual Broadcaster Modal */}
        <button
          onClick={onOpenMultilingualModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9333ea] hover:bg-[#7e22ce] text-white font-mono text-[12px] font-bold shadow-md transition cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>BROADCAST IN 6 LANGUAGES</span>
        </button>
      </div>

      {/* 2. ALERTS LIST WITH FILTER TABS */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col overflow-hidden">
        <div className="p-3.5 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSeverityFilter(tab)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                  severityFilter === tab
                    ? 'bg-[#0051d5] text-white font-bold shadow-xs'
                    : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Alerts & Corridors..."
              className="text-[11px] bg-transparent outline-none w-56 text-[#0f172a]"
            />
          </div>
        </div>

        {/* Stream of Alert Cards */}
        <div className="divide-y divide-[#f1f5f9] p-2">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-lg mb-2 border transition ${
                alt.severity === 'CRITICAL' || alt.severity === 'DANGER'
                  ? 'bg-[#fef2f2] border-[#fecaca]'
                  : alt.severity === 'WARNING'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                      alt.severity === 'CRITICAL' || alt.severity === 'DANGER'
                        ? 'bg-[#dc2626] text-white'
                        : alt.severity === 'WARNING'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {alt.severity}
                  </span>
                  <span className="font-mono text-[11px] text-[#64748b]">{alt.id}</span>
                  {alt.entity_id && (
                    <span className="text-[11px] font-mono font-semibold text-[#0051d5]">
                      • {alt.entity_id}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#64748b]">12:21 IST</span>
              </div>

              <div className="font-bold text-[14px] text-[#0f172a] mt-1.5">{alt.title}</div>
              <p className="text-[12px] text-[#334155] mt-1 leading-relaxed">{alt.message}</p>

              {alt.recommended_action && (
                <div className="mt-2 p-2 rounded bg-white/80 border border-[#e2e8f0] flex items-start gap-1.5 text-[11px] text-[#0f172a]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Recommended Protocol:</strong> {alt.recommended_action}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
