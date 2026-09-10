from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.road import Road
from app.services.decision_service import decision_service
from app.services.supply_continuity_service import supply_continuity_service
from app.services.shortage_service import shortage_service
from app.services.simulation_service import simulation_service

router = APIRouter()


@router.get("")
def get_action_decisions(db: Session = Depends(get_db)):
    """
    Returns AI-derived operational action recommendations based on current corridor status.
    """
    status = simulation_service.get_status()
    nh6 = db.query(Road).filter(Road.id == "ROAD-NH06-SHL-SIL").first()
    road_status = nh6.current_status if nh6 else "OPEN"

    decisions = decision_service.generate_action_recommendations(
        scenario_stage=status.get("scenario_stage", "NORMAL"),
        road_status=road_status,
    )
    return {
        "scenario_stage": status.get("scenario_stage", "NORMAL"),
        "road_status": road_status,
        "recommendations": decisions,
    }


@router.get("/supply-impact/{road_id}")
def get_supply_impact(road_id: str = "ROAD-NH06-SHL-SIL"):
    """
    Traces complete supply impact graph for a given disrupted road corridor.
    """
    return supply_continuity_service.trace_disruption_impact(road_id)


@router.get("/supply-shortage/{district_id}")
def get_district_shortage(district_id: str = "DIST-AS-CACHAR"):
    """
    Evaluates district stockout timeline and shortage risk.
    """
    return shortage_service.predict_district_shortages(district_id)
