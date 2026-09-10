from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "SIH26002 - NER Accessibility & Logistics Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "sih26002_development_secret_key_change_in_production"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./sih26002.db"

    # Static File Uploads
    UPLOAD_DIR: str = ""


    # Routing
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    OSRM_TIMEOUT_SECONDS: float = 10.0

    # Weather & Elevation & Geocoding
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    OPEN_METEO_ELEVATION_URL: str = "https://api.open-meteo.com/v1/elevation"
    OPEN_METEO_GEOCODING_URL: str = "https://geocoding-api.open-meteo.com/v1/search"
    WEATHER_CACHE_TTL_MINUTES: int = 15
    ENABLE_IMD_ADAPTER: bool = False  # IMD is strictly optional; never blocks startup
    IMD_API_KEY: str = ""

    # Optional Routing Keys
    GOOGLE_MAPS_API_KEY: str = ""
    MAPBOX_ACCESS_TOKEN: str = ""

    # Geography / NER Center (Guwahati reference)
    DEFAULT_LATITUDE: float = 26.1445
    DEFAULT_LONGITUDE: float = 91.7362
    DEFAULT_ZOOM: int = 8

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
import os
if not settings.UPLOAD_DIR:
    settings.UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads"))
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

