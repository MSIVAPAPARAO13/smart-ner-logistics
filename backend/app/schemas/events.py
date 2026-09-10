from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel


class LiveEvent(BaseModel):
    id: str
    timestamp: datetime
    formatted_time: str
    event_type: str  # VEHICLE_MOVED, WEATHER_ALERT, HAZARD_SPAWNED, ROAD_STATUS_CHANGED, ROUTE_BLOCKED, REROUTE_CALCULATED, VEHICLE_REROUTED, ETA_UPDATED, SIMULATION_STATE
    severity: str = "INFO"  # INFO, WARNING, DANGER, SUCCESS
    title: str
    description: str
    metadata: Optional[Any] = None
