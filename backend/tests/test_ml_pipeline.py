import pytest
from app.services.travel_time_service import travel_time_predictor
from app.services.disruption_service import disruption_predictor
from app.services.elevation_service import elevation_service
from app.services.traffic_service import traffic_service


def test_travel_time_predictor():
    sample_data = {
        "road_id": "ROAD-NH06-SHL-SIL",
        "base_time_min": 390.0,
        "distance_km": 218.0,
        "road_type": "NATIONAL_HIGHWAY",
        "terrain_type": "HILLY",
        "slope_deg": 14.0,
        "rainfall_mm": 65.0,
        "soil_moisture": 0.55,
        "traffic_level": "HEAVY",
        "cargo_priority": "CRITICAL",
    }

    result = travel_time_predictor.predict_travel_time(sample_data)
    assert result["predicted_time_min"] >= sample_data["base_time_min"]
    assert result["predicted_delay_min"] > 0
    assert len(result["top_factors"]) > 0
    assert travel_time_predictor.mae >= 0


def test_disruption_risk_predictor():
    high_hazard_data = {
        "road_id": "ROAD-NH06-SHL-SIL",
        "rainfall_mm": 90.0,
        "precipitation_prob": 98.0,
        "soil_moisture": 0.62,
        "slope_deg": 18.5,
        "bridge_status": "CLOSED",
        "traffic_level": "SEVERE",
    }

    result = disruption_predictor.predict_disruption_risk(high_hazard_data)
    assert result["disruption_probability"] >= 0.70
    assert result["risk_class"] == "CRITICAL"
    assert result["accessibility_status"] == "BLOCKED"
    assert len(result["key_drivers"]) > 0


@pytest.mark.asyncio
async def test_elevation_slope_calculation():
    coords = [[91.7362, 26.1445], [91.8933, 25.5788], [92.7789, 24.8333]]
    avg_elev, max_elev, avg_slope = await elevation_service.calculate_corridor_slope(coords)
    assert avg_elev > 0
    assert avg_slope >= 0


def test_traffic_delay_evaluation():
    eval_free = traffic_service.evaluate_traffic_speed(50.0, 48.0)
    assert eval_free["level"] == "FREE"
    assert eval_free["delay_factor"] == 1.0

    eval_heavy = traffic_service.evaluate_traffic_speed(50.0, 18.0)
    assert eval_heavy["level"] == "HEAVY"
    assert eval_heavy["delay_factor"] > 1.2
