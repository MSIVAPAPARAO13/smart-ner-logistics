from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    name: str
    email: str
    role: str
    department: str
    organization_district: str
    avatar_initials: str = "OP"
    is_active: bool = True


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: Optional[datetime] = None


class UserSwitchRequest(BaseModel):
    user_id: str


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    user_name: str
    role: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    timestamp: datetime
