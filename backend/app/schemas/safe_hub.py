from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class SafeHubBase(BaseModel):
    name: str
    hub_type: str
    state: str
    district: str
    latitude: float
    longitude: float
    elevation_m: float = 100.0
    capacity_tons: float = 500.0
    current_occupancy_pct: float = 45.0
    status: str = "ACTIVE"
    services: List[str] = []
    contact_phone: Optional[str] = None


class SafeHubResponse(SafeHubBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class SafeHubRankingResponse(SafeHubResponse):
    distance_km: float
    route_eta_min: float
    road_accessibility_score: float
    hazard_disruption_risk: float
    composite_safe_score: float
    is_route_blocked: bool
    blocking_reason: Optional[str] = None
    is_recommended: bool = False
    recommendation_note: Optional[str] = None
