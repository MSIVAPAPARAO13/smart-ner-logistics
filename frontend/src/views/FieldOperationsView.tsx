import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  CameraOff,
  Search,
} from 'lucide-react';
import { verifyFieldReport, rejectFieldReport, resolveFieldReport } from '../api/client';
import type { FieldReport } from '../types';

interface FieldOperationsViewProps {
  fieldReports: FieldReport[];
  isOnline: boolean;
  offlineQueueCount: number;
  onOpenReportModal: () => void;
  onRefreshReports: () => void;
}

export const FieldOperationsView: React.FC<FieldOperationsViewProps> = ({
  fieldReports,
  isOnline,
  offlineQueueCount,
  onOpenReportModal,
  onRefreshReports,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'REPORTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fallback demo reports if backend reports list is empty
  const defaultReports: FieldReport[] = [
    {
      id: 'REP-S6-001',
      officer_name: 'B. Barman',
      department: 'Assam PWD (Roads & Bridges)',
      district: 'Cachar',
      location_name: 'NH-6 Sonapur KM-142',
      latitude: 25.1245,
      longitude: 92.3612,
      incident_type: 'Flooded Road & Landslide',
      severity: 'CRITICAL',
      description: 'Mud-slurry 1.4m deep over highway corridor following cloudburst. Heavy vehicles impassable.',
      evidence_source: 'SIMULATION',
      sync_state: 'VERIFIED',
      timestamp: '2026-09-07T12:21:00Z',
    },
    {
      id: 'REP-LB-002',
      officer_name: 'D. Marak',
      department: 'Meghalaya PWD',
      district: 'East Jaintia Hills',
      location_name: 'Lubha Suspension Bridge',
      latitude: 25.0892,
      longitude: 92.3911,
      incident_type: 'Damaged Bridge / Waterlogging',
      severity: 'HIGH',
      description: 'Lubha river level reached +2.1m over safety danger mark. Suspension deck vibration high.',
      evidence_source: 'HISTORICAL_REFERENCE',
      sync_state: 'VERIFIED',
      timestamp: '2026-09-07T12:15:00Z',
    },
    {
      id: 'REP-HF-003',
      officer_name: 'K. Thaosen',
      department: 'Dima Hasao Traffic Bureau',
      district: 'Dima Hasao',
      location_name: 'Haflong Hill Cut Pass',
      latitude: 25.1654,
      longitude: 93.0245,
      incident_type: 'Single Lane Debris Clearance',
      severity: 'MEDIUM',
      description: 'Minor gravel slip cleared. Single-lane police escort active for critical medical convoys.',
      evidence_source: 'NO_EVIDENCE_IMAGE',
      sync_state: 'RESOLVED',
      timestamp: '2026-09-07T12:28:00Z',
    },
  ];

  const displayReports = fieldReports.length > 0 ? fieldReports : defaultReports;

  const filteredReports = displayReports.filter((r) => {
    if (activeTab === 'REPORTED' && r.sync_state !== 'REPORTED' && r.sync_state !== 'PENDING') return false;
    if (activeTab === 'UNDER_REVIEW' && r.sync_state !== 'UNDER_REVIEW') return false;
    if (activeTab === 'VERIFIED' && r.sync_state !== 'VERIFIED' && r.sync_state !== 'SYNCED') return false;
    if (activeTab === 'RESOLVED' && r.sync_state !== 'RESOLVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.location_name.toLowerCase().includes(q) ||
        r.incident_type.toLowerCase().includes(q) ||
        r.officer_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVerify = async (reportId: string) => {
    try {
      setProcessingId(reportId);
      await verifyFieldReport(reportId, 'Verified by District Magistrate & PWD Senior Surveyor.');
      onRefreshReports();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reportId: string) => {
    try {
      setProcessingId(reportId);
      await rejectFieldReport(reportId, 'Report rejected - false alarm upon drone verification.');
      onRefreshReports();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (reportId: string) => {
    try {
      setProcessingId(reportId);
      await resolveFieldReport(reportId, 'Corridor cleared & traffic restored by SDRF.');
      onRefreshReports();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full p-5 gap-4 bg-[#f8f9ff]">
      {/* 1. PRIMARY CTA & SYNC HEADER */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <HardHat className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[#0f172a]">
                Field Operations &amp; Incident Verification Lifecycle
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold flex items-center gap-1 ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'ONLINE (SYNCED)' : `OFFLINE (${offlineQueueCount} Pending)`}
              </span>
            </div>
            <span className="text-[11px] text-[#64748b]">
              Geotagged PWD &amp; NDRF Field Surveyor Reports with Camera Evidence &amp; Offline Sync Queue
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0051d5] hover:bg-[#003ea8] text-white font-mono text-[12px] font-bold shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>REPORT NEW INCIDENT</span>
        </button>
      </div>

      {/* 2. INCIDENT LIFECYCLE MANAGEMENT TABLE */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col overflow-hidden">
        {/* Filter Controls */}
        <div className="p-3.5 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
            {(['ALL', 'REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#0051d5] text-white font-bold shadow-xs'
                    : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Incident ID, Officer, Location..."
              className="text-[11px] bg-transparent outline-none w-56 text-[#0f172a]"
            />
          </div>
        </div>

        {/* Incidents Stream */}
        <div className="divide-y divide-[#f1f5f9]">
          {filteredReports.map((rep) => (
            <div key={rep.id} className="p-4 hover:bg-[#f8fafc] transition flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Photo Thumbnail */}
                <div className="w-24 h-16 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 border border-[#cbd5e1] flex flex-col items-center justify-center p-1 text-center">
                  {rep.photo_url ? (
                    <img src={rep.photo_url} alt={rep.location_name} className="w-full h-full object-cover" />
                  ) : rep.evidence_source === 'SIMULATION' ? (
                    <div className="flex flex-col items-center justify-center text-purple-400">
                      <span className="text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded bg-purple-950/80 border border-purple-800">
                        SIMULATION
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5">SCENARIO DATA</span>
                    </div>
                  ) : rep.evidence_source === 'HISTORICAL_REFERENCE' ? (
                    <div className="flex flex-col items-center justify-center text-blue-400">
                      <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-blue-950/80 border border-blue-800">
                        HISTORICAL
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5">NER MONSOON</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CameraOff className="w-4 h-4 mb-0.5" />
                      <span className="text-[7px] font-mono font-bold text-slate-300">NO EVIDENCE</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-[#0f172a]">{rep.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                        rep.severity === 'CRITICAL'
                          ? 'bg-[#fee2e2] text-[#991b1b]'
                          : rep.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {rep.severity}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                        rep.sync_state === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.sync_state === 'RESOLVED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {rep.sync_state}
                    </span>
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      {rep.evidence_source || (rep.photo_url ? 'FIELD_UPLOAD' : 'NO_EVIDENCE_IMAGE')}
                    </span>
                  </div>

                  <span className="font-bold text-[13px] text-[#0f172a] mt-0.5">
                    {rep.incident_type} — {rep.location_name}
                  </span>

                  <p className="text-[11px] text-[#475569] mt-0.5 line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748b] mt-1">
                    <span>Officer: <b className="text-[#0f172a]">{rep.officer_name}</b> ({rep.department})</span>
                    <span>GPS: {rep.latitude?.toFixed(3)}°N, {rep.longitude?.toFixed(3)}°E</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Reviewer */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {rep.sync_state !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerify(rep.id)}
                    disabled={processingId === rep.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                )}
                {rep.sync_state !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(rep.id)}
                    disabled={processingId === rep.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono text-[11px] font-semibold transition cursor-pointer"
                  >
                    <span>Resolve</span>
                  </button>
                )}
                <button
                  onClick={() => handleReject(rep.id)}
                  disabled={processingId === rep.id}
                  className="p-1.5 rounded bg-[#fee2e2] hover:bg-[#fecaca] text-[#dc2626] transition cursor-pointer"
                  title="Reject Incident"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
