from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.route import Route
from app.models.hazard import Hazard
from app.schemas.route import RouteResponse, RouteCalculationRequest
from app.services.routing_service import routing_service

router = APIRouter()


@router.get("", response_model=List[RouteResponse])
def list_routes(db: Session = Depends(get_db)):
    return db.query(Route).all()


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.post("/calculate", response_model=RouteResponse)
async def calculate_route(request: RouteCalculationRequest, db: Session = Depends(get_db)):
    # Fetch active hazard polygons
    active_hazards = db.query(Hazard).filter(Hazard.is_active == True).all()
    hazard_polygons = [h.polygon_geojson for h in active_hazards if h.polygon_geojson]

    route_dict = await routing_service.calculate_route(
        origin_lat=request.origin_lat,
        origin_lng=request.origin_lng,
        dest_lat=request.dest_lat,
        dest_lng=request.dest_lng,
        hazard_polygons=hazard_polygons,
        avoid_hazard=bool(hazard_polygons),
    )

    return route_dict


from app.schemas.route_plan import RoutePlanRequest, RoutePlanResponse


@router.post("/plan", response_model=RoutePlanResponse)
async def plan_dynamic_route(request: RoutePlanRequest, db: Session = Depends(get_db)):
    """
    Primary SIH26002 Dynamic Route Decision Endpoint:
    Accepts arbitrary origin & destination queries (cities, districts, hospitals, depots, coordinates)
    OR exact coordinates from autocomplete selections (origin_lat/lng, dest_lat/lng).
    Evaluates ML disruption risk & OR-Tools constraints, producing AI Recommended and Alternative routes
    complete with turn-by-turn maneuvers and 'Why This Route?' reasoning.
    """
    return await routing_service.plan_dynamic_route(
        origin_str=request.origin,
        dest_str=request.destination,
        origin_lat=request.origin_lat,
        origin_lng=request.origin_lng,
        dest_lat=request.dest_lat,
        dest_lng=request.dest_lng,
        origin_name=request.origin_name,
        destination_name=request.destination_name,
        cargo_type=request.cargo_type,
        priority=request.priority,
        avoid_hazards=request.avoid_hazards,
        vehicle_weight_tons=request.vehicle_weight_tons,
        db=db,
    )

