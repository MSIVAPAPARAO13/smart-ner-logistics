from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.db.base import Base


class Road(Base):
    __tablename__ = "roads"

    id = Column(String, primary_key=True, index=True)
    road_name = Column(String, nullable=False, index=True)
    road_type = Column(String, default="NATIONAL_HIGHWAY")  # NATIONAL_HIGHWAY, STATE_HIGHWAY, RURAL_ROAD
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)
    base_travel_time_min = Column(Float, nullable=False)
    current_status = Column(String, default="OPEN")  # OPEN, WATCH, RISK, CRITICAL, BLOCKED
    traffic_level = Column(String, default="NORMAL")  # LOW, NORMAL, HEAVY, CONGESTED
    accessibility_score = Column(Float, default=100.0)  # 0.0 to 100.0
    terrain_type = Column(String, default="HILLY")  # HILLY, VALLEY, PLAIN, GORGE
    geometry_geojson = Column(JSON, nullable=False)  # GeoJSON LineString coordinates
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
