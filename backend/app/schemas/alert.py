from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    id: Optional[str] = None
    alert_type: str
    severity: str = "WARNING"  # INFO, WARNING, DANGER, CRITICAL
    title: str
    message: str
    entity_id: Optional[str] = None
    recommended_action: Optional[str] = None
    is_active: bool = True


class AlertResponse(AlertBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
