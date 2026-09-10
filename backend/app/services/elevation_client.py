import logging
from typing import List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("sih26002.elevation")


class ElevationClient:
    """
    Client for Open-Meteo elevation API to evaluate terrain features & slope.
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.OPEN_METEO_ELEVATION_URL

    async def get_elevations(self, latitudes: List[float], longitudes: List[float]) -> List[float]:
        if not latitudes or not longitudes:
            return []

        lat_str = ",".join([f"{lat:.4f}" for lat in latitudes])
        lng_str = ",".join([f"{lng:.4f}" for lng in longitudes])

        url = f"{self.base_url}?latitude={lat_str}&longitude={lng_str}"

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("elevation", [50.0] * len(latitudes))
        except Exception as exc:
            logger.warning(f"Elevation query error: {exc}. Using fallback elevation estimates.")

        return [120.0] * len(latitudes)


elevation_client = ElevationClient()
