from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.road import Road
from app.services.simulation_service import simulation_service
from app.services.event_broadcaster import event_broadcaster
from app.services.impact_propagation_service import impact_propagation_service
from app.schemas.simulation import (
    SimulationStatus,
    SimulationControlRequest,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)

router = APIRouter()


@router.get("/status", response_model=SimulationStatus)
def get_simulation_status():
    return simulation_service.get_status()


@router.get("/timeline")
def get_timeline():
    return event_broadcaster.get_timeline()


@router.post("/start", response_model=SimulationStatus)
async def start_simulation():
    await simulation_service.start()
    return simulation_service.get_status()


@router.post("/pause", response_model=SimulationStatus)
async def pause_simulation():
    await simulation_service.pause()
    return simulation_service.get_status()


@router.post("/trigger-flood", response_model=SimulationStatus)
async def trigger_flood_scenario():
    await simulation_service.trigger_flood_scenario()
    return simulation_service.get_status()


@router.post("/reset", response_model=SimulationStatus)
async def reset_simulation():
    await simulation_service.reset()
    return simulation_service.get_status()


@router.post("/control", response_model=SimulationStatus)
async def control_simulation(request: SimulationControlRequest):
    if request.action == "start":
        await simulation_service.start()
    elif request.action == "pause":
        await simulation_service.pause()
    elif request.action == "trigger_flood":
        await simulation_service.trigger_flood_scenario()
    elif request.action == "reset":
        await simulation_service.reset()
    elif request.action == "set_speed" and request.speed_multiplier is not None:
        await simulation_service.set_speed(request.speed_multiplier)

    return simulation_service.get_status()


@router.post("/what-if", response_model=WhatIfSimulationResponse)
def run_what_if_simulation(
    req: WhatIfSimulationRequest,
    db: Session = Depends(get_db),
):
    """
    P1.10 What-If Scenario Simulator:
    Simulates corridor blockage with arbitrary severity & duration,
    and returns a side-by-side comparison of WITHOUT INTERVENTION vs WITH RECOMMENDED ACTION.
    Always labeled with SCENARIO SIMULATION.
    """
    road = db.query(Road).filter(Road.id == req.road_id).first() if req.road_id else None
    target_name = road.road_name if road else (req.road_id or "NH-6 Sonapur - Silchar Corridor")

    # Calculate dynamic impact propagation
    impact = impact_propagation_service.calculate_what_is_affected(
        db=db,
        road_id=req.road_id,
        bridge_id=req.bridge_id,
        incident_id=f"SIM-{req.severity}-{int(req.duration_hours)}H",
    )

    base_delay_hours = round(min(req.duration_hours, 11.2 if req.severity == "CRITICAL" else 6.5), 1)

    without_intervention = {
        "status": "BLOCKED" if req.severity in ["HIGH", "CRITICAL"] else "RESTRICTED",
        "affected_vehicles": impact["affected_summary"]["vehicles_affected_count"],
        "critical_consignments": impact["affected_summary"]["critical_deliveries_count"],
        "max_delay_hours": base_delay_hours,
        "projected_eta_hours": round(6.5 + base_delay_hours, 1),
        "hospital_stockout_risk": "CRITICAL" if req.severity in ["HIGH", "CRITICAL"] else "WATCH",
        "facilities_at_risk": len(impact["facilities_at_risk"]),
        "stockout_window_hours": 6.2,
        "stockout_deficit_hours": round(max(0.0, (6.5 + base_delay_hours) - 6.2), 1),
        "impact_summary": f"{target_name} closed for {req.duration_hours}h; supply stockout occurs at Silchar in 6.2h.",
    }

    with_recommended_action = {
        "status": "REROUTED_OPTIMAL",
        "recommended_route": impact["recommended_action"]["bypass_corridor"],
        "revised_eta_hours": round(6.5 + 3.7, 1),
        "delay_avoided_hours": 3.7,
        "hospital_stockout_risk": "SAFE",
        "facilities_protected": len(impact["facilities_at_risk"]),
        "deliveries_secured": impact["affected_summary"]["critical_deliveries_count"],
        "reason": impact["recommended_action"]["reason"],
    }

    return WhatIfSimulationResponse(
        scenario_type="SCENARIO SIMULATION",
        lineage="SIMULATION",
        target_corridor=target_name,
        severity=req.severity,
        simulated_duration_hours=req.duration_hours,
        without_intervention=without_intervention,
        with_recommended_action=with_recommended_action,
        simulated_at=datetime.utcnow(),
    )
