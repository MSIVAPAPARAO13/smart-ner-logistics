import asyncio
import logging
import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from app.db.session import SessionLocal
from app.models.vehicle import Vehicle
from app.models.vehicle_position import VehiclePosition
from app.models.road import Road
from app.models.bridge import Bridge
from app.models.hazard import Hazard
from app.models.route import Route
from app.services.routing_service import routing_service
from app.services.event_broadcaster import event_broadcaster
from app.websockets.manager import manager
from app.db.seed_data import (
    GUWAHATI_SILCHAR_PRIMARY_COORDS,
    GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS,
    FLOOD_POLYGON_COORDS,
)

logger = logging.getLogger("sih26002.simulation")


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates bearing heading angle in degrees between two coordinates."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    theta = math.atan2(y, x)
    return (math.degrees(theta) + 360.0) % 360.0


def interpolate_points(coords: List[List[float]], num_subdivisions: int = 4) -> List[List[float]]:
    """
    Subdivides coordinate segments to produce dense, ultra-smooth movement steps.
    coords: [[lng, lat], ...]
    """
    if len(coords) < 2:
        return coords

    dense_coords = []
    for i in range(len(coords) - 1):
        p1 = coords[i]
        p2 = coords[i + 1]
        dense_coords.append(p1)
        for sub in range(1, num_subdivisions):
            frac = sub / num_subdivisions
            interp_lng = p1[0] + (p2[0] - p1[0]) * frac
            interp_lat = p1[1] + (p2[1] - p1[1]) * frac
            dense_coords.append([interp_lng, interp_lat])
    dense_coords.append(coords[-1])
    return dense_coords


