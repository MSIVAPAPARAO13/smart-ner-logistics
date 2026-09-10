from fastapi import APIRouter, Depends
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.models.supply import SupplyManifest
from app.models.hazard import Hazard
from app.models.optimization_run import OptimizationRun
from app.services.optimization_service import optimization_engine

router = APIRouter()


@router.post("/run")
@router.post("")
def run_fleet_optimization(db: Session = Depends(get_db)):
    """
    Executes multi-vehicle context-aware dispatch optimization.
    """
    vehicles = [
        {"id": v.id, "vehicle_number": v.vehicle_number, "capacity_tons": v.capacity_tons, "status": v.status}
        for v in db.query(Vehicle).all()
    ]
    supplies = [
        {"id": s.id, "supply_type": s.supply_type, "name": s.name, "priority": s.priority, "quantity_units": s.quantity_units}
        for s in db.query(SupplyManifest).all()
    ]
    hazards = [
        {"id": h.id, "hazard_type": h.hazard_type, "is_active": h.is_active}
        for h in db.query(Hazard).filter(Hazard.is_active == True).all()
    ]

    result = optimization_engine.optimize_fleet_dispatch(
        vehicles=vehicles,
        supplies=supplies,
        active_hazards=hazards,
        persist_run=True,
    )
    return result


@router.get("/benchmarks")
def get_optimization_benchmarks(db: Session = Depends(get_db)):
    """
    Returns history of optimization benchmark runs.
    """
    runs = db.query(OptimizationRun).order_by(OptimizationRun.created_at.desc()).limit(10).all()
    return runs


@router.get("/{run_id}")
def get_optimization_run(run_id: str, db: Session = Depends(get_db)):
    """
    Retrieves specific optimization run results.
    """
    run = db.query(OptimizationRun).filter(OptimizationRun.id == run_id).first()
    return run
