import math
import logging
from typing import List, Tuple
from app.services.elevation_client import elevation_client

logger = logging.getLogger("sih26002.elevation_service")


class ElevationService:
    """
    Analyzes terrain elevation gradients and derives slope features along road segments.
    """

    async def calculate_corridor_slope(self, coordinates: List[List[float]]) -> Tuple[float, float, float]:
        """
        coordinates: [[lng, lat], ...]
        Returns: (avg_elevation_m, max_elevation_m, avg_slope_deg)
        """
        if not coordinates or len(coordinates) < 2:
            return 80.0, 80.0, 2.0

        sample_rate = max(1, len(coordinates) // 10)
        sampled = coordinates[::sample_rate]
        lats = [pt[1] for pt in sampled]
        lngs = [pt[0] for pt in sampled]

        elevations = await elevation_client.get_elevations(lats, lngs)
        if not elevations:
            return 120.0, 150.0, 5.0

        avg_elev = sum(elevations) / len(elevations)
        max_elev = max(elevations)

        # Calculate slope differentials
        slopes = []
        for i in range(len(elevations) - 1):
            elev_diff = abs(elevations[i + 1] - elevations[i])
            # Approx distance in meters (~111,000m per degree lat/lng)
            lat_diff = (lats[i + 1] - lats[i]) * 111000
            lng_diff = (lngs[i + 1] - lngs[i]) * 111000 * math.cos(math.radians(lats[i]))
            dist_m = math.sqrt(lat_diff**2 + lng_diff**2) or 1000.0
            
            slope_rad = math.atan2(elev_diff, dist_m)
            slopes.append(math.degrees(slope_rad))

        avg_slope = (sum(slopes) / len(slopes)) if slopes else 4.0
        return round(avg_elev, 1), round(max_elev, 1), round(avg_slope, 1)


elevation_service = ElevationService()
