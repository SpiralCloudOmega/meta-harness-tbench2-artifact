from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.graph import router as graph_router
from api.memory import router as memory_router
from api.reasoning import router as reasoning_router
from api.skills import router as skills_router
from api.wiki import router as wiki_router
from api.autoresearch import router as autoresearch_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Super 3D Node Graph Recursive GitNexus", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph_router, prefix="/api")
app.include_router(memory_router, prefix="/api")
app.include_router(reasoning_router, prefix="/api")
app.include_router(skills_router, prefix="/api")
app.include_router(wiki_router, prefix="/api")
app.include_router(autoresearch_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Super 3D Node Graph Recursive GitNexus API", "status": "ok"}
