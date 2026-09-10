import React, { useState } from 'react';
import {
  Route,
  Search,
  Compass,
} from 'lucide-react';
import type { Road, Bridge } from '../types';

interface NetworkViewProps {
  roads: Road[];
  bridges: Bridge[];
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  roads,
  bridges,
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const states = ['ALL', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'];

  const filteredRoads = roads.filter((r) => {
    if (statusFilter !== 'ALL' && r.current_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.road_name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full p-5 gap-4 bg-[#f8f9ff]">
      {/* 1. STATE & FILTER HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#e2e8f0] shadow-xs">
        {/* State Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#64748b] uppercase font-bold">State Filter:</span>
          <div className="flex flex-wrap gap-1">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                  selectedState === st
                    ? 'bg-[#0051d5] text-white font-bold'
                    : 'bg-[#eff4ff] text-[#475569] hover:bg-[#dbeafe]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
            {(['ALL', 'OPEN', 'WATCH', 'RISK', 'CRITICAL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                  statusFilter === st ? 'bg-[#0f172a] text-white font-bold' : 'text-[#475569]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NH Highway..."
              className="text-[11px] bg-transparent outline-none w-36 text-[#0f172a]"
            />
          </div>
        </div>
      </div>

      {/* 2. ROAD CORRIDORS TABLE */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-[#0051d5]" />
            <span className="text-[13px] font-bold text-[#0f172a]">Regional Highway Corridors ({filteredRoads.length})</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Real-Time Accessibility Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                <th className="py-2.5 px-3">Corridor ID</th>
                <th className="py-2.5 px-3">Road Name &amp; Sector</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Terrain Type</th>
                <th className="py-2.5 px-3">Accessibility Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Predicted Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[12px]">
              {filteredRoads.map((r) => (
                <tr key={r.id} className="hover:bg-[#f8fafc] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0f172a]">{r.id}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#0f172a]">{r.road_name}</span>
                      <span className="text-[10px] text-[#64748b]">{r.origin} → {r.destination}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{r.distance_km} km</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                      {r.terrain_type || 'Mountainous'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            r.accessibility_score > 70
                              ? 'bg-emerald-500'
                              : r.accessibility_score > 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${r.accessibility_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] font-bold">{r.accessibility_score}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        r.current_status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : r.current_status === 'WATCH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {r.current_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0f172a]">
                    {r.base_travel_time_min} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CRITICAL BRIDGES MONITORING SECTION */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#0051d5]" />
            <span className="text-[13px] font-bold text-[#0f172a]">Critical River Bridge Infrastructure ({bridges.length})</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">Sensor Telemetry Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {bridges.map((b) => (
            <div key={b.id} className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[12px] text-[#0f172a] truncate">{b.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                    b.accessibility_status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {b.accessibility_status}
                </span>
              </div>
              <div className="text-[11px] text-[#64748b]">River: <b className="text-[#0f172a]">{b.river_name || 'Brahmaputra Basin'}</b></div>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1 border-t border-[#e2e8f0]">
                <div>
                  <span className="text-[#64748b]">Water Level:</span> <b>{b.water_level_m}m</b>
                </div>
                <div>
                  <span className="text-[#64748b]">Danger Mark:</span> <b className="text-[#dc2626]">{b.danger_water_level_m}m</b>
                </div>
                <div>
                  <span className="text-[#64748b]">Load Limit:</span> <b>{b.load_limit_tons}t</b>
                </div>
                <div>
                  <span className="text-[#64748b]">Clearance:</span> <b>{b.clearance_status}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
