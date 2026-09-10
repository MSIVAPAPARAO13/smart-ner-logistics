import abc
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("sih26002.transport_adapter")


class TransportSystemAdapter(abc.ABC):
    """
    Abstract Integration Adapter for External Transport / Fleet Telematics Systems.
    Enables pluggable integration with state transport corporations, private freight carriers,
    and municipal fleet tracking systems.
    """

    @abc.abstractmethod
    def get_vehicles(self) -> List[Dict[str, Any]]:
        pass

    @abc.abstractmethod
    def get_vehicle_position(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abc.abstractmethod
    def get_vehicle_status(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abc.abstractmethod
    def get_fleet_capacity(self) -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    def get_depot_status(self, depot_id: str) -> Dict[str, Any]:
        pass


class DemonstrationTransportProvider(TransportSystemAdapter):
    """
    Local Demonstration Transport Provider for SIH26002:
    Simulates real-world Northeast telemetry for 4 lifeline vehicles across Assam and Meghalaya corridors.
    
    IMPORTANT DATA LINEAGE NOTICE:
    Explicitly labeled as DEMO TRANSPORT DATA for transparency.
    """

    def __init__(self):
        self.provider_name = "DEMO_TRANSPORT_PROVIDER_NER"
        self.data_lineage = "DEMO TRANSPORT DATA (SEEDED / SIMULATED)"
        self._vehicles = {
            "MED-01": {
                "vehicle_id": "MED-01",
                "vehicle_number": "AS-01-MC-9021",
                "cargo_type": "MEDICINE",
                "priority": "CRITICAL",
                "capacity_tons": 5.0,
                "current_load_tons": 3.2,
                "origin": "Guwahati Central Depot",
                "destination": "Silchar Medical College",
                "current_lat": 25.5788,
                "current_lng": 91.8933,
                "speed_kmh": 42.0,
                "heading_deg": 135.0,
                "status": "EN_ROUTE",
                "data_source": self.data_lineage,
            },
            "FOOD-02": {
                "vehicle_id": "FOOD-02",
                "vehicle_number": "AS-01-FC-4412",
                "cargo_type": "ESSENTIAL_FOOD",
                "priority": "HIGH",
                "capacity_tons": 12.0,
                "current_load_tons": 10.5,
                "origin": "Guwahati Food Silo",
                "destination": "Shillong Civil Supplies",
                "current_lat": 25.8500,
                "current_lng": 91.9500,
                "speed_kmh": 48.0,
                "heading_deg": 150.0,
                "status": "EN_ROUTE",
                "data_source": self.data_lineage,
            },
            "RELIEF-03": {
                "vehicle_id": "RELIEF-03",
                "vehicle_number": "AS-01-RC-8819",
                "cargo_type": "RELIEF_SHELTER",
                "priority": "HIGH",
                "capacity_tons": 8.0,
                "current_load_tons": 6.8,
                "origin": "Nagaon Warehouse",
                "destination": "Haflong Relief Hub",
                "current_lat": 25.6800,
                "current_lng": 92.6500,
                "speed_kmh": 38.0,
                "heading_deg": 165.0,
                "status": "EN_ROUTE",
                "data_source": self.data_lineage,
            },
            "CON-04": {
                "vehicle_id": "CON-04",
                "vehicle_number": "AS-01-CC-1094",
                "cargo_type": "CONSTRUCTION_MATERIALS",
                "priority": "NORMAL",
                "capacity_tons": 18.0,
                "current_load_tons": 16.0,
                "origin": "Lumding Quarry Depot",
                "destination": "Silchar Bypass Bridge Construction",
                "current_lat": 25.4000,
                "current_lng": 92.9000,
                "speed_kmh": 35.0,
                "heading_deg": 180.0,
                "status": "EN_ROUTE",
                "data_source": self.data_lineage,
            },
        }

    def get_vehicles(self) -> List[Dict[str, Any]]:
        return list(self._vehicles.values())

    def get_vehicle_position(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        v = self._vehicles.get(vehicle_id)
        if not v:
            return None
        return {
            "vehicle_id": v["vehicle_id"],
            "latitude": v["current_lat"],
            "longitude": v["current_lng"],
            "speed_kmh": v["speed_kmh"],
            "heading_deg": v["heading_deg"],
            "timestamp": datetime.now().isoformat(),
            "data_source": self.data_lineage,
        }

    def get_vehicle_status(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        return self._vehicles.get(vehicle_id)

    def get_fleet_capacity(self) -> Dict[str, Any]:
        total_cap = sum(v["capacity_tons"] for v in self._vehicles.values())
        used_cap = sum(v["current_load_tons"] for v in self._vehicles.values())
        return {
            "total_vehicles": len(self._vehicles),
            "active_vehicles": len([v for v in self._vehicles.values() if v["status"] == "EN_ROUTE"]),
            "total_capacity_tons": total_cap,
            "allocated_capacity_tons": used_cap,
            "utilization_pct": round((used_cap / total_cap) * 100.0, 1) if total_cap > 0 else 0.0,
            "data_source": self.data_lineage,
        }

    def get_depot_status(self, depot_id: str = "DEPOT-GHY-01") -> Dict[str, Any]:
        return {
            "depot_id": depot_id,
            "depot_name": "Guwahati Central Strategic Logistics Hub",
            "district": "Kamrup Metropolitan",
            "available_reserve_vehicles": 3,
            "dispatch_readiness": "OPTIMAL",
            "fuel_reserves_liters": 45000,
            "cold_storage_status": "ACTIVE_BACKUP_ONLINE",
            "data_source": self.data_lineage,
        }


# Global instance
transport_adapter = DemonstrationTransportProvider()
