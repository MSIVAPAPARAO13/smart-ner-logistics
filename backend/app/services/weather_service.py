import time
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.weather import WeatherObservation
from app.services.weather_provider import (
    OpenMeteoWeatherProvider,
    IMDWeatherProvider,
    CachedWeatherProvider,
)
from app.core.config import settings

logger = logging.getLogger("sih26002.weather_service")


class WeatherService:
    """
    Tiered Weather Intelligence Service:
    1. Cached Provider (In-memory TTL cache + DB history)
    2. Open-Meteo Provider (Primary Live Weather Source - Zero Credentials)
    3. Optional IMD Adapter (Graceful Government Advisory Interface)
    4. Regional Climatology Fallback
    """

    def __init__(self):
        self.open_meteo_provider = OpenMeteoWeatherProvider()
        self.cached_provider = CachedWeatherProvider(ttl_minutes=settings.WEATHER_CACHE_TTL_MINUTES)
        self.imd_provider = IMDWeatherProvider(
            api_key=settings.IMD_API_KEY, enabled=settings.ENABLE_IMD_ADAPTER
        )

    async def get_weather_for_corridor(
        self,
        location_name: str,
        latitude: float,
        longitude: float,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Fetch normalized weather observation for location with caching and transparent data lineage.
        """
        # 1. Check in-memory / TTL cache
        cached = self.cached_provider.get(latitude, longitude)
        if cached:
            cached["location_name"] = location_name
            cached["location"]["name"] = location_name
            logger.info(
                f"Weather provider: Open-Meteo | Location: {location_name} ({latitude:.2f}, {longitude:.2f}) | Status: SUCCESS | Cache: HIT"
            )
            return cached

        # 2. Query Primary Live Weather Source (Open-Meteo)
        obs = await self.open_meteo_provider.get_weather(latitude, longitude, location_name)
        if obs:
            logger.info(
                f"Weather provider: Open-Meteo | Location: {location_name} | Status: SUCCESS | Cache: MISS"
            )
            self.cached_provider.put(latitude, longitude, obs)

            # Persist observation to database if DB session provided
            if db:
                self._persist_observation_to_db(db, obs, location_name, latitude, longitude)

            # Optional non-blocking IMD advisory enrichment
            if settings.ENABLE_IMD_ADAPTER:
                try:
                    imd_data = await self.imd_provider.get_weather(latitude, longitude, location_name)
                    if imd_data:
                        obs["imd_advisory"] = imd_data
                except Exception as exc:
                    logger.debug(f"Optional IMD adapter skipped: {exc}")

            return obs

        # 3. Fallback: Regional Climatology Baseline
        logger.warning(
            f"Weather provider: Open-Meteo | Location: {location_name} | Status: FAILED | Fallback: REGIONAL_CLIMATOLOGY"
        )
        fallback = self.cached_provider.get_climatology_fallback(latitude, longitude, location_name)
        return fallback

    def _persist_observation_to_db(
        self,
        db: Session,
        obs: Dict[str, Any],
        location_name: str,
        latitude: float,
        longitude: float,
    ):
        try:
            db_obs = WeatherObservation(
                location_name=location_name,
                latitude=latitude,
                longitude=longitude,
                temperature_c=obs.get("temperature_c"),
                precipitation_mm=obs.get("precipitation_mm", 0.0),
                precipitation_probability=obs.get("precipitation_probability", 0.0),
                soil_moisture_m3_m3=obs.get("soil_moisture_m3_m3", 0.35),
                wind_speed_kmh=obs.get("wind_speed_kmh", 10.0),
                weather_code=obs.get("weather_code", 0),
                weather_condition=obs.get("weather_condition", "Clear sky"),
                warning_level=obs.get("warning_level", "GREEN"),
                source=obs.get("source", "OPEN_METEO"),
                observed_at=datetime.now(timezone.utc),
            )
            db.add(db_obs)
            db.commit()
        except Exception as exc:
            logger.warning(f"Failed to persist weather observation to DB: {exc}")


weather_service = WeatherService()

