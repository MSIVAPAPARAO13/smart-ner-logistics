from app.services.road_accessibility_service import accessibility_service
from app.models.road import Road
from app.models.hazard import Hazard
from app.db.seed_data import SHILLONG_SILCHAR_COORDS, FLOOD_POLYGON_COORDS


def test_road_accessibility_with_active_hazard():
    road = Road(
        id="ROAD-NH06-SHL-SIL",
        road_name="NH-6 Shillong-Silchar",
        distance_km=218.0,
        base_travel_time_min=390.0,
        geometry_geojson=SHILLONG_SILCHAR_COORDS,
        traffic_level="NORMAL",
    )
    hazard = Hazard(
        id="HAZARD-FLOOD-01",
        hazard_type="FLOOD",
        severity="CRITICAL",
        location_name="Ladrymbai",
        center_lat=25.3120,
        center_lng=92.3550,
        polygon_geojson=FLOOD_POLYGON_COORDS,
        affected_road_ids=["ROAD-NH06-SHL-SIL"],
        is_active=True,
    )

    result = accessibility_service.compute_road_accessibility(
        road=road,
        active_hazards=[hazard],
        weather_warning="ORANGE",
        soil_moisture=0.52,
    )
    assert result["status"] == "BLOCKED"
    assert result["accessibility_score"] == 0.0
    assert len(result["reasons"]) > 0
