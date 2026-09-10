import logging
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.feature_service import feature_service
from app.services.elevation_service import elevation_service

logger = logging.getLogger("sih26002.neural_feature")


class NeuralFeatureService:
    """
    Unified Neural Feature Service (Phase 4):
    Builds structured node and edge feature tensors for the Graph Neural Network / RRNCO
    candidate generator directly from the application's single source of truth context pipeline.
    """

    def __init__(self):
        self.feature_version = "NER_GNN_FEAT_V1.4"
        self.node_feature_names = [
            "latitude_norm",
            "longitude_norm",
            "elevation_m_norm",
            "is_depot",
            "is_lifeline_hospital",
            "demand_weight",
        ]
        self.edge_feature_names = [
            "distance_km_norm",
            "base_travel_time_min_norm",
            "predicted_travel_time_min_norm",
            "traffic_density_norm",
            "precipitation_mm_norm",
            "soil_moisture_norm",
            "uphill_grade_pct",
            "downhill_grade_pct",
            "elevation_change_m",
            "disruption_probability",
            "road_accessibility_score",
            "bridge_clearance_status",
            "cargo_priority_weight",
            "hazard_exposure_factor",
        ]

    def build_node_features(
        self,
        node_id: str,
        lat: float,
        lng: float,
        elevation_m: float,
        is_depot: bool = False,
        is_lifeline_hospital: bool = False,
        demand_weight: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Extracts normalized node features for GNN input.
        """
        # Normalization bounds for NER coordinates
        lat_norm = (lat - 24.0) / 4.0  # Approx 24.0N - 28.0N
        lng_norm = (lng - 89.0) / 9.0  # Approx 89.0E - 98.0E
        elev_norm = min(1.0, max(0.0, elevation_m / 2500.0))

        features_vector = [
            round(lat_norm, 4),
            round(lng_norm, 4),
            round(elev_norm, 4),
            1.0 if is_depot else 0.0,
            1.0 if is_lifeline_hospital else 0.0,
            round(demand_weight, 2),
        ]

        return {
            "node_id": node_id,
            "features_vector": features_vector,
            "feature_dim": len(features_vector),
        }

    def build_directional_edge_features(
        self,
        u_node: str,
        v_node: str,
        u_lat: float,
        u_lng: float,
        v_lat: float,
        v_lng: float,
        distance_km: float,
        base_travel_time_min: float,
        predicted_travel_time_min: float,
        rainfall_mm: float,
        soil_moisture: float,
        traffic_level: str,
        disruption_probability: float,
        accessibility_score: float,
        cargo_priority: str,
        bridge_is_open: bool = True,
        hazard_exposure: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Extracts direction-specific edge features between u -> v.
        Directional terrain properties (uphill grade vs downhill grade)
        determine power requirements and friction.
        """
        # Directional elevation profile
        u_elev = elevation_service.get_elevation_for_location(u_lat, u_lng)
        v_elev = elevation_service.get_elevation_for_location(v_lat, v_lng)
        elev_change_m = v_elev - u_elev

        # Calculate directional grade
        dist_m = max(100.0, distance_km * 1000.0)
        grade_pct = (elev_change_m / dist_m) * 100.0

        uphill_grade = max(0.0, grade_pct)
        downhill_grade = max(0.0, -grade_pct)

        # Traffic density mapping
        traffic_map = {"LOW": 0.1, "NORMAL": 0.3, "CONGESTED": 0.7, "SEVERE": 1.0}
        traffic_density = traffic_map.get(traffic_level.upper(), 0.3)

        # Priority weight mapping
        priority_map = {"NORMAL": 0.8, "MEDIUM": 1.2, "HIGH": 2.0, "CRITICAL": 3.5}
        p_weight = priority_map.get(cargo_priority.upper(), 3.5)

        features_vector = [
            round(distance_km / 500.0, 4),
            round(base_travel_time_min / 600.0, 4),
            round(predicted_travel_time_min / 600.0, 4),
            traffic_density,
            round(rainfall_mm / 150.0, 4),
            round(soil_moisture, 4),
            round(uphill_grade / 15.0, 4),
            round(downhill_grade / 15.0, 4),
            round(elev_change_m, 2),
            round(disruption_probability, 4),
            round(accessibility_score / 100.0, 4),
            1.0 if bridge_is_open else 0.0,
            p_weight,
            round(hazard_exposure, 4),
        ]

        return {
            "edge_id": f"{u_node}->{v_node}",
            "directional_grade_pct": round(grade_pct, 2),
            "elevation_change_m": round(elev_change_m, 1),
            "is_uphill": elev_change_m > 0,
            "features_vector": features_vector,
            "feature_dim": len(features_vector),
        }


# Global instance
neural_feature_service = NeuralFeatureService()
