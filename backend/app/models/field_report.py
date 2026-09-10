from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from app.db.base import Base


class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(String, primary_key=True, index=True)
    officer_name = Column(String, nullable=False)
    department = Column(String, default="Disaster Management Authority")
    district = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    incident_type = Column(String, nullable=False)  # FLOOD, LANDSLIDE, WATERLOGGING, BRIDGE_DAMAGE, ROAD_CRACK
    severity = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    evidence_source = Column(String, default="NO_EVIDENCE_IMAGE")  # FIELD_UPLOAD, HISTORICAL_REFERENCE, SIMULATION, NO_EVIDENCE_IMAGE
    sync_state = Column(String, default="SYNCED")  # SYNCED, PENDING_OFFLINE, VERIFIED, REJECTED, RESOLVED
    idempotency_key = Column(String, nullable=True, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
