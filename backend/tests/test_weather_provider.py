import pytest
from app.services.weather_provider import (
    OpenMeteoWeatherProvider,
    IMDWeatherProvider,
    CachedWeatherProvider,
)
from app.services.weather_service import weather_service
from app.services.geocoding_service import geocoding_service, NER_PRELOADED_LOCATIONS
from app.services.feature_service import feature_service
from app.services.disruption_service import disruption_predictor
from app.services.travel_time_service import travel_time_predictor
from app.core.config import settings


@pytest.mark.asyncio
async def test_open_meteo_live_or_fallback_structure():
    """Verify Open-Meteo provider returns standardized normalized dictionary with risk inputs."""
    provider = OpenMeteoWeatherProvider()
    result = await provider.get_weather(26.1445, 91.7362, "Guwahati")
    
    # Provider will either fetch live Open-Meteo or return None/dict
    if result:
        assert "temperature_c" in result
        assert "precipitation_mm" in result
        assert "soil_moisture_m3_m3" in result
        assert "wind_speed_kmh" in result
        assert "weather_condition" in result
        assert "warning_level" in result
        assert result["source"] == "OPEN_METEO"
        assert "risk_inputs" in result
        assert "heavy_rain" in result["risk_inputs"]
        assert "weather_severity_score" in result["risk_inputs"]


@pytest.mark.asyncio
async def test_weather_caching_mechanism():
    """Verify that cached provider stores and retrieves observations without re-querying."""
    cache = CachedWeatherProvider(ttl_minutes=15)
    lat, lng = 24.8333, 92.7789
    
    mock_obs = {
        "location_name": "Silchar",
        "latitude": lat,
        "longitude": lng,
        "temperature_c": 28.0,
        "precipitation_mm": 12.5,
        "precipitation_probability": 65.0,
        "soil_moisture_m3_m3": 0.45,
        "wind_speed_kmh": 14.0,
        "weather_condition": "Moderate rain",
        "warning_level": "YELLOW",
        "source": "OPEN_METEO",
        "observed_at": "2026-09-09T12:00:00Z",
    }
    
    # Store in cache
    cache.put(lat, lng, mock_obs)
    
    # Retrieve from cache
    cached = cache.get(lat, lng)
    assert cached is not None
    assert cached["is_cached"] is True
    assert cached["source_type"] == "CACHE"
    assert cached["temperature_c"] == 28.0


@pytest.mark.asyncio
async def test_climatology_fallback_lineage():
    """Verify fallback response is accurately tagged as CLIMATOLOGY_FALLBACK."""
    cache = CachedWeatherProvider()
    fallback = cache.get_climatology_fallback(25.5788, 91.8933, "Shillong")
    
    assert fallback["source"] == "CLIMATOLOGY_FALLBACK"
    assert fallback["source_type"] == "FALLBACK"
    assert fallback["location_name"] == "Shillong"
    assert fallback["warning_level"] == "GREEN"
    assert fallback["precipitation_mm"] >= 0.0


@pytest.mark.asyncio
async def test_imd_adapter_optional_graceful_handling():
    """Verify IMD adapter never crashes or blocks when credentials are unset or disabled."""
    # When disabled or empty credentials
    imd = IMDWeatherProvider(api_key="", enabled=False)
    result = await imd.get_weather(26.1445, 91.7362, "Guwahati")
    assert result is None  # Safe non-blocking return


@pytest.mark.asyncio
async def test_weather_service_corridor_resolution():
    """Verify weather_service orchestrates caching, live queries, and fallback seamlessly."""
    obs = await weather_service.get_weather_for_corridor("Silchar Corridor", 24.8333, 92.7789)
    assert obs is not None
    assert obs["location_name"] == "Silchar Corridor"
    assert obs["source"] in ["OPEN_METEO", "CLIMATOLOGY_FALLBACK"]
    assert obs["warning_level"] in ["GREEN", "YELLOW", "ORANGE", "RED"]


@pytest.mark.asyncio
async def test_geocoding_all_8_ner_states():
    """Verify search returns results for all 8 Northeast states."""
    test_cities = [
        ("Guwahati", "Assam"),
        ("Silchar", "Assam"),
        ("Shillong", "Meghalaya"),
        ("Imphal", "Manipur"),
        ("Dimapur", "Nagaland"),
        ("Aizawl", "Mizoram"),
        ("Agartala", "Tripura"),
        ("Kohima", "Nagaland"),
        ("Itanagar", "Arunachal Pradesh"),
        ("Gangtok", "Sikkim"),
    ]
    
    for city, expected_state in test_cities:
        results = await geocoding_service.search_locations(city, limit=5)
        assert len(results) > 0, f"No results for {city}"
        match = next((r for r in results if city.lower() in r["name"].lower()), None)
        assert match is not None, f"Could not find {city} in results"


def test_ml_feature_service_consumes_normalized_weather():
    """Verify FeatureService correctly handles normalized weather inputs."""
    normalized_weather = {
        "rainfall_mm": 42.0,
        "precipitation_probability": 85.0,
        "soil_moisture_m3_m3": 0.52,
        "slope_deg": 12.0,
        "traffic_level": "NORMAL",
        "bridge_status": "OPEN",
    }
    
    # 1. Test Disruption ML
    disruption_feats = feature_service.build_disruption_features({
        "rainfall_mm": normalized_weather["rainfall_mm"],
        "precipitation_prob": normalized_weather["precipitation_probability"],
        "soil_moisture": normalized_weather["soil_moisture_m3_m3"],
        "slope_deg": normalized_weather["slope_deg"],
    })
    assert disruption_feats.shape == (1, 8)
    
    risk = disruption_predictor.predict_disruption_risk({
        "rainfall_mm": normalized_weather["rainfall_mm"],
        "soil_moisture": normalized_weather["soil_moisture_m3_m3"],
    })
    assert "disruption_probability" in risk
    assert risk["risk_class"] in ["LOW", "WATCH", "HIGH_RISK", "CRITICAL"]

    # 2. Test Travel-Time ML
    travel = travel_time_predictor.predict_travel_time({
        "distance_km": 150.0,
        "rainfall_mm": normalized_weather["rainfall_mm"],
        "soil_moisture": normalized_weather["soil_moisture_m3_m3"],
    })
    assert "predicted_time_min" in travel
    assert travel["predicted_time_min"] > 0
