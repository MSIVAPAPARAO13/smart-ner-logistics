import pytest
from app.services.supply_continuity_service import supply_continuity_service
from app.services.shortage_service import shortage_service
from app.services.decision_service import decision_service
from app.services.optimization_service import optimization_engine
from app.services.scenario_service import scenario_service


def test_supply_stockout_calculation():
    # Case 1: Normal safe arrival
    metrics = supply_continuity_service.calculate_stockout_metrics(
        current_stock=35.0,
        daily_consumption=12.0,  # 0.5 units/hr -> 70 hrs stockout
        incoming_quantity=8.5,
        incoming_eta_hours=8.0,  # arrives in 8h (stock will be 35 - 4 = 31 units)
        critical_threshold=20.0,
        cargo_priority="CRITICAL",
    )
    assert metrics["hours_until_stockout"] == 70.0
    assert metrics["expected_stock_at_arrival"] == 31.0
    assert metrics["status"] == "SAFE"
    assert metrics["shortage_risk"] == "LOW"

    # Case 2: Severe delay causing stockout breach
    delayed_metrics = supply_continuity_service.calculate_stockout_metrics(
        current_stock=10.0,
        daily_consumption=24.0,  # 1.0 unit/hr -> 10 hrs stockout
        incoming_quantity=8.5,
        incoming_eta_hours=14.0,  # arrives in 14h > 10h stockout
        critical_threshold=15.0,
        cargo_priority="CRITICAL",
    )
    assert delayed_metrics["hours_until_stockout"] == 10.0
    assert delayed_metrics["status"] == "CRITICAL"
    assert delayed_metrics["shortage_risk"] == "CRITICAL"
    assert delayed_metrics["recommended_action"] == "IMMEDIATE_REROUTE_OR_RESERVE_DISPATCH"


def test_supply_impact_graph_tracing():
    impact = supply_continuity_service.trace_disruption_impact("ROAD-NH06-SHL-SIL")
    assert impact["corridor_status"] == "BLOCKED"
    assert impact["total_vehicles_affected"] >= 1
    assert "EMERGENCY_MEDICINE" in impact["highest_risk_supply"]
    assert len(impact["impacted_supplies"]) >= 1


def test_shortage_prediction_service():
    prediction = shortage_service.predict_district_shortages("DIST-AS-CACHAR")
    assert prediction["district_id"] == "DIST-AS-CACHAR"
    assert prediction["total_monitored_supplies"] >= 1
    assert "overall_shortage_risk" in prediction


def test_decision_service_recommendations():
    normal_decisions = decision_service.generate_action_recommendations("NORMAL", "OPEN")
    assert len(normal_decisions) >= 1
    assert normal_decisions[0]["status"] == "ACTIVE"

    blocked_decisions = decision_service.generate_action_recommendations("ROAD_BLOCKED", "BLOCKED")
    assert len(blocked_decisions) >= 2
    med_decision = next((d for d in blocked_decisions if d["vehicle_id"] == "NER-MED-01"), None)
    assert med_decision is not None
    assert med_decision["priority"] == "CRITICAL"
    assert med_decision["action_type"] == "IMMEDIATE_REROUTE"


def test_optimization_engine_multi_vehicle():
    vehicles = [
        {"id": "NER-MED-01", "vehicle_number": "AS-01-GC-4482", "capacity_tons": 8.5, "status": "EN_ROUTE"},
        {"id": "NER-FOOD-02", "vehicle_number": "AS-01-FD-2091", "capacity_tons": 15.0, "status": "EN_ROUTE"},
        {"id": "NER-RELIEF-03", "vehicle_number": "AS-01-RF-5530", "capacity_tons": 10.0, "status": "EN_ROUTE"},
        {"id": "NER-CON-04", "vehicle_number": "AS-01-CN-8812", "capacity_tons": 20.0, "status": "EN_ROUTE"},
    ]
    supplies = [
        {"id": "SUP-MED-001", "supply_type": "EMERGENCY_MEDICINE", "priority": "CRITICAL", "quantity_units": 8.5},
        {"id": "SUP-GRAIN-002", "supply_type": "FOOD_GRAINS", "priority": "HIGH", "quantity_units": 15.0},
        {"id": "SUP-RELIEF-003", "supply_type": "RELIEF_KITS", "priority": "HIGH", "quantity_units": 10.0},
        {"id": "SUP-CON-004", "supply_type": "CONSTRUCTION_MATERIALS", "priority": "NORMAL", "quantity_units": 20.0},
    ]
    hazards = [{"id": "HAZARD-FLOOD-LADRYMBAI", "hazard_type": "FLOOD", "is_active": True}]

    res = optimization_engine.optimize_fleet_dispatch(vehicles, supplies, hazards, persist_run=False)
    assert res["status"] == "OPTIMIZED"
    assert res["total_assigned"] == 4
    assert res["unassigned_count"] == 0

    # Medicine must be assigned to alternate bypass corridor
    med_assignment = next(a for a in res["assignments"] if a["priority"] == "CRITICAL")
    assert med_assignment["assigned_route_id"] == "ROUTE-ALTERNATE-01"


@pytest.mark.asyncio
async def test_scenario_deterministic_replay():
    catalog = scenario_service.get_scenario_list()
    assert len(catalog) >= 1
    assert catalog[0]["id"] == "SCENARIO_HERO_FLOOD"

    await scenario_service.reset()
    state = scenario_service.get_current_state()
    assert state["current_step"] == 0

    step_state = await scenario_service.step_forward()
    assert step_state["current_step"] == 1

    reset_state = await scenario_service.reset()
    assert reset_state["current_step"] == 0
