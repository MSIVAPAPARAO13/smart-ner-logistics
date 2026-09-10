import logging
from typing import Any, Dict, List, Optional, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger("sih26002.osrm")


class OSRMClient:
    """
    Isolated async HTTP client for the Open Source Routing Machine (OSRM).
    Fetches real road routes, geometries, distances, and duration.
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 10.0):
        self.base_url = base_url or settings.OSRM_BASE_URL
        self.timeout = timeout

    async def get_route(
        self,
        coordinates: List[Tuple[float, float]],  # [(lat, lng), ...]
        alternatives: bool = True,
        overview: str = "full",
        geometries: str = "geojson",
    ) -> Optional[Dict[str, Any]]:
        """
        Queries OSRM driving service.
        Note: OSRM expects coordinates in lng,lat format in the URL path.
        """
        if len(coordinates) < 2:
            raise ValueError("At least 2 coordinates required for routing")

        # Format as "lng,lat;lng,lat;..."
        coords_str = ";".join([f"{lng:.6f},{lat:.6f}" for lat, lng in coordinates])
        url = f"{self.base_url}/route/v1/driving/{coords_str}"
        params = {
            "overview": overview,
            "geometries": geometries,
            "alternatives": "true" if alternatives else "false",
            "steps": "true",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == "Ok" and "routes" in data and len(data["routes"]) > 0:
                        return data
                    else:
                        logger.warning(f"OSRM returned non-Ok code: {data.get('code')}")
                else:
                    logger.warning(f"OSRM HTTP error {response.status_code}: {response.text}")
        except httpx.RequestError as exc:
            logger.warning(f"OSRM network error: {exc}. Falling back to internal topological graph.")
        except Exception as exc:
            logger.error(f"Unexpected error querying OSRM: {exc}")

        return None

    def parse_osrm_response(self, osrm_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parses OSRM routes into standardized structured dicts.
        """
        parsed_routes = []
        routes = osrm_data.get("routes", [])
        for idx, r in enumerate(routes):
            distance_meters = r.get("distance", 0.0)
            duration_seconds = r.get("duration", 0.0)
            geometry = r.get("geometry", {})
            coordinates = geometry.get("coordinates", [])
            legs = r.get("legs", [])
            steps = []
            for leg in legs:
                for s in leg.get("steps", []):
                    maneuver = s.get("maneuver", {})
                    m_type = maneuver.get("type", "turn")
                    m_modifier = maneuver.get("modifier", "")
                    r_name = s.get("name") or "Connecting Corridor"
                    instruction = f"{m_type.capitalize()} {m_modifier} onto {r_name}".strip() if m_modifier else f"{m_type.capitalize()} onto {r_name}".strip()
                    steps.append({
                        "instruction": instruction,
                        "road_name": r_name,
                        "distance_km": round(s.get("distance", 0) / 1000.0, 2),
                        "duration_min": round(s.get("duration", 0) / 60.0, 1),
                        "maneuver_type": m_type,
                    })

            parsed_routes.append({
                "route_index": idx,
                "distance_km": round(distance_meters / 1000.0, 2),
                "duration_min": round(duration_seconds / 60.0, 1),
                "coordinates": coordinates,
                "steps": steps,
                "type": "PRIMARY" if idx == 0 else "ALTERNATE",
            })

        return parsed_routes


osrm_client = OSRMClient()
