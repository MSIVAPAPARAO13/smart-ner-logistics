from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WeatherRiskInputs(BaseModel):
    heavy_rain: bool = False
    extreme_rain: bool = False
    visibility_risk: bool = False
    wind_risk: bool = False
    weather_severity_score: float = 0.1


class WeatherLocation(BaseModel):
    name: str
    latitude: float
    longitude: float
    state: Optional[str] = None
    country: Optional[str] = "India"
    elevation: Optional[float] = None


class WeatherObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    location_name: str
    latitude: float
    longitude: float
    temperature_c: Optional[float] = None
    precipitation_mm: float = 0.0
    rain_mm: Optional[float] = 0.0
    precipitation_probability: float = 0.0
    soil_moisture_m3_m3: float = 0.35
    wind_speed_kmh: float = 10.0
    wind_direction_deg: Optional[float] = 0.0
    humidity_percent: Optional[float] = 65.0
    visibility_m: Optional[float] = 10000.0
    weather_code: int = 0
    weather_condition: str = "Clear sky"
    warning_level: str = "GREEN"
    source: str = "OPEN_METEO"
    source_type: Optional[str] = "WEATHER_API"
    is_cached: Optional[bool] = False
    observed_at: Optional[datetime] = None
    forecast_updated_at: Optional[str] = None
    risk_inputs: Optional[WeatherRiskInputs] = None


class LocationSearchResponse(BaseModel):
    name: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    type: Optional[str] = "City"
