import uuid
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

logger = logging.getLogger("sih26002.audit")


class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        user_id: str,
        user_name: str,
        role: str,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        details: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        try:
            log_entry = AuditLog(
                id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
                user_id=user_id,
                user_name=user_name,
                role=role,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                metadata_json=metadata_json,
                timestamp=datetime.utcnow(),
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as exc:
            logger.error(f"Failed to record audit log: {exc}")
            db.rollback()
            return None


audit_service = AuditService()
