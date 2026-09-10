import pytest
from app.services.neural_routing_service import neural_routing_service
from app.services.route_comparison_service import route_comparison_service
from app.services.notification_service import notification_service
from app.core.security import generate_correlation_id, validate_user_access, UserRole, create_simulated_token


def test_neural_route_candidate_generation():
    # When active flood hazard is present
    res_hazard = neural_routing_service.generate_neural_route_candidate(
        origin_name="Guwahati",
        destination_name="Silchar",
        cargo_priority="CRITICAL",
        has_active_hazard=True,
    )
    assert res_hazard["model_version"] == "GNN_RRNCO_NER_V1.4"
    assert len(res_hazard["all_candidates"]) == 2
    # Bypass candidate must be recommended
    top_cand = res_hazard["top_candidate"]
    assert top_cand["candidate_id"] == "NEURAL-CANDIDATE-BYPASS"
    assert top_cand["disruption_risk"] == 0.12
    assert top_cand["predicted_duration_min"] < 500.0


def test_asymmetric_edge_embedding_properties():
    # Uphill vs downhill slope differential
    uphill_cost = neural_routing_service.compute_asymmetric_edge_embedding(
        origin_elev_m=55.0,
        dest_elev_m=1525.0,  # +1470m ascent
        distance_km=98.5,
        base_time_min=150.0,
        rainfall_mm=10.0,
        soil_moisture=0.30,
        slope_deg=8.5,
        disruption_risk=0.05,
        traffic_level_code=0,
        cargo_priority_code=3,
        bridge_status_closed=False,
    )

    downhill_cost = neural_routing_service.compute_asymmetric_edge_embedding(
        origin_elev_m=1525.0,
        dest_elev_m=55.0,  # -1470m descent
        distance_km=98.5,
        base_time_min=150.0,
        rainfall_mm=10.0,
        soil_moisture=0.30,
        slope_deg=8.5,
        disruption_risk=0.05,
        traffic_level_code=0,
        cargo_priority_code=3,
        bridge_status_closed=False,
    )

    # Uphill mountain climb must have higher neural penalty than downhill return
    assert uphill_cost > downhill_cost


def test_route_strategy_comparison_benchmark():
    comparison = route_comparison_service.compare_strategies(has_flood_hazard=True, cargo_priority="CRITICAL")
    assert len(comparison["strategies"]) == 4
    assert comparison["best_strategy"] == "HYBRID_FINAL"

    mode_a = next(s for s in comparison["strategies"] if s["mode_id"] == "BASELINE_OSRM")
    mode_d = next(s for s in comparison["strategies"] if s["mode_id"] == "HYBRID_FINAL")

    # Baseline has 85% risk under flood; Hybrid Final avoids it down to 12%
    assert mode_a["disruption_risk_pct"] == 85.0
    assert mode_d["disruption_risk_pct"] == 12.0
    assert mode_d["stockout_prevented"] is True


def test_multilingual_notification_broadcasting():
    langs = notification_service.get_supported_languages()
    assert len(langs) == 6
    lang_codes = [l["code"] for l in langs]
    assert "en" in lang_codes
    assert "hi" in lang_codes
    assert "as" in lang_codes
    assert "bn" in lang_codes
    assert "kha" in lang_codes
    assert "brx" in lang_codes

    # Translate to Assamese
    as_alert = notification_service.translate_alert(lang_code="as")
    assert as_alert["language_code"] == "as"
    assert as_alert["language_native"] == "অসমীয়া"
    assert len(as_alert["translated_title"]) > 0

    # Translate to Khasi
    kha_alert = notification_service.translate_alert(lang_code="kha")
    assert kha_alert["language_code"] == "kha"
    assert kha_alert["language_native"] == "Ka Ktien Khasi"


def test_security_rbac_and_correlation_id():
    req_id = generate_correlation_id()
    assert req_id.startswith("REQ-")
    assert len(req_id) > 8

    # Admin access check
    assert validate_user_access(UserRole.ADMIN, UserRole.DISPATCHER) is True
    assert validate_user_access(UserRole.VIEWER, UserRole.ADMIN) is False

    token_data = create_simulated_token("officer_sharma", UserRole.FIELD_OFFICER)
    assert token_data["role"] == "FIELD_OFFICER"
    assert "access_token" in token_data
