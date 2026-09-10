from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.supply import SupplyManifest
from app.models.district_inventory import DistrictInventory
from app.models.vehicle import Vehicle
from app.models.hazard import Hazard
from app.schemas.supply import SupplyManifestResponse, DistrictInventoryResponse
from app.services.optimization_service import optimization_engine
from app.services.supply_continuity_service import supply_continuity_service

router = APIRouter()


@router.get("", response_model=List[SupplyManifestResponse])
def list_supplies(db: Session = Depends(get_db)):
    return db.query(SupplyManifest).all()


@router.get("/inventory", response_model=List[DistrictInventoryResponse])
def list_district_inventory(db: Session = Depends(get_db)):
    return db.query(DistrictInventory).all()


@router.get("/inventory/{district_id}")
def get_district_inventory_by_id(district_id: str, db: Session = Depends(get_db)):
    return supply_continuity_service.get_district_inventory_assessment(district_id)


@router.get("/assessment")
def get_supply_continuity_assessment():
    return supply_continuity_service.get_district_inventory_assessment()


@router.post("/optimize-dispatch")
def optimize_fleet_dispatch(db: Session = Depends(get_db)):
    vehicles = [
        {"id": v.id, "vehicle_number": v.vehicle_number, "status": v.status, "capacity_tons": v.capacity_tons}
        for v in db.query(Vehicle).all()
    ]
    supplies = [
        {"id": s.id, "supply_type": s.supply_type, "priority": s.priority, "quantity_units": s.quantity_units}
        for s in db.query(SupplyManifest).all()
    ]
    active_hazards = [
        {"id": h.id, "hazard_type": h.hazard_type}
        for h in db.query(Hazard).filter(Hazard.is_active == True).all()
    ]

    return optimization_engine.optimize_fleet_dispatch(vehicles, supplies, active_hazards)
