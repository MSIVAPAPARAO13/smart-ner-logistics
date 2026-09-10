from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.impact_propagation_service import impact_propagation_service

router = APIRouter()


@router.get("/what-is-affected")
def get_what_is_affected(
    road_id: Optional[str] = Query(None, description="Identifier of degraded or blocked road corridor"),
    bridge_id: Optional[str] = Query(None, description="Identifier of restricted or submerged bridge"),
    incident_id: Optional[str] = Query(None, description="Identifier of active field incident"),
    db: Session = Depends(get_db),
):
    """
    Signature SIH26002 Operational Feature: 'WHAT IS AFFECTED?'
    Traces downstream dependency cascade:
    Incident -> Road/Bridge -> Traversed Routes -> Vehicles -> Manifests ->
    Lifeline Hospitals -> Inventory Stockout Window -> Risk Status -> Bypass Recommendation.
    """
    return impact_propagation_service.calculate_what_is_affected(
        road_id=road_id,
        bridge_id=bridge_id,
        incident_id=incident_id,
        db=db,
    )
