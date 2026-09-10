from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class SimulationStatus(BaseModel):
    is_running: bool
    scenario_stage: str  # NORMAL, HEAVY_RAIN, FLOOD_DEVELOPING, ROAD_AT_RISK, ROAD_BLOCKED, REROUTING, ALTERNATE_ROUTE_ACTIVE
    speed_multiplier: float = 1.0
    active_hazard_id: Optional[str] = None
    vehicle_id: str
    vehicle_lat: float
    vehicle_lng: float
    vehicle_heading: float
    vehicle_speed_kmh: float
    current_route_id: str
    route_type: str  # PRIMARY or ALTERNATE
    distance_remaining_km: float
    original_eta_min: float
    current_eta_min: float
    delay_min: float
    step_index: int
    total_steps: int


class SimulationControlRequest(BaseModel):
    action: str  # start, pause, reset, trigger_flood, set_speed
    speed_multiplier: Optional[float] = None
    scenario: Optional[str] = None


class WhatIfSimulationRequest(BaseModel):
    road_id: Optional[str] = "ROAD-NH6-01"
    bridge_id: Optional[str] = None
    severity: str = "CRITICAL"
    duration_hours: float = 18.0


class WhatIfSimulationResponse(BaseModel):
    scenario_type: str = "SCENARIO SIMULATION"
    lineage: str = "SIMULATION"
    target_corridor: str
    severity: str
    simulated_duration_hours: float
    without_intervention: Dict[str, Any]
    with_recommended_action: Dict[str, Any]
    simulated_at: datetime
