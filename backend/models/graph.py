from pydantic import BaseModel
from typing import Optional


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "Function"/"Class"/"File"/"Cluster"/"Process"
    file_path: str
    importance: float
    x: float
    y: float
    z: float
    metadata: dict = {}


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # "CALLS"/"IMPORTS"/"MEMBER_OF"
    weight: float


class GraphData(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class IndexRequest(BaseModel):
    repo_path: str
    skip_embeddings: bool = False


class QueryRequest(BaseModel):
    query: str
    limit: int = 10


class ImpactRequest(BaseModel):
    node_id: str
