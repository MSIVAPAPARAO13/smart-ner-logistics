from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.safe_hub import SafeHub
from app.schemas.safe_hub import SafeHubResponse, SafeHubRankingResponse
from app.services.safe_hub_service import safe_hub_service

router = APIRouter()


@router.get("", response_model=List[SafeHubResponse])
def list_safe_hubs(
    state: Optional[str] = Query(None, description="Filter by Northeast state"),
    hub_type: Optional[str] = Query(None, description="Filter by hub type"),
    db: Session = Depends(get_db),
):
    """Lists all registered emergency logistics hubs and relief centers in NER."""
    query = db.query(SafeHub)
    if state:
        query = query.filter(SafeHub.state.ilike(f"%{state}%"))
    if hub_type:
        query = query.filter(SafeHub.hub_type == hub_type)
    return query.all()


@router.get("/nearest", response_model=List[SafeHubRankingResponse])
def find_nearest_safe_hubs(
    lat: float = Query(26.1445, description="Reference latitude"),
    lng: float = Query(91.7362, description="Reference longitude"),
    hub_type: Optional[str] = Query(None, description="Filter by hub type"),
    limit: int = Query(6, ge=1, le=20, description="Max safe hubs to return"),
    db: Session = Depends(get_db),
):
    """
    Find Nearest Safe Hub with intelligent accessibility scoring:
    Penalizes corridors with blocked river bridges or flash flood washouts.
    Recommends the safest reachable facility rather than naive Euclidean distance.
    """
    return safe_hub_service.rank_nearest_safe_hubs(
        db=db,
        user_lat=lat,
        user_lng=lng,
        hub_type=hub_type,
        limit=limit,
    )
