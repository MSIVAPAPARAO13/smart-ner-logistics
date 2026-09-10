def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_list_districts(client):
    response = client.get("/api/v1/districts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4


def test_list_roads(client):
    response = client.get("/api/v1/roads")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


def test_list_vehicles(client):
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "NER-TRK-01"


def test_simulation_controls(client):
    res_start = client.post("/api/v1/simulation/start")
    assert res_start.status_code == 200
    assert res_start.json()["is_running"] is True

    res_pause = client.post("/api/v1/simulation/pause")
    assert res_pause.status_code == 200
    assert res_pause.json()["is_running"] is False

    res_status = client.get("/api/v1/simulation/status")
    assert res_status.status_code == 200
    assert "vehicle_lat" in res_status.json()
