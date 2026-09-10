import numpy as np
from typing import Dict, Any, List


class FeatureService:
    """
    Standardized feature preprocessor and vector assembler for ML models:
    - LightGBM Travel-Time Regressor
    - LightGBM Disruption-Risk Classifier
    """

    ROAD_TYPE_MAP = {
        "NATIONAL_HIGHWAY": 0,
        "STATE_HIGHWAY": 1,
        "RURAL_ROAD": 2,
    }

    TERRAIN_MAP = {
        "PLAIN": 0,
        "VALLEY": 1,
        "HILLY": 2,
        "GORGE": 3,
    }

    TRAFFIC_MAP = {
        "FREE": 0,
        "NORMAL": 0,
        "SLOW": 1,
        "HEAVY": 2,
        "SEVERE": 3,
        "CONGESTED": 3,
    }

    CARGO_PRIORITY_MAP = {
        "NORMAL": 0,
        "MEDIUM": 1,
        "HIGH": 2,
        "CRITICAL": 3,
    }

    def build_travel_time_features(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Features:
        [distance_km, road_type_code, terrain_code, slope_deg, rainfall_mm,
         soil_moisture, traffic_code, base_time_min, priority_code]
        """
        features = [
            float(data.get("distance_km", 100.0)),
            float(self.ROAD_TYPE_MAP.get(data.get("road_type", "NATIONAL_HIGHWAY"), 0)),
            float(self.TERRAIN_MAP.get(data.get("terrain_type", "HILLY"), 2)),
            float(data.get("slope_deg", 6.5)),
            float(data.get("rainfall_mm", 0.0)),
            float(data.get("soil_moisture", 0.35)),
            float(self.TRAFFIC_MAP.get(data.get("traffic_level", "NORMAL"), 0)),
            float(data.get("base_time_min", 120.0)),
            float(self.CARGO_PRIORITY_MAP.get(data.get("cargo_priority", "CRITICAL"), 3)),
        ]
        return np.array([features])

    def build_disruption_features(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Features:
        [rainfall_mm, precip_prob, soil_moisture, slope_deg,
         traffic_code, bridge_closed_flag, terrain_code, road_type_code]
        """
        features = [
            float(data.get("rainfall_mm", 0.0)),
            float(data.get("precipitation_prob", 20.0)),
            float(data.get("soil_moisture", 0.35)),
            float(data.get("slope_deg", 8.0)),
            float(self.TRAFFIC_MAP.get(data.get("traffic_level", "NORMAL"), 0)),
            1.0 if data.get("bridge_status") == "CLOSED" else 0.0,
            float(self.TERRAIN_MAP.get(data.get("terrain_type", "HILLY"), 2)),
            float(self.ROAD_TYPE_MAP.get(data.get("road_type", "NATIONAL_HIGHWAY"), 0)),
        ]
        return np.array([features])


feature_service = FeatureService()
