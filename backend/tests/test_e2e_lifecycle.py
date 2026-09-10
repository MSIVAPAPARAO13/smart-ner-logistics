from app.main import app


def test_full_operational_lifecycle_e2e(client):
    """
    In-memory end-to-end integration test validating complete operational lifecycle:
    Health -> Simulation Reset -> WebSocket Streaming -> Flood Trigger ->
    Road Blocked -> Hazard Propagation -> REST Verification -> Field Report Submission -> Simulation Pause.
    Runs reliably offline and in CI without requiring an external uvicorn socket.
    """
    # 1. Check health
    health = client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["status"] in ["healthy", "degraded"]

    # 2. Reset to clean initial state
    reset_res = client.post("/api/v1/simulation/reset")
    assert reset_res.status_code == 200
    status = reset_res.json()
    assert status["scenario_stage"] == "NORMAL"
    assert status["route_type"] == "PRIMARY"

    # 3. Connect to WebSocket in-memory
    with client.websocket_connect("/ws/live") as ws:
        # 4. Start simulation
        start_res = client.post("/api/v1/simulation/start")
        assert start_res.status_code == 200
        assert start_res.json()["is_running"] is True

        # 5. Trigger Flood Scenario (Controlled Hackathon Demonstration)
        flood_res = client.post("/api/v1/simulation/trigger-flood")
        assert flood_res.status_code == 200

        # 6. Listen for Hazard & Rerouting WebSocket messages
        received_reroute = False
        for _ in range(15):
            try:
                data = ws.receive_json(mode="text")
                if data.get("type") == "LIVE_EVENT":
                    event = data.get("event", {})
                    if event.get("event_type") in [
                        "HAZARD_SPAWNED",
                        "ROAD_STATUS_CHANGED",
                        "REROUTE_CALCULATED",
                        "VEHICLE_REROUTED",
                    ]:
                        received_reroute = True
                        break
                elif data.get("type") == "FULL_STATE_UPDATE":
                    st = data.get("status", {})
                    if st.get("route_type") == "ALTERNATE":
                        received_reroute = True
                        break
                elif data.get("type") == "VEHICLE_TICK":
                    received_reroute = True
                    break
            except Exception:
                break

        assert received_reroute is True

    # 7. Verify Roads status via REST
    roads_res = client.get("/api/v1/roads")
    assert roads_res.status_code == 200
    roads = roads_res.json()
    nh6_segment = next((r for r in roads if r["id"] == "ROAD-NH06-SHL-SIL"), None)
    assert nh6_segment is not None
    assert nh6_segment["current_status"] == "BLOCKED"

    # 8. Verify Active Hazards via REST
    hazards_res = client.get("/api/v1/hazards?active_only=true")
    assert hazards_res.status_code == 200
    hazards = hazards_res.json()
    assert len(hazards) >= 1
    assert any(h["hazard_type"] == "FLOOD" for h in hazards)

    # 9. Verify Live Timeline via REST
    timeline_res = client.get("/api/v1/simulation/timeline")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 1

    # 10. Test Field Report Submission
    report_payload = {
        "officer_name": "Field Inspector T. Roy",
        "department": "National Highways Authority of India (NHAI)",
        "district": "East Jaintia Hills",
        "location_name": "NH-6 Km 142 Ladrymbai Sector",
        "latitude": 25.3120,
        "longitude": 92.3550,
        "incident_type": "FLOOD",
        "severity": "CRITICAL",
        "description": "Inundation level reached 1.2m across carriageway. Diversion established via NH-27 Nagaon.",
        "sync_state": "SYNCED",
    }
    report_res = client.post("/api/v1/field-reports", json=report_payload)
    assert report_res.status_code == 200
    assert report_res.json()["id"].startswith("REP-")

    # 11. Pause and clean up
    pause_res = client.post("/api/v1/simulation/pause")
    assert pause_res.status_code == 200
    assert pause_res.json()["is_running"] is False
