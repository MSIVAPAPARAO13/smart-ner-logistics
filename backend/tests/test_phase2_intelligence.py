import pytest
from app.services.routing_service import routing_service
from app.services.alert_service import alert_service
from app.services.optimization_service import optimization_engine


@pytest.mark.asyncio
async def test_context_aware_routing_with_priority():
    candidates = await routing_service.calculate_context_aware_route(
        origin_lat=26.1445,
        origin_lng=91.7362,
        dest_lat=24.8333,
        dest_lng=92.7789,
        cargo_type="EMERGENCY_MEDICAL_SUPPLIES",
        priority="CRITICAL",
        is_flood_active=True,
    )
    assert len(candidates) == 2
    recommended = next(c for c in candidates if c["is_recommended"])
    assert recommended["route_type"] == "ALTERNATE"
    assert "Disruption" in recommended["selection_summary"] or "Priority" in recommended["selection_summary"]


@pytest.mark.asyncio
async def test_alert_creation():
    alert = await alert_service.create_and_broadcast_alert(
        alert_type="BRIDGE_CLOSED",
        severity="DANGER",
        title="Lubha Bridge Closed",
        message="Water level exceeded danger mark by 1.8m",
        entity_id="BRG-LUBHA-SONAPUR",
    )
    assert alert.id.startswith("ALT-")
    assert alert.severity == "DANGER"


def test_optimization_engine_dispatch():
    vehicles = [{"id": "NER-TRK-01", "vehicle_number": "AS-01-GC-4482", "status": "IDLE", "capacity_tons": 10.0}]
    supplies = [{"id": "SUP-01", "supply_type": "EMERGENCY_MEDICINE", "priority": "CRITICAL", "quantity_units": 5.0}]
    res = optimization_engine.optimize_fleet_dispatch(vehicles, supplies, active_hazards=[{"id": "HAZARD-1"}])
    assert res["status"] == "OPTIMIZED"
    assert res["total_assigned"] == 1
