from fastapi import APIRouter
from pydantic import BaseModel
from core.reasoning_engine import ReasoningEngine

router = APIRouter(prefix="/reasoning", tags=["reasoning"])
engine = ReasoningEngine()


class AnalyzeRequest(BaseModel):
    text: str
    task_type: str = "general"
    query: str = ""


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    return await engine.analyze(req.text, req.task_type, req.query)


@router.get("/operators")
async def list_operators():
    return await engine.list_operators()
