import pytest
from app.services.simulation_service import simulation_service


@pytest.mark.asyncio
async def test_simulation_lifecycle_and_flood_trigger():
    await simulation_service.reset()
    status = simulation_service.get_status()
    assert status["is_running"] is False
    assert status["scenario_stage"] == "NORMAL"
    assert status["route_type"] == "PRIMARY"
    assert status["delay_min"] == 0.0

    # Trigger controlled flood
    await simulation_service.trigger_flood_scenario()
    status_flood = simulation_service.get_status()
    assert status_flood["scenario_stage"] == "ALTERNATE_ROUTE_ACTIVE"
    assert status_flood["route_type"] == "ALTERNATE"
    assert status_flood["delay_min"] == 55.0
    assert status_flood["active_hazard_id"] == "HAZARD-FLOOD-LADRYMBAI"

    # Reset
    await simulation_service.reset()
    status_reset = simulation_service.get_status()
    assert status_reset["route_type"] == "PRIMARY"
    assert status_reset["delay_min"] == 0.0
