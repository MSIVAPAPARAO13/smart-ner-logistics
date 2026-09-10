from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel


class BridgeBase(BaseModel):
    id: str
    road_id: Optional[str] = None
    name: str
    river_name: Optional[str] = None
    latitude: float
    longitude: float
    accessibility_status: str = "OPEN"
    load_limit_tons: float = 40.0
    water_level_m: float = 12.5
    danger_water_level_m: float = 18.0
    clearance_status: str = "NORMAL"
    geometry_geojson: Optional[Any] = None


class BridgeResponse(BridgeBase):
    last_updated: datetime

    class Config:
        from_attributes = True
