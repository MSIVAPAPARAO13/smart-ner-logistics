from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)  # e.g. NER-TRK-01
    vehicle_number = Column(String, nullable=False, unique=True)
    cargo_type = Column(String, default="EMERGENCY_MEDICAL_SUPPLIES")  # EMERGENCY_MEDICAL_SUPPLIES, FOOD_GRAINS, FUEL, CONSTRUCTION, GENERAL
    priority = Column(String, default="CRITICAL")  # CRITICAL, HIGH, NORMAL
    capacity_tons = Column(Float, default=12.0)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    current_route_id = Column(String, nullable=True)
    status = Column(String, default="IDLE")  # IDLE, EN_ROUTE, REROUTED, DELAYED, DELIVERED
    origin = Column(String, default="Guwahati Integrated Logistics Hub")
    destination = Column(String, default="Silchar Civil Hospital & Regional Medical Store")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
