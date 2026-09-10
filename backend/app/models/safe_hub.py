from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON
from app.db.base import Base


class SafeHub(Base):
    __tablename__ = "safe_hubs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    hub_type = Column(String, nullable=False, index=True)  # EMERGENCY_LOGISTICS_HUB, WAREHOUSE, HOSPITAL, RELIEF_CENTER, SHELTER, STAGING_AREA
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=100.0)
    capacity_tons = Column(Float, default=500.0)
    current_occupancy_pct = Column(Float, default=45.0)
    status = Column(String, default="ACTIVE")  # ACTIVE, CONGESTED, RESTRICTED
    services = Column(JSON, default=list)  # ["COLD_STORAGE", "HELIPAD", "FUEL_STATION", "ICU_BACKUP"]
    contact_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
