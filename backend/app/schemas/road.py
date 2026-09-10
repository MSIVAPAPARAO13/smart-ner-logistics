from typing import Any, List, Optional
from datetime import datetime
from pydantic import BaseModel


class RoadBase(BaseModel):
    id: str
    road_name: str
    road_type: str = "NATIONAL_HIGHWAY"
    origin: str
    destination: str
    distance_km: float
    base_travel_time_min: float
    current_status: str = "OPEN"
    traffic_level: str = "NORMAL"
    accessibility_score: float = 100.0
    terrain_type: str = "HILLY"
    geometry_geojson: Any


class RoadStatusUpdate(BaseModel):
    current_status: str
    accessibility_score: Optional[float] = None
    traffic_level: Optional[str] = None


class RoadResponse(RoadBase):
    last_updated: datetime

    class Config:
        from_attributes = True
