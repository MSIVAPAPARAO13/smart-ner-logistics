from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse, UserSwitchRequest, AuditLogResponse
from app.core.security import (
    UserRole,
    require_roles,
    get_current_user_role,
    create_simulated_token,
    ROLE_METADATA,
)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user(
    role: str = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """Returns profile for currently active authenticated user / session."""
    user = db.query(User).filter(User.role == role).first()
    if not user:
        # Fallback to first admin or generic operator
        user = db.query(User).first()
        if not user:
            # Synthetic user if DB not yet seeded
            meta = ROLE_METADATA.get(role, {})
            return UserResponse(
                id="USR-DEFAULT-01",
                username="operator_ner",
                name="Siva Paparao Medisetti",
                email="siva.medisetti@ner.logistics.gov.in",
                role=role,
                department=meta.get("department", "NER Regional Operations Center"),
                organization_district=meta.get("scope", "Guwahati HQ / Regional Command"),
                avatar_initials="SM",
                is_active=True,
            )
    return user


@router.get("/users", response_model=List[UserResponse])
def list_available_users(db: Session = Depends(get_db)):
    """Lists all active system users representing the 7 RBAC roles."""
    return db.query(User).order_by(User.role.asc()).all()


@router.post("/switch-user", response_model=UserResponse)
def switch_active_user(
    req: UserSwitchRequest,
    db: Session = Depends(get_db),
):
    """Switches active session user for demonstration & testing of RBAC roles."""
    user = db.query(User).filter((User.id == req.user_id) | (User.role == req.user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID or role '{req.user_id}' not found.",
        )
    return user


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    authorized_role: str = Depends(require_roles([UserRole.ADMIN, UserRole.COMMAND_OPERATOR, UserRole.ANALYST_VIEWER])),
):
    """
    Returns complete chronological system audit trail.
    Protected by RBAC: Admin, Command Operator, and Analyst Viewer only.
    """
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: str


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    authorized_role: str = Depends(require_roles([UserRole.ADMIN])),
):
    """Admin-only: Toggle user active/inactive status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    authorized_role: str = Depends(require_roles([UserRole.ADMIN])),
):
    """Admin-only: Change user role assignment."""
    try:
        new_role = UserRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role: {payload.role}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")
    user.role = new_role.value
    db.commit()
    db.refresh(user)
    return user

