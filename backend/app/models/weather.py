from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_name = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=True)
    precipitation_mm = Column(Float, default=0.0)
    precipitation_probability = Column(Float, default=0.0)
    soil_moisture_m3_m3 = Column(Float, default=0.35)  # Volumetric soil water content
    wind_speed_kmh = Column(Float, default=10.0)
    weather_code = Column(Integer, default=0)
    weather_condition = Column(String, default="Clear sky")
    warning_level = Column(String, default="GREEN")  # GREEN, YELLOW, ORANGE, RED
    source = Column(String, default="OPEN_METEO")  # OPEN_METEO, IMD_ADAPTER, SIMULATED
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)
