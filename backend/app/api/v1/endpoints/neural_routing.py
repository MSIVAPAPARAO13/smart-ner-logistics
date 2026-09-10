from fastapi import APIRouter, Depends
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model_registry import ModelRegistry
from app.services.neural_routing_service import neural_routing_service
from app.services.route_comparison_service import route_comparison_service

router = APIRouter()


@router.post("/candidate")
def get_neural_route_candidate(payload: Optional[Dict[str, Any]] = None):
    """
    Generates GNN / RRNCO candidate paths for given origin-destination and priority.
    """
    p = payload or {}
    priority = p.get("priority", "CRITICAL")
    has_hazard = p.get("has_active_hazard", True)
    return neural_routing_service.generate_neural_route_candidate(
        origin_name=p.get("origin", "Guwahati"),
        destination_name=p.get("destination", "Silchar"),
        cargo_priority=priority,
        has_active_hazard=has_hazard,
    )


@router.post("/compare")
@router.get("/compare")
def compare_routing_modes(has_hazard: bool = True, priority: str = "CRITICAL"):
    """
    Returns 4-way strategy comparison benchmark:
    Baseline OSRM vs Context-Aware vs Neural Candidate vs Hybrid Final.
    """
    return route_comparison_service.compare_strategies(
        has_flood_hazard=has_hazard,
        cargo_priority=priority,
    )


@router.get("/models")
def list_registered_models(db: Session = Depends(get_db)):
    """
    Lists all active AI/ML models in ModelRegistry.
    """
    neural_routing_service.register_model_metadata()
    return db.query(ModelRegistry).all()
