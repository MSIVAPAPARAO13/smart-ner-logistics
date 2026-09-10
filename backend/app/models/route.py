from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON
from app.db.base import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    route_name = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    route_type = Column(String, default="PRIMARY")  # PRIMARY, ALTERNATE, CONTINGENCY
    distance_km = Column(Float, nullable=False)
    estimated_duration_min = Column(Float, nullable=False)
    polyline_geojson = Column(JSON, nullable=False)  # GeoJSON LineString coordinates [[lng, lat], ...]
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    source_engine = Column(String, default="OSRM")  # OSRM, NETWORKX_FALLBACK, OR_TOOLS
    created_at = Column(DateTime, default=datetime.utcnow)
