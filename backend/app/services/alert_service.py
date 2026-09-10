import uuid
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.alert import Alert
from app.websockets.manager import manager

logger = logging.getLogger("sih26002.alert_service")


class AlertService:
    """
    Centralized Alert Generator & Broadcaster.
    Emits real-time alerts to WebSocket clients and persists active alerts in the database.
    """

    async def create_and_broadcast_alert(
        self,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        entity_id: Optional[str] = None,
        recommended_action: Optional[str] = None,
    ) -> Alert:
        db = SessionLocal()
        try:
            alert = Alert(
                id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
                alert_type=alert_type,
                severity=severity,
                title=title,
                message=message,
                entity_id=entity_id,
                recommended_action=recommended_action,
                is_active=True,
                created_at=datetime.utcnow(),
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)

            # Broadcast to all connected WebSocket dashboards
            await manager.broadcast({
                "type": "CENTRAL_ALERT",
                "alert": {
                    "id": alert.id,
                    "alert_type": alert.alert_type,
                    "severity": alert.severity,
                    "title": alert.title,
                    "message": alert.message,
                    "entity_id": alert.entity_id,
                    "recommended_action": alert.recommended_action,
                    "created_at": alert.created_at.isoformat(),
                },
            })
            return alert
        finally:
            db.close()

    def get_active_alerts(self, db: Session) -> List[Alert]:
        return db.query(Alert).filter(Alert.is_active == True).order_by(Alert.created_at.desc()).all()


alert_service = AlertService()
