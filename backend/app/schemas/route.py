from typing import Any, List, Optional
from datetime import datetime
from pydantic import BaseModel


class RouteCalculationRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    avoid_hazard_ids: Optional[List[str]] = None
    vehicle_id: Optional[str] = None


class RouteStep(BaseModel):
    name: str
    instruction: str
    distance_m: float
    duration_s: float


class RouteResponse(BaseModel):
    id: str
    route_name: str
    origin: str
    destination: str
    route_type: str  # PRIMARY, ALTERNATE, CONTINGENCY
    distance_km: float
    estimated_duration_min: float
    polyline_geojson: Any  # GeoJSON LineString coordinates [[lng, lat], ...]
    is_active: bool = True
    is_blocked: bool = False
    source_engine: str = "OSRM"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
