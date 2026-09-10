from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, Text
from app.db.base import Base


class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(String, primary_key=True, index=True)
    hazard_type = Column(String, nullable=False)  # FLOOD, LANDSLIDE, HEAVY_RAIN, ROAD_DAMAGE, CONGESTION, BRIDGE_CLOSURE
    severity = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, SEVERE, CRITICAL
    location_name = Column(String, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)
    polygon_geojson = Column(JSON, nullable=False)  # GeoJSON Polygon coordinates [[[lng, lat], ...]]
    affected_road_ids = Column(JSON, default=list)  # List of road IDs affected
    affected_bridge_ids = Column(JSON, default=list)  # List of bridge IDs affected
    is_active = Column(Boolean, default=True, index=True)
    is_simulated = Column(Boolean, default=True)  # Clearly distinguish simulated hackathon scenario vs real alert
    description = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
