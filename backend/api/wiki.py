from fastapi import APIRouter
from pydantic import BaseModel
from core.wiki_engine import WikiEngine

router = APIRouter(prefix="/wiki", tags=["wiki"])
engine = WikiEngine()


class IngestRequest(BaseModel):
    url_or_content: str
    title: str = ""


class WikiQueryRequest(BaseModel):
    query: str


@router.post("/ingest")
async def ingest(req: IngestRequest):
    return await engine.ingest(req.url_or_content, req.title)


@router.post("/compile")
async def compile_wiki():
    return await engine.compile_wiki()


@router.get("/pages")
async def list_pages():
    return await engine.list_pages()


@router.post("/query")
async def query(req: WikiQueryRequest):
    return await engine.query(req.query)
