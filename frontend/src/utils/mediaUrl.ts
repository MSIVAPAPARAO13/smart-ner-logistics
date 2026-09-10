/**
 * Canonical Media URL Helper for SIH26002
 * Ensures image URLs consistently resolve to the FastAPI backend static mount
 * regardless of host, port, or proxy configuration.
 */

const BACKEND_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  return configured.replace(/\/api\/v1$/, '').replace(/\/+$/, '');
})();

export function getMediaUrl(photoPath?: string | null): string {
  if (!photoPath || !photoPath.trim()) {
    return '';
  }

  const p = photoPath.trim();

  // Already a base64 data URL or local blob URL (for offline queue preview)
  if (p.startsWith('data:') || p.startsWith('blob:')) {
    return p;
  }

  // Fully qualified URL
  if (p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }

  // Relative path starting with /static/
  if (p.startsWith('/static/')) {
    return `${BACKEND_BASE_URL}${p}`;
  }

  // Relative path without leading slash
  if (p.startsWith('static/')) {
    return `${BACKEND_BASE_URL}/${p}`;
  }

  // Filename only
  return `${BACKEND_BASE_URL}/static/uploads/${p}`;
}

/**
 * Returns a fallback demo image URL matching the incident category
 */
export function getIncidentFallbackImage(incidentType?: string): string {
  const t = (incidentType || '').toLowerCase();
  if (t.includes('flood') || t.includes('water')) {
    return `${BACKEND_BASE_URL}/static/uploads/flooded_road_demo.jpg`;
  }
  if (t.includes('bridge')) {
    return `${BACKEND_BASE_URL}/static/uploads/bridge_damage_demo.jpg`;
  }
  if (t.includes('landslide') || t.includes('mud')) {
    return `${BACKEND_BASE_URL}/static/uploads/landslide_demo.jpg`;
  }
  if (t.includes('rain') || t.includes('weather')) {
    return `${BACKEND_BASE_URL}/static/uploads/heavy_rainfall_demo.jpg`;
  }
  return `${BACKEND_BASE_URL}/static/uploads/road_debris_demo.jpg`;
}
