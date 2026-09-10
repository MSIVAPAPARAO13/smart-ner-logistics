from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.db.base import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)  # Assam, Meghalaya, etc.
    hq_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    connectivity_status = Column(String, default="CONNECTED")  # CONNECTED, WATCH, RESTRICTED, ISOLATED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
