from fastapi import APIRouter
from app.services.scenario_service import scenario_service

router = APIRouter()


@router.get("")
def list_scenarios():
    """
    Returns available deterministic scenario catalogs and current replay state.
    """
    return {
        "catalog": scenario_service.get_scenario_list(),
        "current_state": scenario_service.get_current_state(),
    }


@router.post("/step")
async def step_scenario():
    """
    Advances scenario forward by one deterministic step.
    """
    return await scenario_service.step_forward()


@router.post("/reset")
async def reset_scenario():
    """
    Resets scenario replay to baseline.
    """
    return await scenario_service.reset()
