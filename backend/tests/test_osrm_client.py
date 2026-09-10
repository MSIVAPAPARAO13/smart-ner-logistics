import pytest
from app.services.osrm_client import OSRMClient


def test_parse_osrm_response():
    client = OSRMClient()
    dummy_osrm_data = {
        "code": "Ok",
        "routes": [
            {
                "distance": 316500.0,
                "duration": 32400.0,
                "geometry": {
                    "coordinates": [
                        [91.7362, 26.1445],
                        [91.8933, 25.5788],
                        [92.7789, 24.8333],
                    ],
                    "type": "LineString",
                },
            },
            {
                "distance": 347000.0,
                "duration": 29400.0,
                "geometry": {
                    "coordinates": [
                        [91.7362, 26.1445],
                        [92.6840, 26.3452],
                        [92.7789, 24.8333],
                    ],
                    "type": "LineString",
                },
            },
        ],
    }

    parsed = client.parse_osrm_response(dummy_osrm_data)
    assert len(parsed) == 2
    assert parsed[0]["distance_km"] == 316.5
    assert parsed[0]["duration_min"] == 540.0
    assert parsed[0]["type"] == "PRIMARY"
    assert parsed[1]["distance_km"] == 347.0
    assert parsed[1]["type"] == "ALTERNATE"
    assert len(parsed[0]["coordinates"]) == 3
