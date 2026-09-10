import logging
from typing import Dict, Any

logger = logging.getLogger("sih26002.traffic_service")


class TrafficService:
    """
    Evaluates real-time traffic levels (FREE, SLOW, HEAVY, SEVERE)
    and computes delay multipliers from vehicle GPS telemetry and incident reports.
    """

    def evaluate_traffic_speed(self, expected_speed_kmh: float, observed_speed_kmh: float) -> Dict[str, Any]:
        if expected_speed_kmh <= 0:
            return {"level": "FREE", "delay_factor": 1.0, "description": "Free-flowing traffic"}

        speed_ratio = observed_speed_kmh / expected_speed_kmh

        if speed_ratio >= 0.85:
            return {"level": "FREE", "delay_factor": 1.0, "description": "Normal free flow"}
        elif speed_ratio >= 0.55:
            return {"level": "SLOW", "delay_factor": 1.25, "description": "Moderate slow-down on ghat section"}
        elif speed_ratio >= 0.25:
            return {"level": "HEAVY", "delay_factor": 1.70, "description": "Heavy congestion / single-lane bottleneck"}
        else:
            return {"level": "SEVERE", "delay_factor": 2.50, "description": "Gridlock / stationary transport queue"}


traffic_service = TrafficService()
