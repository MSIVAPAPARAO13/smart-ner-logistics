from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class VehicleBase(BaseModel):
    id: str
    vehicle_number: str
    cargo_type: str = "EMERGENCY_MEDICAL_SUPPLIES"
    priority: str = "CRITICAL"
    capacity_tons: float = 12.0
    current_lat: float
    current_lng: float
    speed_kmh: float = 0.0
    heading_deg: float = 0.0
    current_route_id: Optional[str] = None
    status: str = "IDLE"
    origin: str = "Guwahati Integrated Logistics Hub"
    destination: str = "Silchar Civil Hospital & Regional Medical Store"


class VehiclePositionRecord(BaseModel):
    latitude: float
    longitude: float
    speed_kmh: float
    heading_deg: float
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class VehicleResponse(VehicleBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
