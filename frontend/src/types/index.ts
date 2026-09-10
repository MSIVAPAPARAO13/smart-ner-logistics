export type RoadStatus = 'OPEN' | 'WATCH' | 'RISK' | 'CRITICAL' | 'BLOCKED';

export interface District {
  id: string;
  name: string;
  state: string;
  hq_name?: string;
  latitude: number;
  longitude: number;
  connectivity_status: string;
}

export interface Road {
  id: string;
  road_name: string;
  road_type: string;
  origin: string;
  destination: string;
  distance_km: number;
  base_travel_time_min: number;
  current_status: RoadStatus;
  traffic_level: string;
  accessibility_score: number;
  terrain_type: string;
  geometry_geojson: [number, number][]; // [lng, lat]
}

export interface Bridge {
  id: string;
  road_id?: string;
  name: string;
  river_name?: string;
  latitude: number;
  longitude: number;
  accessibility_status: 'OPEN' | 'WATCH' | 'RESTRICTED' | 'CLOSED';
  load_limit_tons: number;
  water_level_m: number;
  danger_water_level_m: number;
  clearance_status: string;
  geometry_geojson?: any;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  cargo_type: string;
  priority: string;
  capacity_tons: number;
  current_lat: number;
  current_lng: number;
  speed_kmh: number;
  heading_deg: number;
  current_route_id?: string;
  status: string;
  origin: string;
  destination: string;
  updated_at?: string;
  created_at?: string;
  data_lineage?: string;
}

export interface FleetPosition {
  vehicle_id: string;
  lat: number;
  lng: number;
  is_active: boolean;
}

export interface RouteData {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  route_type: 'PRIMARY' | 'ALTERNATE' | 'CONTINGENCY';
  distance_km: number;
  estimated_duration_min: number;
  polyline_geojson: [number, number][]; // [lng, lat]
  is_active: boolean;
  is_blocked: boolean;
  source_engine: string;
}

export interface Hazard {
  id: string;
  hazard_type: string;
  severity: string;
  location_name: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  polygon_geojson: [number, number][][]; // [[[lng, lat], ...]]
  affected_road_ids: string[];
  affected_bridge_ids: string[];
  is_active: boolean;
  is_simulated: boolean;
  description?: string;
}

export interface WeatherRiskInputs {
  heavy_rain: boolean;
  extreme_rain: boolean;
  visibility_risk: boolean;
  wind_risk: boolean;
  weather_severity_score: number;
}

export interface WeatherObservation {
  id?: number;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    state?: string;
  };
  location_name: string;
  latitude: number;
  longitude: number;
  temperature_c?: number;
  precipitation_mm: number;
  rain_mm?: number;
  precipitation_probability: number;
  soil_moisture_m3_m3: number;
  wind_speed_kmh: number;
  wind_direction_deg?: number;
  humidity_percent?: number;
  visibility_m?: number;
  weather_code?: number;
  weather_condition: string;
  warning_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  source: string;
  source_type?: string;
  is_cached?: boolean;
  observed_at: string;
  forecast_updated_at?: string;
  risk_inputs?: WeatherRiskInputs;
}

export interface GeocodingLocation {
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  type?: string;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  formatted_time: string;
  event_type: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';
  title: string;
  description: string;
  metadata?: any;
}

export interface SimulationStatus {
  is_running: boolean;
  scenario_stage: string;
  speed_multiplier: number;
  active_hazard_id?: string | null;
  vehicle_id: string;
  vehicle_lat: number;
  vehicle_lng: number;
  vehicle_heading: number;
  vehicle_speed_kmh: number;
  current_route_id: string;
  route_type: 'PRIMARY' | 'ALTERNATE';
  distance_remaining_km: number;
  original_eta_min: number;
  current_eta_min: number;
  delay_min: number;
  step_index: number;
  total_steps: number;
  fleet_positions?: FleetPosition[];
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  title: string;
  message: string;
  entity_id?: string;
  recommended_action?: string;
  is_active?: boolean;
  status?: string;
  created_at: string;
}

export type AlertItem = Alert;

export interface SupplyManifest {
  id: string;
  supply_type: string;
  name: string;
  quantity_units: number;
  unit_measure: string;
  priority: string;
  origin_depot: string;
  dest_district: string;
  assigned_vehicle_id?: string;
  status: string;
  required_by_hours: number;
  created_at: string;
}

export type SupplyItem = SupplyManifest;

export interface DistrictInventory {
  id: number;
  district_id: string;
  district_name: string;
  supply_type: string;
  current_stock_units: number;
  consumption_rate_per_day: number;
  incoming_units: number;
  incoming_eta_hours: number;
  critical_threshold_units: number;
  stock_status: string;
  last_updated: string;
}

export type DistrictInventoryItem = DistrictInventory;

export interface StockoutMetrics {
  current_stock: number;
  daily_consumption: number;
  hourly_consumption: number;
  hours_until_stockout: number;
  incoming_quantity: number;
  incoming_eta_hours: number;
  expected_stock_at_arrival: number;
  critical_threshold: number;
  shortage_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SAFE' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'STOCKOUT';
  criticality: string;
  recommended_action: string;
}

export interface DistrictAssessment {
  id: number;
  district_id: string;
  district_name: string;
  supply_type: string;
  metrics: StockoutMetrics;
  assigned_vehicle?: string;
  supply_name: string;
}

