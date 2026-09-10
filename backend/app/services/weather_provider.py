import abc
import time
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger("sih26002.weather_provider")

# Official WMO Weather interpretation codes (WW) mapped to logistics warning levels
WEATHER_CODE_MAP: Dict[int, Tuple[str, str, float]] = {
    0: ("Clear sky", "GREEN", 0.05),
    1: ("Mainly clear", "GREEN", 0.08),
    2: ("Partly cloudy", "GREEN", 0.12),
    3: ("Overcast", "GREEN", 0.18),
    45: ("Foggy", "YELLOW", 0.40),
    48: ("Depositing rime fog", "YELLOW", 0.45),
    51: ("Light drizzle", "GREEN", 0.20),
    53: ("Moderate drizzle", "YELLOW", 0.35),
    55: ("Dense drizzle", "YELLOW", 0.50),
    61: ("Slight rain", "YELLOW", 0.35),
    63: ("Moderate rain", "YELLOW", 0.55),
    65: ("Heavy rain", "ORANGE", 0.75),
    66: ("Freezing light rain", "ORANGE", 0.80),
    67: ("Freezing heavy rain", "RED", 0.90),
    71: ("Slight snow fall", "YELLOW", 0.40),
    73: ("Moderate snow fall", "ORANGE", 0.65),
    75: ("Heavy snow fall", "RED", 0.85),
    77: ("Snow grains", "YELLOW", 0.30),
    80: ("Slight rain showers", "YELLOW", 0.35),
    81: ("Moderate rain showers", "YELLOW", 0.55),
    82: ("Violent rain showers", "RED", 0.90),
    85: ("Slight snow showers", "YELLOW", 0.45),
    86: ("Heavy snow showers", "RED", 0.85),
    95: ("Thunderstorm", "ORANGE", 0.80),
    96: ("Thunderstorm with slight hail", "RED", 0.90),
    99: ("Thunderstorm with heavy hail", "RED", 0.95),
}


class BaseWeatherProvider(abc.ABC):
    """Abstract Base Class for Weather Providers."""

    @abc.abstractmethod
    async def get_weather(
        self, latitude: float, longitude: float, location_name: str = ""
    ) -> Optional[Dict[str, Any]]:
        """Fetch weather observation for given coordinates."""
        pass


