from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.hazard import Hazard
from app.schemas.hazard import HazardResponse, HazardCreate
from app.websockets.manager import manager

router = APIRouter()


@router.get("", response_model=List[HazardResponse])
def list_hazards(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Hazard)
    if active_only:
        query = query.filter(Hazard.is_active == True)
    return query.all()


@router.post("", response_model=HazardResponse)
async def create_hazard(hazard_in: HazardCreate, db: Session = Depends(get_db)):
    import uuid
    hazard = Hazard(
        id=hazard_in.id or f"HAZARD-{uuid.uuid4().hex[:8].upper()}",
        hazard_type=hazard_in.hazard_type,
        severity=hazard_in.severity,
        location_name=hazard_in.location_name,
        center_lat=hazard_in.center_lat,
        center_lng=hazard_in.center_lng,
        radius_km=hazard_in.radius_km,
        polygon_geojson=hazard_in.polygon_geojson,
        affected_road_ids=hazard_in.affected_road_ids or [],
        affected_bridge_ids=hazard_in.affected_bridge_ids or [],
        is_active=hazard_in.is_active,
        is_simulated=hazard_in.is_simulated,
        description=hazard_in.description,
    )
    db.add(hazard)
    db.commit()
    db.refresh(hazard)

    await manager.broadcast({
        "type": "HAZARD_DETECTED",
        "hazard_id": hazard.id,
        "hazard_type": hazard.hazard_type,
        "severity": hazard.severity,
        "location": hazard.location_name,
    })

    return hazard
