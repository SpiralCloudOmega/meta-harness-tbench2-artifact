from fastapi import APIRouter
from pydantic import BaseModel
from core.skill_engine import SkillEngine

router = APIRouter(prefix="/skills", tags=["skills"])
engine = SkillEngine()


class ExecuteRequest(BaseModel):
    skill_id: str
    params: dict = {}


class ReflectRequest(BaseModel):
    skill_id: str
    outcome: str


@router.get("/")
async def list_skills():
    return await engine.list_skills()


@router.post("/execute")
async def execute_skill(req: ExecuteRequest):
    return await engine.execute_skill(req.skill_id, req.params)


@router.post("/reflect")
async def reflect(req: ReflectRequest):
    return await engine.reflect(req.skill_id, req.outcome)
