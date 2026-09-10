from fastapi import APIRouter
from typing import Optional
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("/languages")
def get_supported_languages():
    """
    Returns list of 6 supported Northeast languages.
    """
    return notification_service.get_supported_languages()


@router.get("/translate")
def translate_alert_query(alert_id: Optional[str] = None, lang: str = "en"):
    """
    Translates emergency alert into specified language.
    """
    return notification_service.translate_alert(alert_id=alert_id, lang_code=lang)


@router.get("/multilingual/{alert_id}")
def get_multilingual_alert(alert_id: str, lang: str = "en"):
    """
    Retrieves alert translation by alert ID.
    """
    return notification_service.translate_alert(alert_id=alert_id, lang_code=lang)
