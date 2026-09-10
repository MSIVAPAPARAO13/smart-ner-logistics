from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.weather import WeatherObservation
from app.schemas.weather import WeatherObservationResponse, LocationSearchResponse
from app.services.weather_service import weather_service
from app.services.geocoding_service import geocoding_service

router = APIRouter()


@router.get("", response_model=List[WeatherObservationResponse])
def list_weather_observations(db: Session = Depends(get_db)):
    """List all persisted weather observations."""
    return db.query(WeatherObservation).order_by(WeatherObservation.observed_at.desc()).limit(50).all()


@router.get("/live")
async def get_live_weather(
    latitude: float = Query(26.1445, description="Latitude (EPSG:4326)"),
    longitude: float = Query(91.7362, description="Longitude (EPSG:4326)"),
    location_name: Optional[str] = Query("Guwahati Corridor", description="District or Corridor Name"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get live normalized weather observation for location.
    Uses Open-Meteo as primary provider with in-memory caching and transparent data lineage.
    Zero IMD credentials required.
    """
    return await weather_service.get_weather_for_corridor(
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        db=db,
    )


@router.get("/search", response_model=List[LocationSearchResponse])
async def search_ner_locations(
    q: str = Query("", description="City, District, State, or Pass in Northeast India"),
    limit: int = Query(8, ge=1, le=20, description="Max results to return"),
):
    """
    Search locations across all 8 Northeast Indian states using Open-Meteo Geocoding & Local NER Catalog.
    """
    return await geocoding_service.search_locations(query=q, limit=limit)


@router.get("/corridors")
async def get_key_corridors_weather(
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    Fetch weather snapshot for critical Northeast India lifeline logistics corridors.
    """
    key_points = [
        ("Guwahati Hub (Assam)", 26.1445, 91.7362),
        ("Shillong Plateau (Meghalaya)", 25.5788, 91.8933),
        ("Ladrymbai / Sonapur Pass (Meghalaya)", 25.3120, 92.3550),
        ("Silchar Valley (Assam)", 24.8333, 92.7789),
        ("Haflong Mountain Cut (Assam)", 25.1700, 93.0200),
        ("Nagaon Junction (Assam)", 26.3452, 92.6840),
        ("Dimapur Gateway (Nagaland)", 25.9068, 93.7271),
        ("Kohima Pass (Nagaland)", 25.6751, 94.1086),
        ("Imphal Valley (Manipur)", 24.8170, 93.9368),
        ("Aizawl Ridge (Mizoram)", 23.7271, 92.7176),
        ("Agartala Hub (Tripura)", 23.8315, 91.2868),
        ("Itanagar Sector (Arunachal)", 27.0844, 93.6053),
        ("Gangtok Lifeline (Sikkim)", 27.3389, 88.6065),
    ]

    results = []
    for name, lat, lng in key_points:
        w = await weather_service.get_weather_for_corridor(
            location_name=name,
            latitude=lat,
            longitude=lng,
            db=db,
        )
        results.append(w)

    return results
