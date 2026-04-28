from pydantic import BaseModel
from typing import Optional


class MemoryItem(BaseModel):
    id: str
    wing: str
    room: str
    content: str
    metadata: dict = {}
    score: Optional[float] = None


class StoreRequest(BaseModel):
    wing: str
    room: str
    content: str
    metadata: dict = {}


class SearchRequest(BaseModel):
    query: str
    limit: int = 10
    wing: str = ""
