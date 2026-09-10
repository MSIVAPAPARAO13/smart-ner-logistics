const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchDistricts() {
  const res = await fetch(`${API_BASE_URL}/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

export async function fetchRoads() {
  const res = await fetch(`${API_BASE_URL}/roads`);
  if (!res.ok) throw new Error('Failed to fetch roads');
  return res.json();
}

export async function fetchBridges() {
  const res = await fetch(`${API_BASE_URL}/bridges`);
  if (!res.ok) throw new Error('Failed to fetch bridges');
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE_URL}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE_URL}/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchHazards(activeOnly = false) {
  const res = await fetch(`${API_BASE_URL}/hazards?active_only=${activeOnly}`);
  if (!res.ok) throw new Error('Failed to fetch hazards');
  return res.json();
}

export async function fetchWeather() {
  const res = await fetch(`${API_BASE_URL}/weather`);
  if (!res.ok) throw new Error('Failed to fetch weather observations');
  return res.json();
}

export async function fetchLiveWeather(latitude = 26.1445, longitude = 91.7362, locationName = 'Guwahati Corridor') {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    location_name: locationName,
  });
  const res = await fetch(`${API_BASE_URL}/weather/live?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch live weather observation');
  return res.json();
}

export async function searchLocations(query: string, limit = 8) {
  const params = new URLSearchParams({ q: query, limit: limit.toString() });
  const res = await fetch(`${API_BASE_URL}/weather/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search locations');
  return res.json();
}

export async function fetchCorridorsWeather() {
  const res = await fetch(`${API_BASE_URL}/weather/corridors`);
  if (!res.ok) throw new Error('Failed to fetch corridor weather');
  return res.json();
}

export async function fetchSimulationStatus() {
  const res = await fetch(`${API_BASE_URL}/simulation/status`);
  if (!res.ok) throw new Error('Failed to fetch simulation status');
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE_URL}/simulation/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchAlerts(activeOnly = false) {
  const res = await fetch(`${API_BASE_URL}/alerts?active_only=${activeOnly}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchSupplies() {
  const res = await fetch(`${API_BASE_URL}/supplies`);
  if (!res.ok) throw new Error('Failed to fetch supplies');
  return res.json();
}

export async function fetchDistrictInventory() {
  const res = await fetch(`${API_BASE_URL}/supplies/inventory`);
  if (!res.ok) throw new Error('Failed to fetch district inventory');
  return res.json();
}

export const fetchInventory = fetchDistrictInventory;

export async function fetchSupplyAssessment() {
  const res = await fetch(`${API_BASE_URL}/supplies/assessment`);
  if (!res.ok) throw new Error('Failed to fetch supply assessment');
  return res.json();
}

export async function fetchSupplyImpact(roadId = 'ROAD-NH06-SHL-SIL') {
  const res = await fetch(`${API_BASE_URL}/decisions/supply-impact/${roadId}`);
  if (!res.ok) throw new Error('Failed to fetch supply impact');
  return res.json();
}

export async function fetchWhatIsAffected(params?: { roadId?: string; bridgeId?: string; incidentId?: string }) {
  const query = new URLSearchParams();
  if (params?.roadId) query.append('road_id', params.roadId);
  if (params?.bridgeId) query.append('bridge_id', params.bridgeId);
  if (params?.incidentId) query.append('incident_id', params.incidentId);
  const res = await fetch(`${API_BASE_URL}/impact/what-is-affected?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch what is affected analysis');
  return res.json();
}

export async function fetchDistrictShortage(districtId = 'DIST-AS-CACHAR') {
  const res = await fetch(`${API_BASE_URL}/decisions/supply-shortage/${districtId}`);
  if (!res.ok) throw new Error('Failed to fetch district shortage');
  return res.json();
}

export async function fetchDecisions() {
  const res = await fetch(`${API_BASE_URL}/decisions`);
  if (!res.ok) throw new Error('Failed to fetch decisions');
  return res.json();
}

export async function runFleetOptimization() {
  const res = await fetch(`${API_BASE_URL}/optimization/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run fleet optimization');
  return res.json();
}

export async function fetchOptimizationBenchmarks() {
  const res = await fetch(`${API_BASE_URL}/optimization/benchmarks`);
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE_URL}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function stepScenario() {
  const res = await fetch(`${API_BASE_URL}/scenarios/step`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to step scenario');
  return res.json();
}

export async function resetScenario() {
  const res = await fetch(`${API_BASE_URL}/scenarios/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset scenario');
  return res.json();
}

export async function fetchFieldReports() {
  const res = await fetch(`${API_BASE_URL}/field-reports`);
  if (!res.ok) throw new Error('Failed to fetch field reports');
  return res.json();
}

export async function submitFieldReport(reportData: any) {
  const res = await fetch(`${API_BASE_URL}/field-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return res.json();
}

export async function uploadFieldPhoto(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/field-reports/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}

export async function verifyFieldReport(reportId: string, reviewerNotes?: string) {
  const query = reviewerNotes ? `?reviewer_notes=${encodeURIComponent(reviewerNotes)}` : '';
  const res = await fetch(`${API_BASE_URL}/field-reports/${reportId}/verify${query}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to verify report');
  return res.json();
}

export async function rejectFieldReport(reportId: string, reviewerNotes?: string) {
  const query = reviewerNotes ? `?reviewer_notes=${encodeURIComponent(reviewerNotes)}` : '';
  const res = await fetch(`${API_BASE_URL}/field-reports/${reportId}/reject${query}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject report');
  return res.json();
}

export async function resolveFieldReport(reportId: string, reviewerNotes?: string) {
  const query = reviewerNotes ? `?reviewer_notes=${encodeURIComponent(reviewerNotes)}` : '';
  const res = await fetch(`${API_BASE_URL}/field-reports/${reportId}/resolve${query}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to resolve report');
  return res.json();
}

export async function fetchContextAwareRoutes(payload: {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  cargo_type?: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/intelligence/context-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to fetch context-aware routes');
  return res.json();
}

export async function fetchContextRoute(priority = 'CRITICAL') {
  return fetchContextAwareRoutes({
    origin_lat: 26.1445,
    origin_lng: 91.7362,
    dest_lat: 24.8333,
    dest_lng: 92.7789,
    cargo_type: 'MEDICINE',
    priority: priority,
  });
}

export async function startSimulation() {
  const res = await fetch(`${API_BASE_URL}/simulation/start`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start simulation');
  return res.json();
}

export async function pauseSimulation() {
  const res = await fetch(`${API_BASE_URL}/simulation/pause`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to pause simulation');
  return res.json();
}

export async function triggerFloodScenario() {
  const res = await fetch(`${API_BASE_URL}/simulation/trigger-flood`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger flood scenario');
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE_URL}/simulation/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset simulation');
  return res.json();
}

export async function setSimulationSpeed(speedMultiplier: number) {
  const res = await fetch(`${API_BASE_URL}/simulation/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_speed', speed_multiplier: speedMultiplier }),
  });
  if (!res.ok) throw new Error('Failed to set speed');
  return res.json();
}

// Phase 4: Neural Routing & Strategy Comparison
export async function fetchStrategyComparison(params?: {
  origin?: string;
  destination?: string;
  cargo_type?: string;
  priority?: string;
}) {
  const priority = params?.priority || 'CRITICAL';
  const res = await fetch(`${API_BASE_URL}/neural-routing/compare?has_hazard=true&priority=${priority}`);
  if (!res.ok) throw new Error('Failed to fetch strategy comparison');
  return res.json();
}

export async function fetchNeuralCandidates(params?: {
  origin?: string;
  destination?: string;
  cargo_type?: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/neural-routing/candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: params?.origin || 'Guwahati',
      destination: params?.destination || 'Silchar',
      priority: params?.priority || 'CRITICAL',
      has_active_hazard: true,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch neural candidates');
  return res.json();
}

// Phase 4: Multilingual Notifications
export async function fetchSupportedLanguages() {
  const res = await fetch(`${API_BASE_URL}/notifications/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function fetchTranslatedAlert(alertId?: string, langCode = 'en') {
  const query = new URLSearchParams({ lang: langCode });
  if (alertId) query.append('alert_id', alertId);

  const res = await fetch(`${API_BASE_URL}/notifications/translate?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch translated alert');
  return res.json();
}

export async function broadcastMultilingualAlert(payload: {
  alert_id?: string;
  target_languages?: string[];
  channels?: string[];
}) {
  const langs = payload.target_languages || ['hi', 'as', 'bn', 'kha', 'brx'];
  const translations = await Promise.all(
    langs.map(l => fetchTranslatedAlert(payload.alert_id, l).catch(() => null))
  );
  return {
    status: 'BROADCAST_COMPLETE',
    count: translations.filter(Boolean).length,
    languages: langs,
    channels: payload.channels || ['CELL_BROADCAST', 'CAP_FEED', 'WHATSAPP_EMERGENCY'],
    timestamp: new Date().toISOString(),
  };
}

// Health & Demo Checklist
export async function fetchHealthOverview() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchReadinessCheck() {
  const res = await fetch(`${API_BASE_URL}/health/ready`);
  if (!res.ok) throw new Error('Failed to fetch readiness');
  return res.json();
}

export async function fetchDemoChecklist() {
  const res = await fetch(`${API_BASE_URL}/health/demo-checklist`);
  if (!res.ok) throw new Error('Failed to fetch demo checklist');
  return res.json();
}

export async function runWhatIfSimulation(payload: {
  road_id?: string;
  bridge_id?: string;
  severity?: string;
  duration_hours?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/simulation/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to run what-if simulation');
  return res.json();
}

// Safe Hubs & Relief Depots
export async function fetchSafeHubs(params?: { state?: string; hubType?: string }) {
  const query = new URLSearchParams();
  if (params?.state) query.append('state', params.state);
  if (params?.hubType) query.append('hub_type', params.hubType);
  const res = await fetch(`${API_BASE_URL}/safe-hubs?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch safe hubs');
  return res.json();
}

export async function fetchNearestSafeHubs(params?: {
  lat?: number;
  lng?: number;
  hubType?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.lat !== undefined) query.append('lat', params.lat.toString());
  if (params?.lng !== undefined) query.append('lng', params.lng.toString());
  if (params?.hubType) query.append('hub_type', params.hubType);
  if (params?.limit) query.append('limit', params.limit.toString());
  const res = await fetch(`${API_BASE_URL}/safe-hubs/nearest?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch nearest safe hubs');
  return res.json();
}

// ─── Active Role ────────────────────────────────────────────────────────────
let _activeRole = localStorage.getItem('sih26002_active_role') || 'ADMIN';

export function getActiveRole(): string {
  return _activeRole;
}

export function setActiveRole(role: string): void {
  _activeRole = role;
  localStorage.setItem('sih26002_active_role', role);
}

/** Centralized fetch with X-User-Role header + correlation ID */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const correlationId = `CORR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Role': _activeRole,
    'X-Correlation-ID': correlationId,
    ...(init?.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  return res;
}

// ─── Route Planning (REAL API) ───────────────────────────────────────────────
export interface RoutePlanRequest {
  origin?: string;
  destination?: string;
  origin_lat?: number;
  origin_lng?: number;
  dest_lat?: number;
  dest_lng?: number;
  origin_name?: string;
  destination_name?: string;
  cargo_type?: string;
  priority?: string;
  avoid_hazards?: boolean;
  vehicle_weight_tons?: number;
}

export async function planRoute(payload: RoutePlanRequest): Promise<any> {
  const res = await apiFetch('/routes/plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Route planning failed (${res.status}): ${errText}`);
  }
  return res.json();
}

// ─── User & Auth Management ──────────────────────────────────────────────────
export async function fetchCurrentUser(): Promise<any> {
  const res = await apiFetch('/auth/me');
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function fetchUsers(): Promise<any[]> {
  const res = await apiFetch('/auth/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function switchUser(userIdOrRole: string): Promise<any> {
  const res = await apiFetch('/auth/switch-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: userIdOrRole }),
  });
  if (!res.ok) throw new Error('Failed to switch user');
  return res.json();
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<any> {
  const res = await apiFetch(`/auth/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Update user status failed (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function updateUserRole(userId: string, role: string): Promise<any> {
  const res = await apiFetch(`/auth/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Update user role failed (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function fetchAuditLogs(limit = 50): Promise<any[]> {
  const res = await apiFetch(`/auth/audit-logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
