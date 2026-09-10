from typing import Any, List, Optional
from datetime import datetime
from pydantic import BaseModel


class HazardCreate(BaseModel):
    id: Optional[str] = None
    hazard_type: str = "FLOOD"
    severity: str = "HIGH"
    location_name: str
    center_lat: float
    center_lng: float
    radius_km: float = 5.0
    polygon_geojson: Any
    affected_road_ids: Optional[List[str]] = None
    affected_bridge_ids: Optional[List[str]] = None
    is_active: bool = True
    is_simulated: bool = True
    description: Optional[str] = None


class HazardResponse(HazardCreate):
    id: str
    detected_at: datetime

    class Config:
        from_attributes = True
