from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON
from app.db.base import Base


class Bridge(Base):
    __tablename__ = "bridges"

    id = Column(String, primary_key=True, index=True)
    road_id = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False, index=True)
    river_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accessibility_status = Column(String, default="OPEN")  # OPEN, WATCH, RESTRICTED, CLOSED
    load_limit_tons = Column(Float, default=40.0)
    water_level_m = Column(Float, default=12.5)
    danger_water_level_m = Column(Float, default=18.0)
    clearance_status = Column(String, default="NORMAL")  # NORMAL, ELEVATED_WATER, CRITICAL_SUBMERGENCE
    geometry_geojson = Column(JSON, nullable=True)  # Point or LineString GeoJSON
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
