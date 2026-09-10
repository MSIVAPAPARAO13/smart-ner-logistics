import logging
from typing import Dict, Any, List
from app.services.supply_continuity_service import supply_continuity_service

logger = logging.getLogger("sih26002.shortage")


class ShortagePredictionService:
    """
    Shortage Risk Prediction Service (Phase 3 Part C):
    Evaluates district lifeline risk states under varying corridor conditions:
    SAFE -> WATCH -> AT_RISK -> CRITICAL -> STOCKOUT.
    """

    def predict_district_shortages(self, district_id: str = "DIST-AS-CACHAR") -> Dict[str, Any]:
        """
        Calculates shortage risk timeline and determines if incoming deliveries breach stockout deadlines.
        """
        inventories = supply_continuity_service.get_district_inventory_assessment(district_id)

        shortage_alerts = []
        highest_risk_level = "SAFE"

        for inv in inventories:
            metrics = inv["metrics"]
            status = metrics["status"]

            if status in ["CRITICAL", "AT_RISK"]:
                shortage_alerts.append({
                    "district_id": inv["district_id"],
                    "district_name": inv["district_name"],
                    "supply_type": inv["supply_type"],
                    "supply_name": inv["supply_name"],
                    "hours_until_stockout": metrics["hours_until_stockout"],
                    "incoming_eta_hours": metrics["incoming_eta_hours"],
                    "severity": "CRITICAL" if status == "CRITICAL" else "WARNING",
                    "shortage_gap_hours": round(metrics["incoming_eta_hours"] - metrics["hours_until_stockout"], 1),
                    "action_required": metrics["recommended_action"],
                })

            if status == "CRITICAL":
                highest_risk_level = "CRITICAL"
            elif status == "AT_RISK" and highest_risk_level != "CRITICAL":
                highest_risk_level = "AT_RISK"
            elif status == "WATCH" and highest_risk_level not in ["CRITICAL", "AT_RISK"]:
                highest_risk_level = "WATCH"

        return {
            "district_id": district_id,
            "overall_shortage_risk": highest_risk_level,
            "total_monitored_supplies": len(inventories),
            "critical_supplies_count": len(shortage_alerts),
            "shortage_alerts": shortage_alerts,
            "inventories": inventories,
        }


shortage_service = ShortagePredictionService()