export interface SupplyImpactGraph {
  road_id: string;
  road_name: string;
  corridor_status: string;
  affected_routes: string[];
  total_vehicles_affected: number;
  vehicles: Array<{
    vehicle_id: string;
    vehicle_number: string;
    cargo_type: string;
    priority: string;
    origin: string;
    destination: string;
  }>;
  total_districts_impacted: number;
  impacted_supplies: Array<{
    district_id: string;
    district_name: string;
    supply_type: string;
    stockout_time_hours: number;
    delayed_eta_hours: number;
    post_reroute_eta_hours: number;
    pre_disruption_status: string;
    disrupted_status: string;
    post_reroute_status: string;
    highest_risk_supply: boolean;
  }>;
  highest_risk_supply: string;
  mitigation_bypass: string;
}

export interface DecisionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  vehicle_id: string;
  target_corridor: string;
  action_type: string;
  title: string;
  rationale: string;
  status: 'RECOMMENDED' | 'EXECUTED' | 'ACTIVE';
}

export interface DecisionResponse {
  scenario_stage: string;
  road_status: string;
  recommendations: DecisionItem[];
}

export interface OptimizationAssignment {
  supply_id: string;
  supply_type: string;
  supply_name: string;
  vehicle_id: string;
  vehicle_number: string;
  priority: string;
  assigned_route_id: string;
  assigned_route_name: string;
  distance_km: number;
  predicted_duration_min: number;
  contextual_cost: number;
  status: string;
}

export interface OptimizationRunResponse {
  run_id: string;
  status: string;
  total_assigned: number;
  unassigned_count: number;
  assignments: OptimizationAssignment[];
  benchmark_comparison: {
    baseline_unconstrained_cost: number;
    context_aware_optimized_cost: number;
    risk_reduction_pct: number;
    delay_mitigated_min: number;
  };
  engine: string;
}

export interface ScenarioStage {
  step: number;
  stage: string;
  time: string;
  description: string;
}

export interface ScenarioItem {
  id: string;
  name: string;
  description: string;
  stages: ScenarioStage[];
}

export interface ScenarioState {
  scenario_id: string;
  scenario_name: string;
  current_step: number;
  total_steps: number;
  is_playing: boolean;
  play_speed: number;
  current_stage: ScenarioStage;
  all_stages: ScenarioStage[];
}

export interface ContextAwareCandidate {
  route_id: string;
  route_name: string;
  origin: string;
  destination: string;
  route_type: 'PRIMARY' | 'ALTERNATE';
  distance_km: number;
  predicted_travel_time_min: number;
  predicted_delay_min: number;
  disruption_risk_score: number;
  dynamic_edge_cost: number;
  reasoning: string[];
  selection_summary?: string;
  polyline_geojson: [number, number][];
  is_recommended: boolean;
  is_blocked: boolean;
}

export interface ContextRouteResponse {
  candidates: ContextAwareCandidate[];
  selected_route: ContextAwareCandidate;
  cargo_priority: string;
  optimization_note: string;
}

export interface FieldReport {
  id: string;
  officer_name: string;
  department: string;
  district: string;
  location_name: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  severity: string;
  description: string;
  photo_url?: string;
  evidence_source?: 'FIELD_UPLOAD' | 'HISTORICAL_REFERENCE' | 'SIMULATION' | 'NO_EVIDENCE_IMAGE';
  idempotency_key?: string;
  sync_state: string;
  timestamp: string;
}

// Phase 4: Deep Learning & Multi-Strategy Types
export type RoutingStrategyMode = 'MODE_A_BASELINE' | 'MODE_B_CONTEXT' | 'MODE_C_NEURAL' | 'MODE_D_HYBRID';

export interface StrategyResult {
  mode: RoutingStrategyMode;
  mode_name: string;
  description: string;
  route_id: string;
  route_name: string;
  distance_km: number;
  predicted_travel_time_min: number;
  predicted_delay_min: number;
  disruption_risk_score: number;
  elevation_gain_m: number;
  max_gradient_pct: number;
  weather_friction_index: number;
  neural_score?: number;
  neural_attention_weight?: number;
  feasibility_status: 'FEASIBLE' | 'VIOLATED' | 'HIGH_RISK';
  feasibility_violations?: string[];
  reasoning: string[];
  is_selected: boolean;
  color_code: string;
  polyline_geojson: [number, number][];
}

export interface DeltaAnalysis {
  time_saved_vs_baseline_min: number;
  distance_diff_km: number;
  risk_reduction_pct: number;
  neural_confidence: number;
}

export interface StrategyComparisonResponse {
  origin: string;
  destination: string;
  cargo_type: string;
  priority: string;
  weather_severity: string;
  active_hazard_count: number;
  strategies: Record<string, StrategyResult>;
  selected_strategy: string;
  delta_analysis: DeltaAnalysis;
  summary: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
  region: string;
}

export interface MultilingualAlertResponse {
  source_alert_id?: string;
  language: string;
  language_name: string;
  native_name: string;
  title: string;
  message: string;
  translated_action_guidance: string;
  generated_at: string;
}

export interface SafeHub {
  id: string;
  name: string;
  hub_type: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  capacity_tons: number;
  current_occupancy_pct: number;
  status: string;
  services: string[];
  contact_phone?: string;
}

export interface SafeHubRanking extends SafeHub {
  distance_km: number;
  route_eta_min: number;
  road_accessibility_score: number;
  hazard_disruption_risk: number;
  composite_safe_score: number;
  is_route_blocked: boolean;
  blocking_reason?: string;
  is_recommended: boolean;
  recommendation_note?: string;
}

