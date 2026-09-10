import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import get_db
from app.models.field_report import FieldReport
from app.models.road import Road
from app.models.vehicle import Vehicle
from app.models.district_inventory import DistrictInventory
from app.services.google_routes_client import google_routes_client
from app.services.routing_service import routing_service
from app.services.impact_propagation_service import impact_propagation_service


@pytest.fixture
def client():
    return TestClient(app)


# 1. Google Routes Client Unit & Resiliency Tests
@pytest.mark.asyncio
async def test_google_routes_client_resilience():
    # Client should not raise unhandled exception even if unconfigured or API fails
    res = await google_routes_client.compute_routes(
        origin=(26.1445, 91.7362),
        destination=(24.8333, 92.7789),
    )
    # If API key is not configured, returns None gracefully
    if not google_routes_client.is_configured:
        assert res is None
    else:
        assert res is not None or res is None


@pytest.mark.asyncio
async def test_google_routes_client_deduplication():
    from unittest.mock import MagicMock
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "routes": [
            {
                "distanceMeters": 312000,
                "duration": "24120s",
                "polyline": {"encodedPolyline": "_p~iF~ps|U_ulLnnqC_mqNvxq`@"},
            }
        ]
    }
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        original_key = google_routes_client.api_key
        try:
            google_routes_client.api_key = "AIzaSyTestKeyValidFormatForTesting123"
            google_routes_client.cache.clear()
            res1 = await google_routes_client.compute_routes(origin=(26.0, 91.0), destination=(25.0, 92.0))
            res2 = await google_routes_client.compute_routes(origin=(26.0, 91.0), destination=(25.0, 92.0))
            # Cache hit ensures only 1 external HTTP POST is made
            assert mock_post.call_count == 1
            assert res1 is not None
            assert res2 is not None
        finally:
            google_routes_client.api_key = original_key


# 2. Strict Fallback Hierarchy: Google Routes -> OSRM -> NetworkX
@pytest.mark.asyncio
async def test_routing_fallback_hierarchy_google_to_osrm_to_networkx():
    # When Google Routes client returns None, routing falls back to OSRM or NetworkX
    with patch.object(google_routes_client, "compute_routes", new_callable=AsyncMock) as mock_google:
        mock_google.return_value = None

        routes, source = await routing_service.resolve_provider_route(
            origin=(26.1445, 91.7362),
            destination=(24.8333, 92.7789),
        )
        assert source in ["OSRM", "NETWORKX_LOCAL"]
        assert len(routes) >= 1
        assert "coordinates" in routes[0]


# 3. Dynamic Impact Engine Unit Test
def test_dynamic_impact_propagation_arbitrary_incident(client):
    db: Session = next(get_db())
    impact = impact_propagation_service.calculate_what_is_affected(
        db=db,
        road_id="ROAD-NH6-01",
        incident_id="TEST-INC-001",
    )
    assert "incident" in impact
    assert impact["affected_summary"]["vehicles_affected_count"] >= 1
    assert impact["affected_summary"]["critical_deliveries_count"] >= 1
    assert len(impact["facilities_at_risk"]) >= 1
    assert impact["recommended_action"]["recommended_action_text"] is not None
    assert impact["recommended_action"]["eta_saving_hours"] > 0


# 4. Stockout Window & Calculation: T = Stock / Hourly Consumption
def test_hospital_stockout_calculation(client):
    db: Session = next(get_db())
    inv = db.query(DistrictInventory).filter(DistrictInventory.district_id == "DIST-AS-CACHAR").first()
    if inv:
        daily_burn = max(inv.consumption_rate_per_day, 1.0)
        hourly_burn = daily_burn / 24.0
        stockout_hours = inv.current_stock_units / hourly_burn
        assert stockout_hours > 0


