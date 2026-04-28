import asyncio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from core.autoresearch_loop import AutoresearchLoop, RUNS

router = APIRouter(prefix="/autoresearch", tags=["autoresearch"])
loop_engine = AutoresearchLoop()


class StartRequest(BaseModel):
    goal: str
    max_iterations: int = 5


@router.post("/start")
async def start_run(req: StartRequest):
    return await loop_engine.start_run(req.goal, req.max_iterations)


@router.get("/{run_id}/status")
async def get_status(run_id: str):
    try:
        return await loop_engine.get_status(run_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")


@router.get("/{run_id}/experiments")
async def get_experiments(run_id: str):
    try:
        return await loop_engine.get_experiments(run_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")


@router.websocket("/ws/autoresearch/{run_id}")
async def ws_autoresearch(websocket: WebSocket, run_id: str):
    await websocket.accept()
    try:
        for _ in range(60):
            run = RUNS.get(run_id, {})
            await websocket.send_json(run)
            if run.get("status") == "completed":
                break
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
