from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base


class DistrictInventory(Base):
    __tablename__ = "district_inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(String, index=True, nullable=False)
    district_name = Column(String, nullable=False)
    supply_type = Column(String, nullable=False, index=True)
    current_stock_units = Column(Float, nullable=False)
    consumption_rate_per_day = Column(Float, default=10.0)
    incoming_units = Column(Float, default=0.0)
    incoming_eta_hours = Column(Float, default=0.0)
    critical_threshold_units = Column(Float, default=50.0)
    stock_status = Column(String, default="ADEQUATE")  # ADEQUATE, LOW, CRITICAL_SHORTAGE
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
