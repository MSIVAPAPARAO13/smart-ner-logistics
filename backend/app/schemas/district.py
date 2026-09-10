from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class DistrictBase(BaseModel):
    id: str
    name: str
    state: str
    hq_name: Optional[str] = None
    latitude: float
    longitude: float
    connectivity_status: str = "CONNECTED"


class DistrictResponse(DistrictBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
