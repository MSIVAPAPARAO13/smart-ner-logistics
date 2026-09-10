from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    districts,
    roads,
    bridges,
    vehicles,
    hazards,
    weather,
    field_reports,
    routes,
    simulation,
    intelligence,
    alerts,
    supplies,
    optimization,
    scenarios,
    decisions,
    neural_routing,
    notifications,
    impact,
    auth,
    safe_hubs,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(safe_hubs.router, prefix="/safe-hubs", tags=["Safe Hubs & Relief Depots"])

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(districts.router, prefix="/districts", tags=["Districts"])
api_router.include_router(roads.router, prefix="/roads", tags=["Roads"])
api_router.include_router(bridges.router, prefix="/bridges", tags=["Bridges"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(hazards.router, prefix="/hazards", tags=["Hazards"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(field_reports.router, prefix="/field-reports", tags=["Field Reports"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["ML Intelligence"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Central Alerts"])
api_router.include_router(supplies.router, prefix="/supplies", tags=["Supply Continuity"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Fleet Optimization"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenario Replay"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Operational Decisions"])
api_router.include_router(neural_routing.router, prefix="/neural-routing", tags=["Deep Learning Routing"])
api_router.include_router(neural_routing.router, prefix="/neural-route", tags=["Deep Learning Routing"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Multilingual Notifications"])
api_router.include_router(impact.router, prefix="/impact", tags=["Impact Propagation"])
