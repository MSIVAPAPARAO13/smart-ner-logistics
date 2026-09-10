from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.intelligence import (
    TravelTimePredictionRequest,
    TravelTimePredictionResponse,
    DisruptionRiskRequest,
    DisruptionRiskResponse,
    ContextAwareRouteRequest,
    ContextAwareRouteResponse,
)
from app.services.travel_time_service import travel_time_predictor
from app.services.disruption_service import disruption_predictor
from app.services.routing_service import routing_service
from app.models.hazard import Hazard
from app.models.weather import WeatherObservation

router = APIRouter()


@router.post("/predict-travel-time", response_model=TravelTimePredictionResponse)
def predict_travel_time(req: TravelTimePredictionRequest):
    return travel_time_predictor.predict_travel_time(req.dict())


@router.post("/predict-risk", response_model=DisruptionRiskResponse)
def predict_disruption_risk(req: DisruptionRiskRequest):
    return disruption_predictor.predict_disruption_risk(req.dict())


@router.post("/context-route", response_model=List[ContextAwareRouteResponse])
async def calculate_context_aware_route(
    req: ContextAwareRouteRequest,
    db: Session = Depends(get_db),
):
    active_hazards = db.query(Hazard).filter(Hazard.is_active == True).all()
    hazard_polygons = [h.polygon_geojson for h in active_hazards if h.polygon_geojson]
    is_flood = len(hazard_polygons) > 0

    latest_weather = db.query(WeatherObservation).order_by(WeatherObservation.observed_at.desc()).first()
    weather_dict = {
        "rainfall_mm": latest_weather.precipitation_mm if latest_weather else 12.0,
        "soil_moisture_m3_m3": latest_weather.soil_moisture_m3_m3 if latest_weather else 0.38,
        "precipitation_probability": latest_weather.precipitation_probability if latest_weather else 30.0,
    }

    candidates = await routing_service.calculate_context_aware_route(
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        cargo_type=req.cargo_type,
        priority=req.priority,
        hazard_polygons=hazard_polygons,
        weather_data=weather_dict,
        is_flood_active=is_flood,
    )
    return candidates
