import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Road, Bridge, Vehicle, RouteData, Hazard, SimulationStatus, WeatherObservation, FieldReport, StrategyResult } from '../../types';
import { RoadNetworkLayer } from './RoadNetworkLayer';
import { BridgeLayer } from './BridgeLayer';
import { VehicleMarker } from './VehicleMarker';
import { RoutePolyline } from './RoutePolyline';
import { HazardPolygon } from './HazardPolygon';
import { WeatherRiskLayer } from './WeatherRiskLayer';
import { FieldReportLayer } from './FieldReportLayer';
import { SupplyDestinationLayer } from './SupplyDestinationLayer';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

interface NerMapProps {
  roads: Road[];
  bridges: Bridge[];
  vehicle: Vehicle | null;
  routes: RouteData[];
  hazards: Hazard[];
  weather: WeatherObservation[];
  fieldReports: FieldReport[];
  simulation: SimulationStatus | null;
  previewRoute?: StrategyResult | null;
  center?: [number, number];
  zoom?: number;
}

export const NerMap: React.FC<NerMapProps> = ({
  roads,
  bridges,
  vehicle,
  routes,
  hazards,
  weather,
  fieldReports,
  simulation,
  previewRoute,
  center = [25.75, 92.35],
  zoom = 8,
}) => {
  // Retrieve Mapbox token from Vite environment
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const hasToken = mapboxToken.trim().length > 0 && mapboxToken.startsWith('pk.');

  // Map style toggle (Dark Navigation vs Satellite Streets vs Outdoors)
  const [mapStyle, setMapStyle] = useState<'dark-v11' | 'satellite-streets-v12' | 'outdoors-v12'>('dark-v11');

  const tileUrl = hasToken
    ? `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = hasToken
    ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      {/* Missing Token Warning Banner */}
      {!hasToken && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-amber-950/90 border border-amber-500/80 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-2xl text-center max-w-md pointer-events-auto">
          <div className="text-amber-400 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span>⚠️</span> MAP SERVICE CONFIGURATION REQUIRED
          </div>
          <p className="text-[11px] text-amber-200 mt-1">
            Mapbox public access token is missing. Please configure <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">VITE_MAPBOX_ACCESS_TOKEN</code> in <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">frontend/.env</code>.
          </p>
          <p className="text-[10px] text-amber-400/80 mt-0.5">
            Using fallback OSM tiles for uninterrupted operations.
          </p>
        </div>
      )}

      {/* Mapbox Layer Switcher */}
      {hasToken && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 shadow-xl flex items-center gap-1 text-[10px] font-medium text-slate-300">
          <span className="px-2 text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Mapbox
          </span>
          <button
            onClick={() => setMapStyle('dark-v11')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapStyle === 'dark-v11'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            Dark Nav
          </button>
          <button
            onClick={() => setMapStyle('satellite-streets-v12')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapStyle === 'satellite-streets-v12'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle('outdoors-v12')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapStyle === 'outdoors-v12'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            Terrain
          </button>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#090d16' }}
      >
        <MapController center={center} zoom={zoom} />
        <ZoomControl position="bottomright" />

        <TileLayer
          key={`${mapStyle}-${hasToken}`}
          attribution={attribution}
          url={tileUrl}
          maxZoom={22}
          tileSize={256}
        />

        {/* Weather Intensity Overlay */}
        <WeatherRiskLayer weather={weather} />

        {/* Road Corridors */}
        <RoadNetworkLayer roads={roads} />

        {/* Route Polylines (Blue = Original, Purple = AI Candidate, Green = Recommended, Red = Blocked) */}
        <RoutePolyline routes={routes} simulation={simulation} previewRoute={previewRoute} />

        {/* River Bridges */}
        <BridgeLayer bridges={bridges} />

        {/* Supply Destinations (Hospitals & Relief Hubs) */}
        <SupplyDestinationLayer />

        {/* Field Incidents */}
        <FieldReportLayer reports={fieldReports} />

        {/* Hazard Polygons */}
        <HazardPolygon hazards={hazards} />

        {/* Moving Logistics Fleet Vehicles (Live GPS Tracking) */}
        <VehicleMarker simulation={simulation} vehicle={vehicle} />
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700/80 shadow-xl text-xs text-white pointer-events-auto max-w-xs">
        <div className="font-bold text-slate-200 mb-1.5 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational Map Legend
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Northeast India</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-500 rounded"></span>
            <span className="text-slate-300">Open Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-500 rounded"></span>
            <span className="text-slate-300">Original Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-rose-500 rounded"></span>
            <span className="text-slate-300">Blocked / Flooded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-purple-500 rounded border-dashed"></span>
            <span className="text-slate-300">AI / Neural Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-amber-500 rounded"></span>
            <span className="text-slate-300">Watch / High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-400 rounded"></span>
            <span className="text-slate-300">Final Safe Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
            <span className="text-slate-300">River Bridge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🏥</span>
            <span className="text-slate-300">Hospital Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};
