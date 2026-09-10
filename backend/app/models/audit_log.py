from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    user_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    action = Column(String, index=True, nullable=False)
    entity_type = Column(String, index=True, nullable=False)  # ROAD, BRIDGE, FIELD_REPORT, ROUTE, VEHICLE, ROLE
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
