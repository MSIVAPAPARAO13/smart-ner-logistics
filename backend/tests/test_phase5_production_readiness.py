import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.adapters.transport_adapter import transport_adapter
from app.adapters.government_adapter import government_adapter

client = TestClient(app)


def test_health_and_readiness_endpoints():
    """Verifies production health, readiness, and liveness endpoints."""
    # Liveness
    live_res = client.get("/api/v1/health/live")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "LIVE"

    # Readiness
    ready_res = client.get("/api/v1/health/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] in ["READY", "NOT_READY"]
    assert "database" in ready_res.json()["components"]

    # Demo Checklist Matrix
    demo_res = client.get("/api/v1/health/demo-checklist")
    assert demo_res.status_code == 200
    data = demo_res.json()
    assert "checklist" in data
    assert len(data["checklist"]) >= 14
    assert data["demo_status"] == "FULL_DEMO_READY"


def test_transport_system_adapter():
    """Verifies TransportSystemAdapter contract and demonstration provider data lineage."""
    vehicles = transport_adapter.get_vehicles()
    assert len(vehicles) == 4
    for v in vehicles:
        assert "data_source" in v
        assert "DEMO TRANSPORT DATA" in v["data_source"]

    pos = transport_adapter.get_vehicle_position("MED-01")
    assert pos is not None
    assert pos["vehicle_id"] == "MED-01"
    assert "latitude" in pos and "longitude" in pos

    cap = transport_adapter.get_fleet_capacity()
    assert cap["total_vehicles"] == 4
    assert cap["utilization_pct"] > 0.0

    depot = transport_adapter.get_depot_status("DEPOT-GHY-01")
    assert depot["district"] == "Kamrup Metropolitan"
    assert depot["dispatch_readiness"] == "OPTIMAL"


def test_government_monitoring_adapter():
    """Verifies GovernmentMonitoringAdapter data feeds and source transparency."""
    roads = government_adapter.get_road_updates()
    assert len(roads) >= 2
    assert "data_source" in roads[0]

    bridges = government_adapter.get_bridge_updates()
    assert len(bridges) >= 2
    assert "monitoring_agency" in bridges[0]

    incidents = government_adapter.get_incident_updates()
    assert len(incidents) >= 1

    alerts = government_adapter.get_alerts()
    assert len(alerts) >= 1
    assert "MDoNER" in alerts[0]["title"] or "Lifeline" in alerts[0]["title"]


def test_field_report_lifecycle_verification():
    """Verifies complete field incident lifecycle: REPORTED -> VERIFIED -> RESOLVED."""
    # 1. Submit report
    report_payload = {
        "officer_name": "R. K. Barman",
        "department": "ASDMA Cachar District Operations",
        "district": "Cachar",
        "location_name": "NH-6 Sonapur Crossing",
        "latitude": 25.0500,
        "longitude": 92.3500,
        "incident_type": "LANDSLIDE",
        "severity": "HIGH",
        "description": "Debris clearance in progress; single lane accessible.",
        "sync_state": "REPORTED",
    }
    create_res = client.post("/api/v1/field-reports", json=report_payload)
    assert create_res.status_code == 200
    report_data = create_res.json()
    report_id = report_data["id"]

    # 2. Officer verifies report
    verify_res = client.post(f"/api/v1/field-reports/{report_id}/verify")
    assert verify_res.status_code == 200
    assert verify_res.json()["lifecycle_state"] == "VERIFIED"

    # 3. Resolve incident
    resolve_res = client.post(f"/api/v1/field-reports/{report_id}/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["lifecycle_state"] == "RESOLVED"


def test_secure_upload_validation():
    """Verifies security controls on field evidence photo uploads."""
    # Invalid extension rejection
    invalid_file = ("script.exe", b"binary content", "application/x-msdownload")
    res = client.post("/api/v1/field-reports/upload", files={"file": invalid_file})
    assert res.status_code == 400
    assert "Invalid image extension" in res.json()["detail"]

    # Valid PNG upload acceptance
    valid_file = ("ground_evidence.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", "image/png")
    valid_res = client.post("/api/v1/field-reports/upload", files={"file": valid_file})
    assert valid_res.status_code == 200
    assert valid_res.json()["status"] == "SECURELY_STORED"
    assert "photo_url" in valid_res.json()