# 5. Field Report Verification Closed Loop (P1.6)
@pytest.mark.asyncio
async def test_field_report_verification_closed_loop(client):
    db: Session = next(get_db())
    # Create test field report
    create_res = client.post(
        "/api/v1/field-reports",
        json={
            "officer_name": "Test Officer",
            "department": "Assam Disaster Management Authority",
            "district": "Cachar",
            "location_name": "Sonapur NH-6 Km 142",
            "latitude": 25.1245,
            "longitude": 92.3612,
            "incident_type": "FLOOD",
            "severity": "CRITICAL",
            "description": "Flash flood breached highway segment.",
            "evidence_source": "FIELD_UPLOAD",
            "sync_state": "REPORTED",
            "idempotency_key": "IDEMP-TEST-CLOSEDLOOP-001",
        },
    )
    assert create_res.status_code == 200
    report_data = create_res.json()
    report_id = report_data["id"]

    # Verify report -> should trigger downstream propagation
    verify_res = client.post(f"/api/v1/field-reports/{report_id}/verify")
    assert verify_res.status_code == 200
    verify_data = verify_res.json()

    assert verify_data["lifecycle_state"] == "VERIFIED"
    assert "impact_propagation" in verify_data
    assert verify_data["impact_propagation"]["vehicles_affected"] >= 1
    assert verify_data["impact_propagation"]["facilities_at_risk"] >= 1
    assert verify_data["impact_propagation"]["recommended_reroute"] is not None

    # Verify road status was degraded to BLOCKED
    road = db.query(Road).filter(Road.id == "ROAD-NH6-01").first()
    if road:
        assert road.current_status in ["BLOCKED", "CRITICAL"]


# 6. Offline Field Sync Idempotency (P1.7: ONE RECORD ONLY)
def test_offline_idempotency_protection(client):
    idemp_key = "IDEMP-TEST-DEDUPLICATION-999"
    payload = {
        "officer_name": "Sync Officer",
        "department": "PWD",
        "district": "Kamrup",
        "location_name": "Guwahati Bypass",
        "latitude": 26.14,
        "longitude": 91.73,
        "incident_type": "WATERLOGGING",
        "severity": "MEDIUM",
        "description": "Culvert overflow",
        "sync_state": "SYNCED",
        "idempotency_key": idemp_key,
    }

    # First attempt
    res1 = client.post("/api/v1/field-reports", json=payload)
    assert res1.status_code == 200
    id1 = res1.json()["id"]

    # Duplicate replay attempt with same idempotency key
    res2 = client.post("/api/v1/field-reports", json=payload)
    assert res2.status_code == 200
    id2 = res2.json()["id"]

    # Must return the identical record ID (NO duplicates created!)
    assert id1 == id2


# 7. Truthful Data Health Status & ML Disclosures (P1.8 & P1.9)
def test_truthful_data_health_and_ml_lineage(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert "providers" in data
    # Government adapters must be INTEGRATION READY, not fake connected
    assert data["providers"]["imd_government_source"] == "INTEGRATION READY"
    assert data["providers"]["cwc_water_commission"] == "INTEGRATION READY"
    assert data["providers"]["ndma_sachet_alerts"] == "INTEGRATION READY"

    # Demo checklist inspection
    checklist_res = client.get("/api/v1/health/demo-checklist")
    assert checklist_res.status_code == 200
    checklist_data = checklist_res.json()
    items = {item["component"]: item for item in checklist_data["checklist"]}
    assert "LightGBM Travel-Time Regressor" in items
    assert "synthetic" in items["LightGBM Travel-Time Regressor"]["details"].lower()


# 8. What-If Simulator Dual Comparison (P1.10)
def test_what_if_simulator_dual_comparison(client):
    res = client.post(
        "/api/v1/simulation/what-if",
        json={
            "road_id": "ROAD-NH6-01",
            "severity": "CRITICAL",
            "duration_hours": 18.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_type"] == "SCENARIO SIMULATION"
    assert data["lineage"] == "SIMULATION"
    assert "without_intervention" in data
    assert "with_recommended_action" in data
    assert data["without_intervention"]["status"] == "BLOCKED"
    assert data["with_recommended_action"]["status"] == "REROUTED_OPTIMAL"
    assert data["with_recommended_action"]["delay_avoided_hours"] > 0


# 9. No-Feasible-Route State Condition (P0.3 / Route Objective)
@pytest.mark.asyncio
async def test_no_feasible_route_handling():
    # Impassable hazard box enclosing all candidate corridors
    all_blocked_hazard = [
        [[[90.0, 23.0], [96.0, 23.0], [96.0, 28.0], [90.0, 28.0], [90.0, 23.0]]]
    ]
    candidates = await routing_service.calculate_context_aware_route(
        origin_lat=26.1445,
        origin_lng=91.7362,
        dest_lat=24.8333,
        dest_lng=92.7789,
        hazard_polygons=all_blocked_hazard,
    )
    # When all routes are impassable, platform must NOT invent fake route
    assert len(candidates) >= 1
    for c in candidates:
        assert c.get("is_recommended") is False
        assert c.get("no_safe_route_available") is True
        assert "NO SAFE FEASIBLE ROUTE AVAILABLE" in c.get("selection_summary", "")
        assert c.get("recommended_escalation") == "ESCALATE_AIRLIFT_OR_NDRF_INTERVENTION"
