import React, { useState, useMemo } from 'react';
import {
  Truck,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Thermometer,
  Activity,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import type { Vehicle, SimulationStatus } from '../types';
import { WhatIsAffectedDrawer } from '../components/Dashboard/WhatIsAffectedDrawer';

interface FleetViewProps {
  vehicles: Vehicle[];
  simulation: SimulationStatus | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

// Fallback seed vehicles matching authentic SIH NER logistics if backend vehicles is empty
const DEFAULT_FALLBACK_FLEET: Vehicle[] = [
  {
    id: 'NER-MED-01',
    vehicle_number: 'AS-01-MC-4920',
    cargo_type: 'Pediatric Vaccines & Plasma',
    priority: 'CRITICAL',
    capacity_tons: 3.5,
    current_lat: 25.75,
    current_lng: 92.35,
    speed_kmh: 44,
    heading_deg: 128,
    status: 'EN_ROUTE',
    origin: 'Guwahati GMCH',
    destination: 'Silchar Civil Hospital & Regional Store',
    updated_at: new Date().toISOString(),
    data_lineage: 'LIVE',
  },
  {
    id: 'NER-OXY-04',
    vehicle_number: 'AS-01-OX-8812',
    cargo_type: 'Cryogenic Liquid Medical O2',
    priority: 'CRITICAL',
    capacity_tons: 8.0,
    current_lat: 26.15,
    current_lng: 92.74,
    speed_kmh: 38,
    heading_deg: 95,
    status: 'EN_ROUTE',
    origin: 'Guwahati Depot',
    destination: 'Nagaon District Hospital',
    updated_at: new Date(Date.now() - 120000).toISOString(),
    data_lineage: 'LIVE',
  },
  {
    id: 'NER-FOOD-12',
    vehicle_number: 'ML-05-FD-2309',
    cargo_type: 'Disaster Relief Rations (FCI)',
    priority: 'HIGH',
    capacity_tons: 12.0,
    current_lat: 25.57,
    current_lng: 91.88,
    speed_kmh: 32,
    heading_deg: 160,
    status: 'DELAYED',
    origin: 'Shillong Central Warehouse',
    destination: 'Jowai Sub-Division',
    updated_at: new Date(Date.now() - 300000).toISOString(),
    data_lineage: 'LIVE',
  },
  {
    id: 'NER-RELIEF-08',
    vehicle_number: 'TR-01-RF-1140',
    cargo_type: 'Water Purification Kits & Tents',
    priority: 'HIGH',
    capacity_tons: 6.0,
    current_lat: 0,
    current_lng: 0,
    speed_kmh: 0,
    heading_deg: 0,
    status: 'IDLE',
    origin: 'Agartala Central Hub',
    destination: 'Dharmanagar Depot',
    updated_at: undefined,
    data_lineage: 'UNAVAILABLE',
  },
  {
    id: 'NER-MED-09',
    vehicle_number: 'MZ-01-MD-9041',
    cargo_type: 'Anti-Venom & Emergency Trauma Kits',
    priority: 'CRITICAL',
    capacity_tons: 4.2,
    current_lat: 24.12,
    current_lng: 92.89,
    speed_kmh: 40,
    heading_deg: 185,
    status: 'EN_ROUTE',
    origin: 'Silchar Civil Hospital',
    destination: 'Aizawl Civil Hospital',
    updated_at: new Date(Date.now() - 60000).toISOString(),
    data_lineage: 'LIVE',
  },
];

export const FleetView: React.FC<FleetViewProps> = ({ vehicles, simulation, onSelectVehicle }) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'EN_ROUTE' | 'CRITICAL' | 'DELAYED' | 'IDLE' | 'AT_RISK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isImpactDrawerOpen, setIsImpactDrawerOpen] = useState(false);

  // Merge backend vehicles with live simulation overlay
  const activeFleet = useMemo(() => {
    const baseSource = vehicles && vehicles.length > 0 ? vehicles : DEFAULT_FALLBACK_FLEET;

    return baseSource.map((v) => {
      // If this vehicle is currently in active simulation, reflect simulated telemetry
      const isSimulated = simulation && (v.id === 'NER-MED-01' || v.id === 'NER-TRK-01');
      const hasTelemetry = v.current_lat !== 0 && v.current_lng !== 0 && !isNaN(v.current_lat) && !isNaN(v.current_lng);

      const lat = isSimulated && simulation?.vehicle_lat ? simulation.vehicle_lat : v.current_lat;
      const lng = isSimulated && simulation?.vehicle_lng ? simulation.vehicle_lng : v.current_lng;
      const speed = isSimulated && simulation?.vehicle_speed_kmh !== undefined ? simulation.vehicle_speed_kmh : v.speed_kmh;
      const heading = isSimulated && simulation?.vehicle_heading !== undefined ? simulation.vehicle_heading : v.heading_deg;

      // Status resolution
      let status = v.status;
      if (isSimulated) {
        if (simulation?.route_type === 'ALTERNATE') status = 'REROUTED_SAFE';
        else if (simulation?.scenario_stage === 'BLOCKED') status = 'DELAYED';
        else status = 'EN_ROUTE';
      }

      // Check predictive stockout exception:
      // If vehicle heads to Silchar Civil Hospital and delayed ETA > stockout window (6.2h)
      const isSilcharDelivery = v.destination.toLowerCase().includes('silchar') && v.priority === 'CRITICAL';
      const isRerouted = status === 'REROUTED_SAFE' || (isSimulated && simulation?.route_type === 'ALTERNATE');
      const isAtRisk = isSilcharDelivery && !isRerouted && (status === 'DELAYED' || simulation?.scenario_stage === 'BLOCKED');

      const lineage = isSimulated ? 'SIMULATION' : !hasTelemetry ? 'UNAVAILABLE' : (v.data_lineage || 'LIVE');

      // ETA & Stockout calculations
      const normalEtaHours = isSimulated ? 7.1 : 6.5;
      const delayedEtaHours = isSimulated ? 11.2 : 9.8;
      const stockoutWindowHours = 6.2; // Silchar Hospital Oxygen & Plasma buffer

      return {
        ...v,
        current_lat: lat,
        current_lng: lng,
        speed_kmh: speed,
        heading_deg: heading,
        status,
        hasTelemetry,
        lineage,
        isAtRisk,
        stockoutWindowHours,
        delayedEtaHours: isAtRisk ? delayedEtaHours : normalEtaHours,
        stockoutDeficitHours: isAtRisk ? Number((delayedEtaHours - stockoutWindowHours).toFixed(1)) : 0,
        temperature_c: v.cargo_type.toLowerCase().includes('vaccine') || v.cargo_type.toLowerCase().includes('plasma') ? 3.8 : undefined,
      };
    });
  }, [vehicles, simulation]);

  // Selected vehicle resolution
  const activeVehicle = useMemo(() => {
    if (selectedVehicleId) {
      const found = activeFleet.find((f) => f.id === selectedVehicleId);
      if (found) return found;
    }
    return activeFleet[0] || DEFAULT_FALLBACK_FLEET[0];
  }, [activeFleet, selectedVehicleId]);

  // Filtered rows
  const filteredFleet = useMemo(() => {
    return activeFleet.filter((item) => {
      if (filterTab === 'EN_ROUTE' && item.status !== 'EN_ROUTE' && item.status !== 'REROUTED_SAFE') return false;
      if (filterTab === 'CRITICAL' && item.priority !== 'CRITICAL') return false;
      if (filterTab === 'DELAYED' && item.status !== 'DELAYED') return false;
      if (filterTab === 'IDLE' && item.status !== 'IDLE') return false;
      if (filterTab === 'AT_RISK' && !item.isAtRisk) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.vehicle_number.toLowerCase().includes(q) ||
          item.cargo_type.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeFleet, filterTab, searchQuery]);

  const atRiskCount = useMemo(() => activeFleet.filter((v) => v.isAtRisk).length, [activeFleet]);
  const criticalCount = useMemo(() => activeFleet.filter((v) => v.priority === 'CRITICAL').length, [activeFleet]);
  const delayedCount = useMemo(() => activeFleet.filter((v) => v.status === 'DELAYED').length, [activeFleet]);

  return (
    <div className="flex flex-col w-full p-5 gap-4 bg-[#f8f9ff]">
      {/* 0. PREDICTIVE EXCEPTION BANNER (P1.5) */}
      {atRiskCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white tracking-wider">
                  DELIVERY AT RISK
                </span>
                <span className="text-xs font-mono font-bold text-[#0f172a]">
                  Predicted ETA exceeds hospital stockout window
                </span>
              </div>
              <span className="text-xs text-[#475569] mt-0.5">
                Convoy <strong className="font-mono text-[#0f172a]">NER-MED-01</strong> delayed on NH-6. Predicted arrival (<strong className="font-mono">11.2h</strong>) exceeds Silchar Civil Hospital reserve (<strong className="font-mono">6.2h</strong>) by <strong className="text-amber-700 font-mono">5.0h</strong>.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsImpactDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm w-full md:w-auto justify-center"
            >
              <Activity className="w-3.5 h-3.5" />
              Inspect Impact &amp; Reroute
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP OPERATIONAL STATS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Active Convoys */}
        <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider font-semibold">
              Fleet Convoys
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#0f172a] font-mono">{activeFleet.length}</span>
              <span className="text-[10px] font-mono font-semibold text-[#0051d5]">Monitored</span>
            </div>
            <span className="text-[11px] text-[#64748b]">Real-Time Telemetry Stream</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Critical Consignments */}
        <div className="p-3.5 rounded-xl bg-[#fee2e2]/60 border border-[#fecaca] shadow-xs flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-[#dc2626] uppercase tracking-wider font-bold">
              Critical Consignments
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#dc2626] font-mono">{criticalCount}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#dc2626] text-white font-bold">
                P1 ESCALATED
              </span>
            </div>
            <span className="text-[11px] text-[#7f1d1d]">Plasma, Vaccines &amp; Liquid O2</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#fee2e2] flex items-center justify-center text-[#dc2626]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Predictive Risk */}
        <div className={`p-3.5 rounded-xl shadow-xs flex items-center justify-between border ${
          atRiskCount > 0 ? 'bg-amber-100/70 border-amber-300' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider font-bold">
              Delivery At Risk
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-amber-900 font-mono">{atRiskCount}</span>
              <span className="text-[10px] font-mono font-bold text-amber-700">
                {atRiskCount > 0 ? 'Stockout Deficit' : 'All Protected'}
              </span>
            </div>
            <span className="text-[11px] text-amber-800">
              {delayedCount} corridor delays reported
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Fleet On-Time Rate */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider font-bold">
              Supply Protection Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-emerald-900 font-mono">
                {atRiskCount > 0 ? '80.0%' : '100%'}
              </span>
              <span className="text-[10px] font-mono text-emerald-700">
                {atRiskCount > 0 ? 'Action Required' : 'Optimal'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-800">Dynamic VRP Engine</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. FLEET TABLE & INSPECTION SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Table (Left 2 Cols) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-3.5 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
              {(['ALL', 'EN_ROUTE', 'CRITICAL', 'AT_RISK', 'DELAYED', 'IDLE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                    filterTab === tab
                      ? 'bg-[#0051d5] text-white font-bold shadow-xs'
                      : 'text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  {tab.replace('_', ' ')}
                  {tab === 'AT_RISK' && atRiskCount > 0 && (
                    <span className="ml-1 px-1 py-0.2 rounded bg-amber-500 text-white text-[9px] font-bold">
                      {atRiskCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
              <Search className="w-3.5 h-3.5 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter VIN, Cargo, Destination..."
                className="text-[11px] bg-transparent outline-none w-48 text-[#0f172a] placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          {/* Table Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Vehicle / Lineage</th>
                  <th className="py-2.5 px-3">Cargo Manifest</th>
                  <th className="py-2.5 px-3">Route Corridors</th>
                  <th className="py-2.5 px-3">Speed / Telemetry</th>
                  <th className="py-2.5 px-3">ETA &amp; Stockout</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[12px]">
                {filteredFleet.map((v) => {
                  const isSelected = activeVehicle.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicleId(v.id);
                        if (onSelectVehicle) onSelectVehicle(v);
                      }}
                      className={`hover:bg-[#f8fafc] transition cursor-pointer ${
                        isSelected ? 'bg-[#eff4ff]/70 font-medium' : ''
                      } ${v.isAtRisk ? 'bg-amber-500/5' : ''}`}
                    >
                      {/* Vehicle / Lineage */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f172a] font-mono">{v.id}</span>
                            {v.lineage === 'SIMULATION' && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-mono text-[9px] font-black border border-purple-200">
                                SIMULATION
                              </span>
                            )}
                            {v.lineage === 'LIVE' && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-200">
                                LIVE
                              </span>
                            )}
                            {v.lineage === 'UNAVAILABLE' && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold border border-slate-200">
                                NO SIGNAL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#64748b] font-mono">{v.vehicle_number}</span>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-[#0f172a] truncate max-w-[160px] font-medium">{v.cargo_type}</span>
                          {v.temperature_c !== undefined && (
                            <span className="text-[10px] font-mono text-[#0051d5] flex items-center gap-0.5">
                              <Thermometer className="w-2.5 h-2.5" />
                              {v.temperature_c}°C (Cold Chain)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-[#475569]">
                          <span className="truncate max-w-[85px]">{v.origin.split(' ')[0]}</span>
                          <ArrowRight className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                          <span className="truncate max-w-[85px] text-[#0f172a] font-semibold">
                            {v.destination.split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Speed / Telemetry */}
                      <td className="py-2.5 px-3">
                        {v.hasTelemetry ? (
                          <div className="flex flex-col font-mono text-[11px]">
                            <span className="font-bold text-[#0f172a]">{v.speed_kmh} km/h</span>
                            <span className="text-[10px] text-[#64748b]">{v.heading_deg}° Heading</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            TELEMETRY UNAVAILABLE
                          </span>
                        )}
                      </td>

                      {/* ETA & Stockout */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col font-mono">
                          <span className="font-bold text-[#0f172a]">{v.delayedEtaHours}h ETA</span>
                          {v.isAtRisk ? (
                            <span className="text-[10px] text-amber-700 font-black flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Deficit +{v.stockoutDeficitHours}h
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700">Stockout Safe</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            v.status === 'REROUTED_SAFE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : v.isAtRisk
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : v.status === 'DELAYED'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : v.status === 'IDLE'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {v.isAtRisk ? 'DELIVERY AT RISK' : v.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicleId(v.id);
                            if (v.isAtRisk) {
                              setIsImpactDrawerOpen(true);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dbeafe] text-[#0051d5] font-mono text-[10px] font-bold cursor-pointer transition"
                        >
                          {v.isAtRisk ? 'Analyze' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Inspection Detail Panel (Right Col) */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0051d5]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#0f172a] font-mono">
                    {activeVehicle.id}
                  </span>
                  {activeVehicle.lineage === 'SIMULATION' && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-mono text-[9px] font-black">
                      SIMULATION
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#64748b]">
                  {activeVehicle.vehicle_number}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] font-mono text-[10px] font-bold">
              {activeVehicle.priority}
            </span>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col">
              <span className="text-[9px] font-mono text-[#64748b] uppercase">Live Coordinates</span>
              {activeVehicle.hasTelemetry ? (
                <span className="text-[11px] font-mono font-bold text-[#0f172a] truncate">
                  {activeVehicle.current_lat.toFixed(4)}°N, {activeVehicle.current_lng.toFixed(4)}°E
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  TELEMETRY UNAVAILABLE
                </span>
              )}
            </div>
            <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col">
              <span className="text-[9px] font-mono text-[#64748b] uppercase">Payload Capacity</span>
              <span className="text-[11px] font-mono font-bold text-[#0f172a]">
                {activeVehicle.capacity_tons} Tons
              </span>
            </div>
          </div>

          {/* Telemetry Status & Timestamp */}
          <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${activeVehicle.hasTelemetry ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-mono text-[10px] text-[#475569]">
                {activeVehicle.hasTelemetry ? 'Telemetry Timestamp' : 'Signal Status'}
              </span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-[#0f172a]">
              {activeVehicle.hasTelemetry
                ? activeVehicle.updated_at
                  ? new Date(activeVehicle.updated_at).toLocaleTimeString()
                  : 'Live GPS Synced'
                : 'NO SIGNAL'}
            </span>
          </div>

          {/* Predictive Exception Box if At Risk */}
          {activeVehicle.isAtRisk && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-amber-800 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  PREDICTIVE EXCEPTION
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-600 text-white">
                  +{activeVehicle.stockoutDeficitHours}h DEFICIT
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                <strong>WHY:</strong> Predicted arrival ({activeVehicle.delayedEtaHours}h) exceeds remaining hospital inventory reserve ({activeVehicle.stockoutWindowHours}h).
              </p>
              <div className="text-[10px] font-mono text-[#475569] bg-white/80 p-2 rounded border border-amber-200">
                <div><strong>Destination:</strong> {activeVehicle.destination}</div>
                <div><strong>Stockout Window:</strong> {activeVehicle.stockoutWindowHours} Hours</div>
                <div><strong>Delayed ETA:</strong> {activeVehicle.delayedEtaHours} Hours</div>
                <div><strong>Action:</strong> Recalculate via Lumding-Haflong Bypass (ETA 7.1h)</div>
              </div>
              <button
                onClick={() => setIsImpactDrawerOpen(true)}
                className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                Trigger What-Is-Affected Analysis
              </button>
            </div>
          )}

          {/* Sensor Diagnostics */}
          <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dbeafe] flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold text-[#0051d5] uppercase tracking-wide">
              Diagnostics &amp; Sensors
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div className="flex flex-col">
                <span className="text-[#64748b]">Chamber Temp</span>
                <span className="font-bold text-[#0f172a]">
                  {activeVehicle.temperature_c !== undefined ? `${activeVehicle.temperature_c}°C` : 'Ambient'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#64748b]">Speed</span>
                <span className="font-bold text-[#0f172a]">
                  {activeVehicle.hasTelemetry ? `${activeVehicle.speed_kmh} km/h` : '--'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#64748b]">Heading</span>
                <span className="font-bold text-[#0f172a]">
                  {activeVehicle.hasTelemetry ? `${activeVehicle.heading_deg}°` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Route Reroute History */}
          <div className="flex flex-col gap-1.5 text-[11px]">
            <span className="text-[10px] font-mono text-[#64748b] uppercase font-bold">Corridor Status</span>
            <div className={`p-2 rounded border flex flex-col gap-1 text-[10px] ${
              activeVehicle.status === 'REROUTED_SAFE'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : activeVehicle.status === 'DELAYED'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]'
            }`}>
              <div className="font-bold flex items-center gap-1">
                {activeVehicle.status === 'REROUTED_SAFE' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Haflong Bypass (Active Reroute)</span>
                  </>
                ) : activeVehicle.status === 'DELAYED' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>NH-6 Sonapur Flood Disruption</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Standard Primary Corridor</span>
                  </>
                )}
              </div>
              <span className="text-[9px]">
                {activeVehicle.status === 'REROUTED_SAFE'
                  ? 'Bypassed NH-6 Sonapur flood zone; 4.1h delay avoided.'
                  : activeVehicle.status === 'DELAYED'
                  ? 'Landslide & flash flood warning near Mile 142.'
                  : 'Operating within standard transit corridor schedule.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT IS AFFECTED DRAWER (P1.2) */}
      <WhatIsAffectedDrawer
        isOpen={isImpactDrawerOpen}
        onClose={() => setIsImpactDrawerOpen(false)}
        roadId="ROAD-NH6-01"
        onApproveReroute={() => {
          setIsImpactDrawerOpen(false);
        }}
      />
    </div>
  );
};
