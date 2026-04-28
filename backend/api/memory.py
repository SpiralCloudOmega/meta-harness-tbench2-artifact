from fastapi import APIRouter, Query
from models.memory import StoreRequest
from core.memory_engine import MemoryEngine

router = APIRouter(prefix="/memory", tags=["memory"])
engine = MemoryEngine()


@router.post("/store")
async def store_memory(req: StoreRequest):
    return await engine.store(req.wing, req.room, req.content, req.metadata)


@router.get("/search")
async def search_memory(
    q: str = Query(default="", alias="q"),
    limit: int = Query(default=10),
    wing: str = Query(default=""),
):
    items = await engine.search(q, limit, wing)
    return [i.model_dump() for i in items]


@router.get("/sessions")
async def list_sessions():
    return await engine.list_sessions()