class SimulationService:
    def __init__(self):
        self.is_running: bool = False
        self.speed_multiplier: float = 1.0
        self.scenario_stage: str = "NORMAL"
        self.vehicle_id: str = "NER-MED-01"
        
        # Dense routes
        self.primary_dense_coords = interpolate_points(GUWAHATI_SILCHAR_PRIMARY_COORDS, num_subdivisions=5)
        self.alternate_dense_coords = interpolate_points(GUWAHATI_NAGAON_HAFLONG_SILCHAR_ALTERNATE_COORDS, num_subdivisions=5)
        
        self.active_dense_coords = self.primary_dense_coords
        self.current_coord_index: int = 0
        self.current_route_type: str = "PRIMARY"  # PRIMARY or ALTERNATE
        
        # Metrics
        self.original_eta_min: float = 540.0
        self.current_eta_min: float = 540.0
        self.delay_min: float = 0.0
        self.flood_hazard_active: bool = False
        
        # Multi-vehicle convoy states
        self.convoy_offsets = {
            "NER-MED-01": 0,
            "NER-FOOD-02": 4,
            "NER-RELIEF-03": 8,
            "NER-CON-04": 12,
        }

        self.task: Optional[asyncio.Task] = None

    def get_status(self) -> Dict[str, Any]:
        curr_lng, curr_lat = self.active_dense_coords[min(self.current_coord_index, len(self.active_dense_coords) - 1)]
        next_idx = min(self.current_coord_index + 1, len(self.active_dense_coords) - 1)
        next_lng, next_lat = self.active_dense_coords[next_idx]
        
        heading = calculate_bearing(curr_lat, curr_lng, next_lat, next_lng)
        
        remaining_ratio = 1.0 - (self.current_coord_index / max(1, len(self.active_dense_coords) - 1))
        base_dist = 316.5 if self.current_route_type == "PRIMARY" else 347.0
        distance_remaining = round(base_dist * remaining_ratio, 1)

        # Multi-vehicle active positions
        fleet_positions = []
        for veh_id, offset in self.convoy_offsets.items():
            if veh_id == "NER-RELIEF-03":
                # Relief truck travels along alternate route
                v_idx = min(max(0, self.current_coord_index - offset), len(self.alternate_dense_coords) - 1)
                v_lng, v_lat = self.alternate_dense_coords[v_idx]
            else:
                v_idx = min(max(0, self.current_coord_index - offset), len(self.active_dense_coords) - 1)
                v_lng, v_lat = self.active_dense_coords[v_idx]

            fleet_positions.append({
                "vehicle_id": veh_id,
                "lat": v_lat,
                "lng": v_lng,
                "is_active": self.is_running,
            })

        return {
            "is_running": self.is_running,
            "scenario_stage": self.scenario_stage,
            "speed_multiplier": self.speed_multiplier,
            "active_hazard_id": "HAZARD-FLOOD-LADRYMBAI" if self.flood_hazard_active else None,
            "vehicle_id": self.vehicle_id,
            "vehicle_lat": curr_lat,
            "vehicle_lng": curr_lng,
            "vehicle_heading": round(heading, 1),
            "vehicle_speed_kmh": 52.0 if self.is_running else 0.0,
            "current_route_id": "ROUTE-PRIMARY-01" if self.current_route_type == "PRIMARY" else "ROUTE-ALTERNATE-01",
            "route_type": self.current_route_type,
            "distance_remaining_km": distance_remaining,
            "original_eta_min": self.original_eta_min,
            "current_eta_min": self.current_eta_min,
            "delay_min": self.delay_min,
            "step_index": self.current_coord_index,
            "total_steps": len(self.active_dense_coords),
            "fleet_positions": fleet_positions,
        }

    async def start(self):
        if not self.is_running:
            self.is_running = True
            await event_broadcaster.log_and_broadcast_event(
                event_type="SIMULATION_STATE",
                severity="INFO",
                title="Logistics Fleet Dispatch Started",
                description=f"4 Logistics Convoys ({self.vehicle_id}, NER-FOOD-02, NER-RELIEF-03, NER-CON-04) en route across NER corridor.",
            )
            if not self.task or self.task.done():
                self.task = asyncio.create_task(self._simulation_loop())

    async def pause(self):
        self.is_running = False
        await event_broadcaster.log_and_broadcast_event(
            event_type="SIMULATION_STATE",
            severity="WARNING",
            title="Simulation Paused",
            description="Fleet motion and simulation clock paused.",
        )

    async def set_speed(self, multiplier: float):
        self.speed_multiplier = max(0.2, min(10.0, multiplier))

    async def reset(self):
        self.is_running = False
        self.scenario_stage = "NORMAL"
        self.flood_hazard_active = False
        self.current_coord_index = 0
        self.active_dense_coords = self.primary_dense_coords
        self.current_route_type = "PRIMARY"
        self.current_eta_min = self.original_eta_min
        self.delay_min = 0.0

        # Reset DB status
        db = SessionLocal()
        try:
            # Reset road status
            for r in db.query(Road).all():
                r.current_status = "OPEN"
                r.accessibility_score = 95.0
            
            # Reset bridge status
            for b in db.query(Bridge).all():
                b.accessibility_status = "OPEN"
                b.clearance_status = "NORMAL"

            # Reset hazard
            hz = db.query(Hazard).filter(Hazard.id == "HAZARD-FLOOD-LADRYMBAI").first()
            if hz:
                hz.is_active = False

            # Reset vehicles
            for v in db.query(Vehicle).all():
                v.current_lat = self.primary_dense_coords[0][1]
                v.current_lng = self.primary_dense_coords[0][0]
                v.status = "IDLE"
                v.current_route_id = "ROUTE-PRIMARY-01"

            db.commit()
        finally:
            db.close()

        event_broadcaster.clear_timeline()
        await event_broadcaster.log_and_broadcast_event(
            event_type="SIMULATION_STATE",
            severity="INFO",
            title="Simulation Reset to Initial State",
            description="All corridors reopened, weather baseline restored, fleet vehicles at Guwahati Hub.",
        )
        await self._broadcast_full_state()

    async def trigger_flood_scenario(self):
        """
        Controlled SIH26002 Scenario Execution:
        1. Heavy rain triggers flood alert in Ladrymbai / Sonapur tunnel sector.
        2. Flood polygon activates and blocks NH-6 corridor.
        3. Bridge BRG-LUBHA-SONAPUR marked CLOSED.
        4. Automatic reroute triggers: Alternate route via NH-27/NH-54 calculated.
        5. Vehicle transitions from current position onto the alternate corridor.
        6. Revised ETA and calculated delay broadcasted.
        """
        self.flood_hazard_active = True
        self.scenario_stage = "FLOOD_DEVELOPING"

        db = SessionLocal()
        try:
            # 1. Activate Flood Hazard in DB
            hz = db.query(Hazard).filter(Hazard.id == "HAZARD-FLOOD-LADRYMBAI").first()
            if hz:
                hz.is_active = True
                hz.detected_at = datetime.utcnow()

            # 2. Update NH-6 road status to BLOCKED
            road_nh6 = db.query(Road).filter(Road.id == "ROAD-NH06-SHL-SIL").first()
            if road_nh6:
                road_nh6.current_status = "BLOCKED"
                road_nh6.accessibility_score = 0.0

            # 3. Update Bridge to CLOSED
            bridge = db.query(Bridge).filter(Bridge.id == "BRG-LUBHA-SONAPUR").first()
            if bridge:
                bridge.accessibility_status = "CLOSED"
                bridge.clearance_status = "CRITICAL_SUBMERGENCE"

            db.commit()
        finally:
            db.close()

        await event_broadcaster.log_and_broadcast_event(
            event_type="HAZARD_SPAWNED",
            severity="DANGER",
            title="Flash Flood & Landslide Alert (NH-6)",
            description="Controlled Scenario: Inundation detected on NH-6 Ladrymbai-Sonapur sector. Corridor impassable.",
            metadata={"hazard_id": "HAZARD-FLOOD-LADRYMBAI", "affected_road": "ROAD-NH06-SHL-SIL"},
        )

        await asyncio.sleep(0.8)
        self.scenario_stage = "ROAD_BLOCKED"
        await event_broadcaster.log_and_broadcast_event(
            event_type="ROAD_STATUS_CHANGED",
            severity="DANGER",
            title="NH-6 Shillong-Silchar Corridor BLOCKED",
            description="Structural integrity compromised at Lubha Suspension Bridge. All heavy transport halted.",
        )

        await asyncio.sleep(0.8)
        self.scenario_stage = "REROUTING"
        await event_broadcaster.log_and_broadcast_event(
            event_type="REROUTE_CALCULATED",
            severity="WARNING",
            title="AI Reroute Activated: Alternate NH-27/NH-54 Bypass",
            description="Recalculated detour via Nagaon & Haflong valley. Avoiding flood hazard zone.",
        )

        # Transition vehicle to Alternate Route
        self.current_route_type = "ALTERNATE"
        self.active_dense_coords = self.alternate_dense_coords
        
        # Match nearest point on alternate route to preserve vehicle journey continuity
        curr_step = min(self.current_coord_index, len(self.alternate_dense_coords) - 1)
        self.current_coord_index = curr_step
        
        # Compute Delay
        # Detour adds ~45 km and hilly elevation adjustments (+55 min delay)
        self.current_eta_min = self.original_eta_min + 55.0
        self.delay_min = 55.0
        self.scenario_stage = "ALTERNATE_ROUTE_ACTIVE"

        await asyncio.sleep(0.6)
        await event_broadcaster.log_and_broadcast_event(
            event_type="VEHICLE_REROUTED",
            severity="SUCCESS",
            title=f"Vehicle {self.vehicle_id} Transitioned to Alternate Corridor",
            description=f"New route active via NH-27 4-Lane. Revised ETA: +55 min delay. Cargo safe.",
            metadata={"delay_min": self.delay_min, "new_eta_min": self.current_eta_min},
        )

        await self._broadcast_full_state()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                if self.current_coord_index < len(self.active_dense_coords) - 1:
                    self.current_coord_index += 1
                else:
                    # Completed journey
                    self.is_running = False
                    await event_broadcaster.log_and_broadcast_event(
                        event_type="SIMULATION_STATE",
                        severity="SUCCESS",
                        title="Delivery Completed at Silchar Hospital",
                        description=f"Convoy {self.vehicle_id} successfully delivered Emergency Medical Supplies.",
                    )

                status = self.get_status()

                # Broadcast live position tick
                await manager.broadcast({
                    "type": "VEHICLE_TICK",
                    "status": status,
                })

                # Persist vehicle position periodically
                if self.current_coord_index % 5 == 0:
                    self._persist_position(status)

                sleep_time = max(0.1, 0.8 / self.speed_multiplier)
                await asyncio.sleep(sleep_time)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error(f"Error in simulation loop: {exc}")
                await asyncio.sleep(1.0)

    def _persist_position(self, status: Dict[str, Any]):
        db = SessionLocal()
        try:
            for veh_id in ["NER-MED-01", "NER-TRK-01", "NER-FOOD-02", "NER-RELIEF-03", "NER-CON-04"]:
                v = db.query(Vehicle).filter(Vehicle.id == veh_id).first()
                if v:
                    v.current_lat = status["vehicle_lat"]
                    v.current_lng = status["vehicle_lng"]
                    v.speed_kmh = status["vehicle_speed_kmh"]
                    v.heading_deg = status["vehicle_heading"]
                    v.status = "REROUTED" if self.current_route_type == "ALTERNATE" else "EN_ROUTE"
            db.commit()

            pos = VehiclePosition(
                vehicle_id=self.vehicle_id,
                latitude=status["vehicle_lat"],
                longitude=status["vehicle_lng"],
                speed_kmh=status["vehicle_speed_kmh"],
                heading_deg=status["vehicle_heading"],
                status=status["scenario_stage"],
            )
            db.add(pos)
            db.commit()
        except Exception as exc:
            logger.error(f"Error persisting position: {exc}")
        finally:
            db.close()

    async def _broadcast_full_state(self):
        status = self.get_status()
        await manager.broadcast({
            "type": "FULL_STATE_UPDATE",
            "status": status,
        })


simulation_service = SimulationService()
