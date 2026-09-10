from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bridge import Bridge
from app.schemas.bridge import BridgeResponse

router = APIRouter()


@router.get("", response_model=List[BridgeResponse])
def list_bridges(db: Session = Depends(get_db)):
    return db.query(Bridge).all()


@router.get("/{bridge_id}", response_model=BridgeResponse)
def get_bridge(bridge_id: str, db: Session = Depends(get_db)):
    bridge = db.query(Bridge).filter(Bridge.id == bridge_id).first()
    if not bridge:
        raise HTTPException(status_code=404, detail="Bridge not found")
    return bridge
