from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class RouteStep(BaseModel):
    step_number: int
    instruction: str
    road_name: str
    distance_km: float
    duration_min: float
    hazard_warning: Optional[str] = None
    maneuver_type: str = "straight"  # depart, turn-left, turn-right, fork, arrive, continue


class RouteCandidate(BaseModel):
    route_id: str
    route_name: str
    route_type: str  # AI_RECOMMENDED, FASTEST_BASELINE, SAFER_ALTERNATIVE, ONLY_FEASIBLE
    distance_km: float
    travel_time_min: float
    predicted_delay_min: float = 0.0
    disruption_risk_score: float  # 0.0 to 1.0
    reliability_score: float  # 0.0 to 1.0
    accessibility_status: str  # FEASIBLE, HIGH_RISK, BLOCKED
    is_blocked: bool = False
    is_recommended: bool = False
    summary: str
    why_this_route: List[str] = []
    steps: List[RouteStep] = []
    polyline_geojson: List[List[float]] = []  # [[lng, lat], ...]
    color_code: str = "#16a34a"  # Green for recommended, blue for fastest, purple for AI, red for blocked


class RoutePlanRequest(BaseModel):
    origin: Optional[str] = "Guwahati"
    destination: Optional[str] = "Silchar"
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    origin_name: Optional[str] = None
    destination_name: Optional[str] = None
    cargo_type: str = "EMERGENCY_MEDICAL_SUPPLIES"
    priority: str = "CRITICAL"
    avoid_hazards: bool = True
    vehicle_weight_tons: float = 16.0



class RoutePlanResponse(BaseModel):
    origin_name: str
    origin_coords: List[float]  # [lat, lng]
    destination_name: str
    destination_coords: List[float]  # [lat, lng]
    cargo_type: str
    priority: str
    active_corridor_condition: str
    recommended_route: RouteCandidate
    alternative_routes: List[RouteCandidate] = []
    total_candidates_evaluated: int
    data_source_lineage: str = "HYBRID_ML_OPTIMIZATION"
