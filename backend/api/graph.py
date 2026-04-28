import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.graph import IndexRequest, QueryRequest, ImpactRequest
from core.graph_engine import GraphEngine

router = APIRouter(prefix="/graph", tags=["graph"])
engine = GraphEngine()


@router.get("/repos")
async def list_repos():
    from core.graph_engine import REPO_NODES
    return list(REPO_NODES.keys())


@router.post("/index")
async def index_repo(req: IndexRequest):
    return await engine.index_repo(req.repo_path)


@router.get("/{repo}/nodes")
async def get_nodes(repo: str):
    nodes = await engine.get_nodes(repo)
    return [n.model_dump() for n in nodes]


@router.get("/{repo}/edges")
async def get_edges(repo: str):
    edges = await engine.get_edges(repo)
    return [e.model_dump() for e in edges]


@router.get("/{repo}/clusters")
async def get_clusters(repo: str):
    return await engine.get_clusters(repo)


@router.get("/{repo}/processes")
async def get_processes(repo: str):
    return await engine.get_processes(repo)


@router.post("/{repo}/query")
async def query_graph(repo: str, req: QueryRequest):
    nodes = await engine.query_graph(repo, req.query, req.limit)
    return [n.model_dump() for n in nodes]


@router.post("/{repo}/impact")
async def get_impact(repo: str, req: ImpactRequest):
    return await engine.get_impact(repo, req.node_id)


@router.websocket("/ws/graph/{repo}")
async def ws_graph(websocket: WebSocket, repo: str):
    await websocket.accept()
    try:
        while True:
            nodes = await engine.get_nodes(repo)
            edges = await engine.get_edges(repo)
            await websocket.send_json({
                "nodes": [n.model_dump() for n in nodes],
                "edges": [e.model_dump() for e in edges],
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
