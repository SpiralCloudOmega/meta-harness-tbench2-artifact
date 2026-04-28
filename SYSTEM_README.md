# Super 3D Node Graph Recursive GitNexus

A full-stack system for visualizing, reasoning over, and interacting with multi-repo code graphs in 3D — integrating GitNexus, Lambda-RLM, MemPalace, Memento-Skills, LLM-Wiki-Compiler, and Awesome-Autoresearch.

## Quick Start

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Browser (localhost:3000)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React + Vite + Tailwind                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ Graph3D  │ │  Chat    │ │  Memory  │            │   │
│  │  │(ForceGr.)│ │  Panel   │ │  Panel   │  ...more   │   │
│  │  └──────────┘ └──────────┘ └──────────┘            │   │
│  │  zustand store ──► axios ──► /api/*                │   │
│  └──────────────────────────┬──────────────────────────┘   │
└─────────────────────────────│──────────────────────────────┘
                              │ HTTP / WebSocket
┌─────────────────────────────▼──────────────────────────────┐
│              FastAPI Backend (localhost:8000)                │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ /api/graph│ │/api/memory│ │/api/wiki │ │/api/skills │  │
│  └─────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│        │             │            │              │          │
│  ┌─────▼─────┐ ┌─────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐  │
│  │ GraphEng. │ │MemoryEng. │ │WikiEng.  │ │SkillEngine │  │
│  │ (networkx)│ │ (chromadb)│ │(json fs) │ │ (in-mem)   │  │
│  └─────┬─────┘ └───────────┘ └──────────┘ └────────────┘  │
│        │                                                    │
│  ┌─────▼────────────┐  ┌────────────────┐                  │
│  │ npx gitnexus     │  │ ReasoningEngine│ (/api/reasoning) │
│  │ (GitNexus CLI)   │  │ (Lambda-RLM)   │                  │
│  └──────────────────┘  └────────────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AutoresearchLoop (/api/autoresearch) + WS streaming  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    │
         ┌──────────▼──────────────────────┐
         │  repos/                          │
         │  ├── GitNexus/                   │
         │  ├── lambda-RLM/                 │
         │  ├── mempalace/                  │
         │  ├── Memento-Skills/             │
         │  ├── llm-wiki-compiler/          │
         │  └── awesome-autoresearch/       │
         └─────────────────────────────────┘
```

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Root info |
| GET | `/docs` | Swagger UI |

### Graph (`/api/graph`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/graph/repos` | List available repositories |
| POST | `/api/graph/index` | Index a repo via GitNexus CLI |
| GET | `/api/graph/{repo}/nodes` | Get 3D-positioned nodes (networkx spring layout) |
| GET | `/api/graph/{repo}/edges` | Get graph edges with types |
| GET | `/api/graph/{repo}/clusters` | Get cluster groupings |
| GET | `/api/graph/{repo}/processes` | Get process nodes |
| POST | `/api/graph/{repo}/query` | Search nodes by text |
| POST | `/api/graph/{repo}/impact` | Impact analysis for a node |
| WS | `/api/graph/ws/graph/{repo}` | Live graph streaming (5s updates) |

### Memory (`/api/memory`) — backed by ChromaDB / MemPalace
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/memory/store` | Store a memory item |
| GET | `/api/memory/search?q=…` | Semantic search across memories |
| GET | `/api/memory/sessions` | List memory wings/collections |

### Reasoning (`/api/reasoning`) — Lambda-RLM operators
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reasoning/analyze` | Recursive SPLIT/MAP/REDUCE analysis |
| GET | `/api/reasoning/operators` | List available lambda operators |

### Skills (`/api/skills`) — Memento-Skills
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/skills/` | List all skills with utility scores |
| POST | `/api/skills/execute` | Execute a skill with params |
| POST | `/api/skills/reflect` | Update skill utility score via reflection |

### Wiki (`/api/wiki`) — LLM-Wiki-Compiler
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/wiki/ingest` | Ingest content / URL as wiki page |
| POST | `/api/wiki/compile` | Compile wiki (generate wikilinks) |
| GET | `/api/wiki/pages` | List all wiki pages |
| POST | `/api/wiki/query` | Search wiki pages |

### Autoresearch (`/api/autoresearch`) — Awesome-Autoresearch loop
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/autoresearch/start` | Start a GOAL → experiment loop |
| GET | `/api/autoresearch/{run_id}/status` | Get run status |
| GET | `/api/autoresearch/{run_id}/experiments` | Get experiments list |
| WS | `/api/autoresearch/ws/autoresearch/{run_id}` | Live progress streaming |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Frontend API base (set in docker-compose) |
| `MEMPALACE_PATH` | `./.mempalace_data` | ChromaDB persistence directory |
| `WIKI_PATH` | `./.wiki_data` | Wiki JSON files directory |
| `REPOS_BASE` | `./repos` | Path to source repositories |

## Integrated Repositories

| Repo | Integration Point | Description |
|------|------------------|-------------|
| **GitNexus** | `backend/core/graph_engine.py` → `npx gitnexus analyze` | Code graph indexing; synthetic node/edge data used when CLI unavailable |
| **lambda-RLM** | `backend/core/reasoning_engine.py` | SPLIT/MAP/FILTER/REDUCE/CONCAT/CROSS operator composition for recursive text analysis |
| **mempalace** | `backend/core/memory_engine.py` → ChromaDB | Persistent vector memory with wing/room hierarchy; falls back to in-memory on import failure |
| **Memento-Skills** | `backend/core/skill_engine.py` | Skill catalog with utility scores; execute + reflect loop for self-improvement |
| **llm-wiki-compiler** | `backend/core/wiki_engine.py` | JSON-based wiki page storage with automatic wikilink generation |
| **awesome-autoresearch** | `backend/core/autoresearch_loop.py` | Async GOAL → hypothesis → experiment loop with WebSocket streaming |

## Frontend Features

- **3D Graph View** — `react-force-graph-3d` rendering all repo nodes with color-coded types, edge particles, and click-to-inspect
- **Chat Panel** — sends messages to reasoning API with optional node context
- **Memory Panel** — search and store items in ChromaDB-backed MemPalace
- **Wiki Panel** — ingest, compile, and query wiki pages
- **Skills Panel** — browse, execute, and reflect on skills
- **Reasoning Panel** — visualize recursive decomposition tree

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173 (proxied to :8000)
```

## File Structure

```
├── backend/
│   ├── api/          # FastAPI routers (graph, memory, reasoning, skills, wiki, autoresearch)
│   ├── core/         # Business logic engines
│   ├── models/       # Pydantic models
│   └── main.py       # App entry point with CORS
├── frontend/
│   ├── src/
│   │   ├── api/      # Axios client
│   │   ├── components/  # React components
│   │   ├── hooks/    # Custom React hooks
│   │   ├── store/    # Zustand global state
│   │   └── types/    # TypeScript interfaces
│   └── dist/         # Production build
├── repos/            # Cloned source repositories
├── gitnexus_bridge/  # GitNexus CLI bridge utilities
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```
