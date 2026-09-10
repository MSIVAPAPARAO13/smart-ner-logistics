import asyncio
import logging
from typing import Dict, Any, List
from app.services.event_broadcaster import event_broadcaster
from app.websockets.manager import manager

logger = logging.getLogger("sih26002.scenarios")

SCENARIO_CATALOG = [
    {
        "id": "SCENARIO_HERO_FLOOD",
        "name": "Heavy Monsoon Flood & NH-6 Lifeline Disruption (Hero Scenario)",
        "description": "Precipitation surge triggers flash flood in East Jaintia Hills; NH-6 blocked; ICU medicine re-routed via NH-27 bypass.",
        "stages": [
            {"step": 0, "stage": "NORMAL", "time": "12:00", "description": "Baseline weather; 4 convoys active across NH-6 corridor."},
            {"step": 1, "stage": "HEAVY_RAIN", "time": "12:08", "description": "Rainfall accelerates to 85 mm/h in East Jaintia Hills highlands."},
            {"step": 2, "stage": "FLOOD_RISK_SURGE", "time": "12:15", "description": "LightGBM predicts 85% inundation risk near Ladrymbai tunnel."},
            {"step": 3, "stage": "ROAD_BLOCKED", "time": "12:21", "description": "NH-6 Sonapur sector inundated; Lubha Bridge closed; vehicle NER-MED-01 halted."},
            {"step": 4, "stage": "SUPPLY_CRITICAL", "time": "12:23", "description": "Supply Engine predicts Silchar ICU medicine stockout in 6.4h (ETA delayed to 11.2h)."},
            {"step": 5, "stage": "AI_REROUTE_ACTIVE", "time": "12:25", "description": "OR-Tools optimizer activates NH-27/NH-54 4-lane bypass."},
            {"step": 6, "stage": "VEHICLE_TRANSITION", "time": "12:28", "description": "NER-MED-01 transitions to NH-27; revised ETA drops to 7.1h; Hospital stock status restored to SAFE."},
            {"step": 7, "stage": "DELIVERY_COMPLETED", "time": "12:45", "description": "Critical medicines safely delivered to Silchar Civil Hospital."},
        ],
    },
    {
        "id": "SCENARIO_LANDSLIDE_HAFLONG",
        "name": "Dima Hasao Hill Landslide & Railway Bypass",
        "description": "Slope failure near Haflong ghats triggers instant diversion of relief supplies.",
        "stages": [
            {"step": 0, "stage": "NORMAL", "time": "08:00", "description": "All mountain passes open."},
            {"step": 1, "stage": "LANDSLIDE_WARNING", "time": "08:30", "description": "Slope saturation reaches 92% on NH-54 hills."},
            {"step": 2, "stage": "ROAD_DAMAGE", "time": "09:00", "description": "Debris obstructs northbound lane; speed restricted to 20 km/h."},
            {"step": 3, "stage": "REROUTE_OPTIMIZATION", "time": "09:15", "description": "Relief convoy diverted via Lumding bypass."},
        ],
    },
]


class ScenarioReplayService:
    """
    Deterministic Scenario Replay Engine (Phase 3 Part F):
    Supports deterministic multi-stage scenario playback, forward stepping, pausing, and resetting.
    """

    def __init__(self):
        self.active_scenario_id = "SCENARIO_HERO_FLOOD"
        self.current_step_index = 0
        self.is_playing = False
        self.play_speed = 1.0

    def get_scenario_list(self) -> List[Dict[str, Any]]:
        return SCENARIO_CATALOG

    def get_current_state(self) -> Dict[str, Any]:
        scenario = next((s for s in SCENARIO_CATALOG if s["id"] == self.active_scenario_id), SCENARIO_CATALOG[0])
        stages = scenario["stages"]
        curr_stage = stages[min(self.current_step_index, len(stages) - 1)]

        return {
            "scenario_id": self.active_scenario_id,
            "scenario_name": scenario["name"],
            "current_step": self.current_step_index,
            "total_steps": len(stages),
            "is_playing": self.is_playing,
            "play_speed": self.play_speed,
            "current_stage": curr_stage,
            "all_stages": stages,
        }

    async def step_forward(self) -> Dict[str, Any]:
        scenario = next((s for s in SCENARIO_CATALOG if s["id"] == self.active_scenario_id), SCENARIO_CATALOG[0])
        stages = scenario["stages"]

        if self.current_step_index < len(stages) - 1:
            self.current_step_index += 1
            curr_stage = stages[self.current_step_index]

            await event_broadcaster.log_and_broadcast_event(
                event_type="SCENARIO_STEP",
                severity="WARNING" if "BLOCKED" in curr_stage["stage"] or "CRITICAL" in curr_stage["stage"] else "INFO",
                title=f"Scenario Step {self.current_step_index}: {curr_stage['stage']}",
                description=curr_stage["description"],
                metadata={"step": self.current_step_index, "time": curr_stage["time"]},
            )

            await manager.broadcast({
                "type": "SCENARIO_STEP",
                "state": self.get_current_state(),
            })

        return self.get_current_state()

    async def reset(self) -> Dict[str, Any]:
        self.current_step_index = 0
        self.is_playing = False

        await event_broadcaster.log_and_broadcast_event(
            event_type="SCENARIO_RESET",
            severity="INFO",
            title="Scenario Replay Reset",
            description="Timeline reset to baseline (Stage 0).",
        )

        await manager.broadcast({
            "type": "SCENARIO_STEP",
            "state": self.get_current_state(),
        })

        return self.get_current_state()


scenario_service = ScenarioReplayService()
