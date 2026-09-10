from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class FieldReportCreate(BaseModel):
    officer_name: str
    department: str = "Disaster Management Authority"
    district: str
    location_name: str
    latitude: float
    longitude: float
    incident_type: str  # FLOOD, LANDSLIDE, WATERLOGGING, BRIDGE_DAMAGE, ROAD_CRACK
    severity: str = "HIGH"
    description: str
    photo_url: Optional[str] = None
    evidence_source: Optional[str] = "NO_EVIDENCE_IMAGE"
    sync_state: str = "SYNCED"
    idempotency_key: Optional[str] = None


class FieldReportResponse(FieldReportCreate):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
