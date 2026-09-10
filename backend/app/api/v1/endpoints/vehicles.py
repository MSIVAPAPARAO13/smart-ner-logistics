from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.models.vehicle_position import VehiclePosition
from app.schemas.vehicle import VehicleResponse, VehiclePositionRecord

router = APIRouter()


@router.get("", response_model=List[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.get("/{vehicle_id}/positions", response_model=List[VehiclePositionRecord])
def get_vehicle_positions(vehicle_id: str, limit: int = 50, db: Session = Depends(get_db)):
    positions = (
        db.query(VehiclePosition)
        .filter(VehiclePosition.vehicle_id == vehicle_id)
        .order_by(VehiclePosition.timestamp.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(positions))
