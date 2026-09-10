from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SupplyManifestResponse(BaseModel):
    id: str
    supply_type: str
    name: str
    quantity_units: float
    unit_measure: str
    priority: str
    origin_depot: str
    dest_district: str
    assigned_vehicle_id: Optional[str] = None
    status: str
    required_by_hours: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DistrictInventoryResponse(BaseModel):
    id: int
    district_id: str
    district_name: str
    supply_type: str
    current_stock_units: float
    consumption_rate_per_day: float
    incoming_units: float
    incoming_eta_hours: float
    critical_threshold_units: float
    stock_status: str
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)
