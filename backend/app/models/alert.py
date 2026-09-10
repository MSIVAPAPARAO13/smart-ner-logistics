from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    alert_type = Column(String, nullable=False, index=True)  # ROAD_BLOCKED, BRIDGE_CLOSED, HIGH_RISK_CORRIDOR, VEHICLE_DELAY, REGION_INACCESSIBLE, SUPPLY_SHORTAGE
    severity = Column(String, default="WARNING")  # INFO, WARNING, DANGER, CRITICAL
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    entity_id = Column(String, nullable=True, index=True)  # Road, Bridge, or Vehicle ID
    recommended_action = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
