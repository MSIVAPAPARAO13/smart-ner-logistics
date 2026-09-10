from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TravelTimePredictionRequest(BaseModel):
    road_id: str
    base_time_min: float
    distance_km: float
    road_type: str = "NATIONAL_HIGHWAY"
    terrain_type: str = "HILLY"
    slope_deg: float = 8.0
    rainfall_mm: float = 0.0
    soil_moisture: float = 0.35
    traffic_level: str = "NORMAL"
    cargo_priority: str = "CRITICAL"


class TravelTimePredictionResponse(BaseModel):
    road_id: str
    base_time_min: float
    predicted_time_min: float
    predicted_delay_min: float
    confidence_score: float
    model_version: str
    top_factors: List[str]


class DisruptionRiskRequest(BaseModel):
    road_id: str
    rainfall_mm: float
    precipitation_prob: float
    soil_moisture: float
    slope_deg: float
    road_status: str = "OPEN"
    bridge_status: str = "OPEN"
    traffic_level: str = "NORMAL"


class DisruptionRiskResponse(BaseModel):
    road_id: str
    disruption_probability: float  # 0.0 to 1.0
    risk_class: str  # LOW, WATCH, HIGH_RISK, CRITICAL
    accessibility_status: str
    key_drivers: List[str]
    model_name: str
    timestamp: datetime = datetime.utcnow()


class ContextAwareRouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    cargo_type: str = "EMERGENCY_MEDICAL_SUPPLIES"
    priority: str = "CRITICAL"  # CRITICAL, HIGH, MEDIUM, NORMAL
    avoid_high_risk: bool = True
    risk_threshold: float = 0.60


class ContextAwareRouteResponse(BaseModel):
    route_id: str
    route_name: str
    origin: str
    destination: str
    route_type: str  # PRIMARY, ALTERNATE
    distance_km: float
    predicted_travel_time_min: float
    predicted_delay_min: float
    disruption_risk_score: float
    dynamic_edge_cost: float
    reasoning: List[str]
    polyline_geojson: Any
    is_recommended: bool