class OpenMeteoWeatherProvider(BaseWeatherProvider):
    """
    Primary Weather Provider for SIH26002 using official Open-Meteo APIs.
    Requires ZERO API keys.
    Endpoint: https://api.open-meteo.com/v1/forecast
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 8.0):
        self.base_url = base_url or settings.OPEN_METEO_BASE_URL
        self.timeout = timeout

    async def get_weather(
        self, latitude: float, longitude: float, location_name: str = ""
    ) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
            "hourly": "soil_moisture_0_to_1cm,precipitation_probability,visibility",
            "timezone": "Asia/Kolkata",
            "forecast_days": 1,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_response(data, latitude, longitude, location_name)
                else:
                    logger.warning(
                        f"Open-Meteo HTTP {response.status_code} for ({latitude}, {longitude}): {response.text}"
                    )
        except httpx.RequestError as exc:
            logger.warning(f"Open-Meteo network error for ({latitude}, {longitude}): {exc}")
        except Exception as exc:
            logger.error(f"Unexpected Open-Meteo query error: {exc}")

        return None

    async def get_batch_weather(
        self, points: List[Tuple[float, float, str]]
    ) -> List[Dict[str, Any]]:
        """
        Batch query multiple NER coordinate pairs in a single API call where possible.
        points: [(lat, lng, location_name), ...]
        """
        if not points:
            return []

        lats = ",".join([str(round(p[0], 4)) for p in points])
        lngs = ",".join([str(round(p[1], 4)) for p in points])
        url = f"{self.base_url}/forecast"
        params = {
            "latitude": lats,
            "longitude": lngs,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m",
            "hourly": "soil_moisture_0_to_1cm,precipitation_probability",
            "timezone": "Asia/Kolkata",
            "forecast_days": 1,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout + 4.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    raw_data = response.json()
                    # Open-Meteo returns a list of objects when multi-coordinates are queried
                    if isinstance(raw_data, list):
                        results = []
                        for idx, item in enumerate(raw_data):
                            loc_name = points[idx][2] if idx < len(points) else f"NER Corridor Pt {idx+1}"
                            results.append(
                                self._normalize_response(
                                    item, points[idx][0], points[idx][1], loc_name
                                )
                            )
                        return results
                    elif isinstance(raw_data, dict):
                        loc_name = points[0][2] if points else "NER Location"
                        return [self._normalize_response(raw_data, points[0][0], points[0][1], loc_name)]
        except Exception as exc:
            logger.warning(f"Open-Meteo batch query failed: {exc}")

        # Fallback to individual sequential queries
        results = []
        for lat, lng, name in points:
            res = await self.get_weather(lat, lng, name)
            if res:
                results.append(res)
        return results

    def _normalize_response(
        self, data: Dict[str, Any], latitude: float, longitude: float, location_name: str
    ) -> Dict[str, Any]:
        current = data.get("current", {})
        hourly = data.get("hourly", {})

        weather_code = int(current.get("weather_code", 0))
        condition_desc, warning_level, severity_base = WEATHER_CODE_MAP.get(
            weather_code, ("Fair weather", "GREEN", 0.1)
        )

        precip_mm = float(current.get("precipitation", current.get("rain", 0.0)))
        wind_speed = float(current.get("wind_speed_10m", 8.0))
        wind_dir = float(current.get("wind_direction_10m", 0.0))
        humidity = float(current.get("relative_humidity_2m", 65.0))
        temp_c = float(current.get("temperature_2m", 25.0))

        # Hourly extracts
        soil_moisture_list = hourly.get("soil_moisture_0_to_1cm", [])
        soil_moisture = float(soil_moisture_list[0]) if soil_moisture_list else 0.35

        precip_prob_list = hourly.get("precipitation_probability", [])
        precip_prob = float(precip_prob_list[0]) if precip_prob_list else min(100.0, precip_mm * 5.0)

        visibility_list = hourly.get("visibility", [])
        visibility_m = float(visibility_list[0]) if visibility_list else 10000.0

        # Derived risk inputs
        heavy_rain = precip_mm >= 20.0
        extreme_rain = precip_mm >= 50.0
        visibility_risk = visibility_m < 1500.0 or weather_code in [45, 48]
        wind_risk = wind_speed >= 40.0

        if extreme_rain or weather_code in [82, 96, 99]:
            warning_level = "RED"
        elif heavy_rain or weather_code in [65, 95] or wind_risk:
            warning_level = "ORANGE"
        elif precip_mm > 5.0 or visibility_risk or weather_code in [45, 53, 55, 61, 63, 80, 81]:
            warning_level = "YELLOW"
        else:
            warning_level = "GREEN"

        severity_score = min(
            1.0,
            round(
                severity_base
                + (precip_mm / 100.0) * 0.45
                + (soil_moisture / 0.70) * 0.25
                + (1.0 if wind_risk else 0.0) * 0.15,
                3,
            ),
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        return {
            "location": {
                "name": location_name or "Northeast India Operational Area",
                "latitude": latitude,
                "longitude": longitude,
            },
            "location_name": location_name or "Northeast India Operational Area",
            "latitude": latitude,
            "longitude": longitude,
            "source": "OPEN_METEO",
            "source_type": "WEATHER_API",
            "observed_at": now_iso,
            "forecast_updated_at": now_iso,
            "temperature_c": temp_c,
            "precipitation_mm": precip_mm,
            "rain_mm": precip_mm,
            "precipitation_probability": precip_prob,
            "soil_moisture_m3_m3": soil_moisture,
            "wind_speed_kmh": wind_speed,
            "wind_direction_deg": wind_dir,
            "humidity_percent": humidity,
            "visibility_m": visibility_m,
            "weather_code": weather_code,
            "weather_condition": condition_desc,
            "warning_level": warning_level,
            "is_cached": False,
            "risk_inputs": {
                "heavy_rain": heavy_rain,
                "extreme_rain": extreme_rain,
                "visibility_risk": visibility_risk,
                "wind_risk": wind_risk,
                "weather_severity_score": severity_score,
            },
        }


class IMDWeatherProvider(BaseWeatherProvider):
    """
    Optional IMD Weather Adapter.
    Never blocks startup or execution if credentials are missing or rejected.
    """

    def __init__(self, api_key: str = "", enabled: bool = False):
        self.api_key = api_key or settings.IMD_API_KEY
        self.enabled = enabled or settings.ENABLE_IMD_ADAPTER

    async def get_weather(
        self, latitude: float, longitude: float, location_name: str = ""
    ) -> Optional[Dict[str, Any]]:
        if not self.enabled or not self.api_key:
            return None

        # When approved in future, this can invoke official IMD endpoints.
        logger.info(f"IMD Provider invoked for {location_name} (Optional Adapter)")
        return {
            "location_name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "source": "IMD_GOVERNMENT",
            "source_type": "GOVERNMENT_API",
            "observed_at": datetime.now(timezone.utc).isoformat(),
            "warning_level": "YELLOW",
            "weather_condition": "Monsoon Advisory Bulletin",
        }


class CachedWeatherProvider:
    """
    Manages in-memory TTL caching and climatology fallback.
    Prevents repeated network queries for identical coordinates.
    """

    def __init__(self, ttl_minutes: int = 15):
        self.ttl_seconds = ttl_minutes * 60.0
        self._cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}

    def get_cache_key(self, latitude: float, longitude: float) -> str:
        return f"{round(latitude, 3)}_{round(longitude, 3)}"

    def get(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        key = self.get_cache_key(latitude, longitude)
        now = time.time()
        if key in self._cache:
            ts, data = self._cache[key]
            if now - ts < self.ttl_seconds:
                cached_data = dict(data)
                cached_data["is_cached"] = True
                cached_data["source"] = "OPEN_METEO"
                cached_data["source_type"] = "CACHE"
                return cached_data
            else:
                del self._cache[key]
        return None

    def put(self, latitude: float, longitude: float, data: Dict[str, Any]):
        key = self.get_cache_key(latitude, longitude)
        self._cache[key] = (time.time(), data)

    def get_climatology_fallback(
        self, latitude: float, longitude: float, location_name: str = ""
    ) -> Dict[str, Any]:
        """
        Regional fallback based on Northeast India monsoon climatology.
        Explicitly marked with CLIMATOLOGY_FALLBACK lineage.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        return {
            "location": {
                "name": location_name or "Northeast India Corridor",
                "latitude": latitude,
                "longitude": longitude,
            },
            "location_name": location_name or "Northeast India Corridor",
            "latitude": latitude,
            "longitude": longitude,
            "source": "CLIMATOLOGY_FALLBACK",
            "source_type": "FALLBACK",
            "observed_at": now_iso,
            "forecast_updated_at": now_iso,
            "temperature_c": 26.5,
            "precipitation_mm": 5.0,
            "rain_mm": 5.0,
            "precipitation_probability": 30.0,
            "soil_moisture_m3_m3": 0.36,
            "wind_speed_kmh": 10.0,
            "wind_direction_deg": 180.0,
            "humidity_percent": 75.0,
            "visibility_m": 8000.0,
            "weather_code": 2,
            "weather_condition": "Partly cloudy (Regional Baseline)",
            "warning_level": "GREEN",
            "is_cached": False,
            "risk_inputs": {
                "heavy_rain": False,
                "extreme_rain": False,
                "visibility_risk": False,
                "wind_risk": False,
                "weather_severity_score": 0.15,
            },
        }
