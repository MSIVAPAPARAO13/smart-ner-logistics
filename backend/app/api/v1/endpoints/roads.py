from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.road import Road
from app.schemas.road import RoadResponse, RoadStatusUpdate
from app.websockets.manager import manager

router = APIRouter()


@router.get("", response_model=List[RoadResponse])
def list_roads(db: Session = Depends(get_db)):
    return db.query(Road).all()


@router.get("/{road_id}", response_model=RoadResponse)
def get_road(road_id: str, db: Session = Depends(get_db)):
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found")
    return road


@router.patch("/{road_id}/status", response_model=RoadResponse)
async def update_road_status(road_id: str, update_data: RoadStatusUpdate, db: Session = Depends(get_db)):
    road = db.query(Road).filter(Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found")

    road.current_status = update_data.current_status
    if update_data.accessibility_score is not None:
        road.accessibility_score = update_data.accessibility_score
    if update_data.traffic_level is not None:
        road.traffic_level = update_data.traffic_level

    db.commit()
    db.refresh(road)

    # Broadcast road update
    await manager.broadcast({
        "type": "ROAD_STATUS_UPDATE",
        "road_id": road.id,
        "status": road.current_status,
        "accessibility_score": road.accessibility_score,
    })

    return road
