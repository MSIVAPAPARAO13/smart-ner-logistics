import pytest
from app.services.routing_service import routing_service
from app.db.seed_data import (
    GUWAHATI_SILCHAR_PRIMARY_COORDS,
    FLOOD_POLYGON_COORDS,
)


@pytest.mark.asyncio
async def test_route_collision_detection():
    # Primary NH-6 route goes through Ladrymbai flood polygon
    is_blocked = routing_service.check_route_blocked(
        GUWAHATI_SILCHAR_PRIMARY_COORDS,
        [FLOOD_POLYGON_COORDS],
    )
    assert is_blocked is True


@pytest.mark.asyncio
async def test_alternate_route_generation():
    # When flood polygon is active, calculate_route returns an alternate detour route
    route = await routing_service.calculate_route(
        origin_lat=26.1445,
        origin_lng=91.7362,
        dest_lat=24.8333,
        dest_lng=92.7789,
        hazard_polygons=[FLOOD_POLYGON_COORDS],
        avoid_hazard=True,
    )
    assert route["route_type"] == "ALTERNATE"
    assert route["is_blocked"] is False
    assert route["distance_km"] > 0
    assert len(route["polyline_geojson"]) > 2


@pytest.mark.asyncio
async def test_provider_routing_fallback_hierarchy():
    # Tests provider resolution fallback: Google Routes -> OSRM -> NetworkX
    routes, source = await routing_service.resolve_provider_route(
        origin=(26.1445, 91.7362),
        destination=(24.8333, 92.7789),
    )
    assert source in ["GOOGLE_ROUTES", "OSRM", "NETWORKX_LOCAL"]
    assert len(routes) >= 1
    assert "coordinates" in routes[0]


@pytest.mark.asyncio
async def test_no_feasible_route_when_all_blocked():
    # When both primary and alternate are intersecting hazard polygons
    full_block_polygons = [
        # Large polygon covering both Guwahati-Shillong-Silchar and Nagaon-Haflong
        [[[91.0, 24.0], [95.0, 24.0], [95.0, 27.0], [91.0, 27.0], [91.0, 24.0]]]
    ]
    candidates = await routing_service.calculate_context_aware_route(
        origin_lat=26.1445,
        origin_lng=91.7362,
        dest_lat=24.8333,
        dest_lng=92.7789,
        hazard_polygons=full_block_polygons,
        is_flood_active=True,
    )
    # Neither should be recommended when all are blocked
    assert all(not c["is_recommended"] for c in candidates)
    assert any(c.get("no_safe_route_available") is True for c in candidates)

