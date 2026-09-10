import uuid
from typing import Dict, Any, Optional, List
from enum import Enum
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db


class UserRole(str, Enum):
    # 7 Required Roles
    ADMIN = "ADMIN"
    COMMAND_OPERATOR = "COMMAND_OPERATOR"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    FLEET_MANAGER = "FLEET_MANAGER"
    FIELD_OFFICER = "FIELD_OFFICER"
    SUPPLY_MANAGER = "SUPPLY_MANAGER"
    ANALYST_VIEWER = "ANALYST_VIEWER"

    # Compatibility Aliases for Phase 1-5 tests
    DISPATCHER = "DISPATCHER"
    DRIVER = "DRIVER"
    VIEWER = "VIEWER"


# Role label and metadata mapping
ROLE_METADATA: Dict[str, Dict[str, str]] = {
    UserRole.ADMIN.value: {
        "title": "Super Administrator",
        "department": "National Logistics & Disaster Command",
        "scope": "All Systems & Infrastructure",
    },
    UserRole.COMMAND_OPERATOR.value: {
        "title": "Command Center Operator",
        "department": "NER Regional Operations Center",
        "scope": "Regional Corridors & Active Fleet",
    },
    UserRole.DISTRICT_OFFICER.value: {
        "title": "District Magistrate / Officer",
        "department": "District Disaster Management Authority",
        "scope": "District Emergency Operations",
    },
    UserRole.FLEET_MANAGER.value: {
        "title": "Logistics & Fleet Manager",
        "department": "Regional Transport & Convoy Command",
        "scope": "Vehicles, Routes & Deliveries",
    },
    UserRole.FIELD_OFFICER.value: {
        "title": "Field Operations Surveyor",
        "department": "PWD / Field Disaster Recon",
        "scope": "Ground Inspection & Reporting",
    },
    UserRole.SUPPLY_MANAGER.value: {
        "title": "Supply & Hospital Inventory Manager",
        "department": "Health & Family Welfare Logistics",
        "scope": "Hospitals & Lifeline Depots",
    },
    UserRole.ANALYST_VIEWER.value: {
        "title": "Operational Analyst & Auditor",
        "department": "Planning & Performance Review",
        "scope": "Reports & Historical Analytics",
    },
    # Aliases
    UserRole.DISPATCHER.value: {
        "title": "Command Center Dispatcher",
        "department": "NER Regional Operations",
        "scope": "Regional Dispatch",
    },
    UserRole.DRIVER.value: {
        "title": "Convoy Driver",
        "department": "Emergency Transport Fleet",
        "scope": "Vehicle Operations",
    },
    UserRole.VIEWER.value: {
        "title": "Public / Read-Only Viewer",
        "department": "Citizen & Stakeholder Transparency",
        "scope": "Public Overviews",
    },
}


def generate_correlation_id() -> str:
    """Generates a unique request correlation ID for end-to-end tracing."""
    return f"REQ-{uuid.uuid4().hex[:12].upper()}"


def validate_user_access(role: str, required_role: UserRole) -> bool:
    """
    Hierarchical RBAC checker:
    ADMIN > COMMAND_OPERATOR/DISPATCHER > DISTRICT_OFFICER > FLEET_MANAGER > FIELD_OFFICER > SUPPLY_MANAGER > ANALYST_VIEWER
    """
    role_hierarchy = {
        UserRole.ADMIN: 7,
        UserRole.COMMAND_OPERATOR: 6,
        UserRole.DISPATCHER: 6,
        UserRole.DISTRICT_OFFICER: 5,
        UserRole.FLEET_MANAGER: 4,
        UserRole.DRIVER: 4,
        UserRole.FIELD_OFFICER: 3,
        UserRole.SUPPLY_MANAGER: 3,
        UserRole.ANALYST_VIEWER: 1,
        UserRole.VIEWER: 1,
    }
    try:
        user_enum = UserRole(role)
    except ValueError:
        return False

    user_level = role_hierarchy.get(user_enum, 1)
    required_level = role_hierarchy.get(required_role, 1)
    return user_level >= required_level


def create_simulated_token(user_id: str, role: UserRole) -> Dict[str, Any]:
    """Generates an authenticated token payload with enterprise claims."""
    return {
        "access_token": f"sih26002_jwt_{uuid.uuid4().hex}",
        "token_type": "bearer",
        "user_id": user_id,
        "role": role.value,
        "issuer": "MDoNER_SIH26002_AUTH_GATEWAY",
    }


def get_current_user_role(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    authorization: Optional[str] = Header(None),
) -> str:
    """Extracts user role from header or simulated token claim. Defaults to COMMAND_OPERATOR."""
    if x_user_role:
        return x_user_role.strip().upper()
    if authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        # Simulated token format: sih26002_jwt_... or role encoded
        if "admin" in token.lower():
            return UserRole.ADMIN.value
    return UserRole.COMMAND_OPERATOR.value


def require_roles(allowed_roles: List[UserRole]):
    """
    FastAPI dependency enforcing strict RBAC.
    Returns 403 Forbidden with structured error if user's role is not authorized.
    """
    def role_checker(role: str = Depends(get_current_user_role)) -> str:
        # Normalize alias
        norm_role = role
        if norm_role == "DISPATCHER":
            norm_role = UserRole.COMMAND_OPERATOR.value
        elif norm_role == "DRIVER":
            norm_role = UserRole.FLEET_MANAGER.value
        elif norm_role == "VIEWER":
            norm_role = UserRole.ANALYST_VIEWER.value

        allowed_values = [r.value for r in allowed_roles]
        # ADMIN always has access
        if norm_role == UserRole.ADMIN.value or role == UserRole.ADMIN.value:
            return role

        if norm_role in allowed_values or role in allowed_values:
            return role

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: Role '{role}' does not possess required authorization for this operation. Required: {[r.value for r in allowed_roles]}",
        )

    return role_checker

