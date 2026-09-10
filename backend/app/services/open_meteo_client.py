import logging
from typing import Any, Dict, Optional, Tuple, List
from app.services.weather_provider import OpenMeteoWeatherProvider, CachedWeatherProvider

logger = logging.getLogger("sih26002.weather")

class OpenMeteoClient:
    """
    Client for Open-Meteo weather and soil moisture parameters.
    Fully decoupled from IMD and requires zero credentials.
    """

    def __init__(self):
        self.provider = OpenMeteoWeatherProvider()
        self.cache = CachedWeatherProvider()

    async def get_current_weather(self, latitude: float, longitude: float, location_name: str = "") -> Dict[str, Any]:
        """Fetch current weather with normalized schema and data lineage."""
        result = await self.provider.get_weather(latitude, longitude, location_name)
        if result:
            return result

        # Graceful climatological fallback if offline
        logger.warning(f"Open-Meteo live query failed for ({latitude}, {longitude}). Using regional fallback.")
        return self.cache.get_climatology_fallback(latitude, longitude, location_name)

    async def get_corridor_weather(self, points: List[Tuple[float, float, str]]) -> List[Dict[str, Any]]:
        """Batch query weather observations across logistics corridors."""
        return await self.provider.get_batch_weather(points)


open_meteo_client = OpenMeteoClient()

