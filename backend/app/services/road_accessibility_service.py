import logging
from typing import Any, Dict, List, Optional
from shapely.geometry import LineString, Polygon, Point
from app.models.road import Road
from app.models.hazard import Hazard
from app.models.bridge import Bridge

logger = logging.getLogger("sih26002.accessibility")


class RoadAccessibilityService:
    """
    Transparent deterministic rules engine for real-time road & bridge accessibility.
    Evaluates geometric intersection with hazards, weather thresholds, and bridge states.
    """

    def check_road_hazard_intersection(self, road_coords: List[List[float]], hazard_polygon_coords: List[List[List[float]]]) -> bool:
        """
        road_coords: [[lng, lat], ...]
        hazard_polygon_coords: [[[lng, lat], ...]]
        """
        try:
            if len(road_coords) < 2:
                return False
            road_line = LineString(road_coords)
            hazard_poly = Polygon(hazard_polygon_coords[0])
            return road_line.intersects(hazard_poly)
        except Exception as exc:
            logger.error(f"Error checking hazard intersection: {exc}")
            return False

    def compute_road_accessibility(
        self,
        road: Road,
        active_hazards: List[Hazard],
        weather_warning: str = "GREEN",
        soil_moisture: float = 0.35,
    ) -> Dict[str, Any]:
        """
        Calculates road status and accessibility score (0 to 100).
        """
        score = 100.0
        status = "OPEN"
        reasons = []

        # 1. Direct Hazard Intersections
        road_coords = road.geometry_geojson if isinstance(road.geometry_geojson, list) else []
        for hazard in active_hazards:
            if not hazard.is_active:
                continue
            
            # Direct ID mapping check or spatial intersection
            is_affected = False
            if hazard.affected_road_ids and road.id in hazard.affected_road_ids:
                is_affected = True
            elif hazard.polygon_geojson and self.check_road_hazard_intersection(road_coords, hazard.polygon_geojson):
                is_affected = True

            if is_affected:
                if hazard.severity in ["CRITICAL", "SEVERE"]:
                    score = 0.0
                    status = "BLOCKED"
                    reasons.append(f"Direct {hazard.hazard_type} blockage at {hazard.location_name}")
                    return {
                        "status": status,
                        "accessibility_score": score,
                        "reasons": reasons,
                    }
                elif hazard.severity == "HIGH":
                    score = min(score, 30.0)
                    status = "CRITICAL"
                    reasons.append(f"High risk {hazard.hazard_type} in vicinity")
                elif hazard.severity == "MEDIUM":
                    score = min(score, 60.0)
                    if status != "CRITICAL":
                        status = "RISK"
                    reasons.append(f"Moderate hazard alert: {hazard.hazard_type}")

        # 2. Weather & Soil Moisture Factors
        if weather_warning == "RED" or soil_moisture > 0.55:
            score -= 35.0
            if status == "OPEN":
                status = "RISK"
            reasons.append("High soil saturation / Flash flood threat")
        elif weather_warning == "ORANGE" or soil_moisture > 0.45:
            score -= 20.0
            if status == "OPEN":
                status = "WATCH"
            reasons.append("Moderate rain warning")

        # 3. Traffic Adjustment
        if road.traffic_level == "CONGESTED":
            score -= 15.0
        elif road.traffic_level == "HEAVY":
            score -= 8.0

        score = max(0.0, min(100.0, score))
        if score >= 80.0 and status != "BLOCKED" and status != "CRITICAL":
            status = "OPEN"
        elif score >= 60.0 and status != "BLOCKED" and status != "CRITICAL":
            status = "WATCH"
        elif score >= 30.0 and status != "BLOCKED":
            status = "RISK"
        elif score > 0.0 and status != "BLOCKED":
            status = "CRITICAL"

        return {
            "status": status,
            "accessibility_score": round(score, 1),
            "reasons": reasons if reasons else ["Clear normal operating conditions"],
        }


accessibility_service = RoadAccessibilityService()
