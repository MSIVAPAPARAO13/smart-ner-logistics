from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertBase
from app.services.alert_service import alert_service

router = APIRouter()


@router.get("", response_model=List[AlertResponse])
def list_alerts(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if active_only:
        query = query.filter(Alert.is_active == True)
    return query.order_by(Alert.created_at.desc()).all()


@router.post("", response_model=AlertResponse)
async def create_alert(alert_in: AlertBase):
    alert = await alert_service.create_and_broadcast_alert(
        alert_type=alert_in.alert_type,
        severity=alert_in.severity,
        title=alert_in.title,
        message=alert_in.message,
        entity_id=alert_in.entity_id,
        recommended_action=alert_in.recommended_action,
    )
    return alert
