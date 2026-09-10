import time
import hashlib
import logging
from typing import Any, Dict, List, Optional, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger("sih26002.google_routes")


class GoogleRoutesClient:
    """
    Dedicated async client for Google Maps Platform Routes API v2.
    Supports ComputeRoutes and ComputeRouteMatrix with:
    - Server-side secret isolation (never exposed to client)
    - Field mask optimization
    - Request deduplication & short-lived in-memory caching
    - Circuit-breaking & exponential backoff
    - Graceful fallback to OSRM / NetworkX on failure
    """

    COMPUTE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"
    COMPUTE_MATRIX_URL = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"

    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout_seconds: float = 5.0,
        cache_ttl_seconds: int = 300,
    ):
        self.api_key = api_key or settings.GOOGLE_MAPS_API_KEY
        self.timeout = timeout_seconds
        self.cache_ttl = cache_ttl_seconds
        
        # Deduplication & Short-lived cache: key -> (timestamp, data)
        self._cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        
        # Circuit breaker state
        self._consecutive_failures: int = 0
        self._circuit_open_until: float = 0.0
        self._circuit_cooldown_seconds: float = 60.0

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("REPLACE"))

    @property
    def cache(self) -> Dict[str, Tuple[float, Dict[str, Any]]]:
        return self._cache

    def _is_circuit_open(self) -> bool:
        if self._consecutive_failures >= 3:
            now = time.time()
            if now < self._circuit_open_until:
                return True
            # Cooldown expired, half-open
            self._consecutive_failures = 0
        return False

    def _record_success(self):
        self._consecutive_failures = 0

    def _record_failure(self):
        self._consecutive_failures += 1
        if self._consecutive_failures >= 3:
            self._circuit_open_until = time.time() + self._circuit_cooldown_seconds
            logger.warning(
                f"Google Routes circuit opened for {self._circuit_cooldown_seconds}s "
                f"after {self._consecutive_failures} consecutive failures. Routing will fallback to OSRM/NetworkX."
            )

    def _make_cache_key(self, payload: Dict[str, Any]) -> str:
        serialized = str(sorted(payload.items()))
        return hashlib.md5(serialized.encode("utf-8")).hexdigest()

    async def compute_routes(
        self,
        origin_lat: Optional[float] = None,
        origin_lng: Optional[float] = None,
        dest_lat: Optional[float] = None,
        dest_lng: Optional[float] = None,
        origin: Optional[Tuple[float, float]] = None,
        destination: Optional[Tuple[float, float]] = None,
        intermediates: Optional[List[Tuple[float, float]]] = None,
        travel_mode: str = "DRIVE",
        routing_preference: str = "TRAFFIC_AWARE",
        compute_alternative_routes: bool = True,
    ) -> Optional[Dict[str, Any]]:
        """
        Calls ComputeRoutes API with field masks.
        Accepts coordinates as either (origin_lat, origin_lng, dest_lat, dest_lng)
        or (origin=(lat, lng), destination=(lat, lng)).
        Returns standardized dictionary or None on error/unconfigured.
        """
        if origin:
            origin_lat, origin_lng = origin
        if destination:
            dest_lat, dest_lng = destination

        if origin_lat is None or origin_lng is None or dest_lat is None or dest_lng is None:
            logger.warning("compute_routes called without valid origin or destination coordinates.")
            return None

        if not self.is_configured:
            logger.debug("Google Routes API key not configured; skipping to OSRM fallback.")
            return None

        if self._is_circuit_open():
            logger.debug("Google Routes circuit is currently OPEN; skipping to OSRM fallback.")
            return None

        body: Dict[str, Any] = {
            "origin": {
                "location": {
                    "latLng": {"latitude": origin_lat, "longitude": origin_lng}
                }
            },
            "destination": {
                "location": {
                    "latLng": {"latitude": dest_lat, "longitude": dest_lng}
                }
            },
            "travelMode": travel_mode,
            "routingPreference": routing_preference,
            "computeAlternativeRoutes": compute_alternative_routes,
            "units": "METRIC",
        }

        if intermediates:
            body["intermediates"] = [
                {"location": {"latLng": {"latitude": lat, "longitude": lng}}}
                for lat, lng in intermediates
            ]

        # Check deduplication cache
        cache_key = self._make_cache_key(body)
        now = time.time()
        if cache_key in self._cache:
            ts, cached_data = self._cache[cache_key]
            if now - ts < self.cache_ttl:
                logger.debug("Returning cached Google Routes calculation (server-side deduplication).")
                return cached_data

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key.strip(),
            "X-Goog-FieldMask": (
                "routes.duration,"
                "routes.distanceMeters,"
                "routes.polyline.encodedPolyline,"
                "routes.description,"
                "routes.warnings,"
                "routes.routeLabels"
            ),
        }

        # Attempt call with exponential backoff for transient issues
        max_attempts = 2
        for attempt in range(max_attempts):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(self.COMPUTE_ROUTES_URL, json=body, headers=headers)
                    if response.status_code == 200:
                        data = response.json()
                        self._record_success()
                        self._cache[cache_key] = (now, data)
                        logger.info("Successfully fetched routes from Google Routes API v2.")
                        return data
                    elif response.status_code in [429, 500, 502, 503, 504]:
                        logger.warning(
                            f"Google Routes transient HTTP {response.status_code} (attempt {attempt+1}/{max_attempts})."
                        )
                        if attempt < max_attempts - 1:
                            time.sleep(0.5 * (2**attempt))
                            continue
                        self._record_failure()
                    else:
                        logger.warning(f"Google Routes returned non-retriable HTTP {response.status_code}.")
                        self._record_failure()
                        return None
            except httpx.RequestError as exc:
                logger.warning(f"Google Routes network connection error: {exc}")
                if attempt == max_attempts - 1:
                    self._record_failure()
            except Exception as exc:
                logger.error(f"Unexpected Google Routes error: {exc}")
                self._record_failure()
                return None

        return None

    def decode_polyline(self, encoded: str) -> List[List[float]]:
        """
        Decodes a Google encoded polyline string into GeoJSON coordinates [[lng, lat], ...].
        """
        if not encoded:
            return []
        
        points = []
        index = 0
        lat = 0
        lng = 0
        length = len(encoded)

        while index < length:
            b = 0
            shift = 0
            result = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            dlat = ~(result >> 1) if (result & 1) else (result >> 1)
            lat += dlat

            shift = 0
            result = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            dlng = ~(result >> 1) if (result & 1) else (result >> 1)
            lng += dlng

            points.append([round(lng * 1e-5, 6), round(lat * 1e-5, 6)])

        return points

    def parse_google_routes(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parses Google Routes response into standardized application candidate structures.
        """
        parsed = []
        routes = data.get("routes", [])
        for idx, r in enumerate(routes):
            dist_m = r.get("distanceMeters", 0)
            duration_str = r.get("duration", "0s")
            duration_sec = float(duration_str.rstrip("s")) if isinstance(duration_str, str) and duration_str.endswith("s") else 0.0
            
            encoded_poly = r.get("polyline", {}).get("encodedPolyline", "")
            coords = self.decode_polyline(encoded_poly)

            parsed.append({
                "route_index": idx,
                "distance_km": round(dist_m / 1000.0, 2),
                "duration_min": round(duration_sec / 60.0, 1),
                "coordinates": coords,
                "source": "GOOGLE_ROUTES",
                "description": r.get("description", f"Google Route Candidate #{idx+1}"),
            })
        return parsed


google_routes_client = GoogleRoutesClient()
