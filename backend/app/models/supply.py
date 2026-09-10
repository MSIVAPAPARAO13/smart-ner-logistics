from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.db.base import Base


class SupplyManifest(Base):
    __tablename__ = "supplies"

    id = Column(String, primary_key=True, index=True)  # e.g. SUP-MED-001
    supply_type = Column(String, nullable=False, index=True)  # EMERGENCY_MEDICINE, FOOD_GRAINS, POTABLE_WATER, FUEL, SHELTER_KITS
    name = Column(String, nullable=False)
    quantity_units = Column(Float, nullable=False)
    unit_measure = Column(String, default="Metric Tons")
    priority = Column(String, default="CRITICAL")  # CRITICAL, HIGH, MEDIUM, NORMAL
    origin_depot = Column(String, default="Guwahati Regional Logistics Depo")
    dest_district = Column(String, default="Cachar (Silchar)")
    assigned_vehicle_id = Column(String, nullable=True, index=True)
    status = Column(String, default="DISPATCHED")  # STOCKED, DISPATCHED, IN_TRANSIT, DELIVERED
    required_by_hours = Column(Float, default=12.0)
    created_at = Column(DateTime, default=datetime.utcnow)
