# Comprehensive Technical Research Report: Unified GitNexus Ecosystem

**Prepared for:** Architecture Agent — "Super 3D Node Graph Recursive GitNexus" System Design  
**Date:** 2025  
**Repos Analysed:** GitNexus · llm-wiki-compiler · mempalace · Memento-Skills · lambda-RLM · awesome-autoresearch

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [GitNexus Deep Dive](#2-gitnexus-deep-dive)
3. [llm-wiki-compiler Deep Dive](#3-llm-wiki-compiler-deep-dive)
4. [mempalace Deep Dive](#4-mempalace-deep-dive)
5. [Memento-Skills Deep Dive](#5-memento-skills-deep-dive)
6. [lambda-RLM Deep Dive](#6-lambda-rlm-deep-dive)
7. [awesome-autoresearch Deep Dive](#7-awesome-autoresearch-deep-dive)
8. [Integration Opportunities](#8-integration-opportunities)
9. [Key Data Flows](#9-key-data-flows)
10. [Tech Stack Compatibility](#10-tech-stack-compatibility)
11. [Recommended Architecture Patterns](#11-recommended-architecture-patterns)

---

## 1. Executive Summary

The six repositories form a cohesive — if uncoordinated — ecosystem for building AI agents with deep, persistent, multi-dimensional knowledge and self-improvement capabilities.

| Repo | Core Purpose | Primary Language | Key Abstraction |
|------|-------------|-----------------|-----------------|
| **GitNexus** | Codebase knowledge graph + MCP server | TypeScript (Node.js) + Python (eval) | KuzuDB graph of code symbols, processes, clusters |
| **llm-wiki-compiler** | Source-to-interlinked-wiki pipeline | TypeScript (Node.js) | Concept extraction → wiki page → wikilink resolution |
| **mempalace** | Long-term semantic memory store | Python | ChromaDB "palace" (wings/rooms/drawers) + KG (SQLite) |
| **Memento-Skills** | Self-evolving agent framework | Python | Read-Execute-Reflect-Write skill library loop |
| **lambda-RLM** | Long-context recursive reasoning | Python | Deterministic combinator chain Φ = Split→Filter?→Map→Reduce |
| **awesome-autoresearch** | Curated index of auto-research frameworks | Markdown | Survey/index — reference material |

**How they fit together:**

```
User Task
    │
    ▼
Memento-Skills (agent orchestrator)
    │  ← skill routing (embedding search)
    │  ← Read-Execute-Reflect-Write loop
    ├──► GitNexus (codebase structure, impact analysis)
    ├──► llm-wiki-compiler (knowledge compilation from sources)
    ├──► mempalace (persistent memory across sessions)
    └──► lambda-RLM (long-context decomposition for large inputs)
```

The vision is a single agent system that:
1. **Understands codebases structurally** (GitNexus knowledge graph)
2. **Compiles domain knowledge into a searchable wiki** (llm-wiki-compiler)
3. **Retains and retrieves memories across sessions** (mempalace)
4. **Decomposes arbitrarily long reasoning tasks** (lambda-RLM)
5. **Learns from execution failures and evolves its skills** (Memento-Skills)

---

## 2. GitNexus Deep Dive

### 2.1 Overview

GitNexus indexes any codebase into a property graph (stored in KuzuDB) capturing every dependency, call chain, cluster, and execution flow. It exposes this graph through:
- **CLI**: `gitnexus analyze`, `gitnexus mcp`, `gitnexus serve`
- **MCP server** (stdio): 7 tools + 7 resources + 2 prompts
- **Web UI** (React + Sigma.js): browser-based graph explorer with AI chat

### 2.2 Indexing Pipeline (Multi-Phase)

```
Phase 1: Structure Walk
    └── File system traversal → Folder + File nodes

Phase 2: Parsing (Tree-sitter)
    └── AST extraction → Function, Class, Method, Interface nodes

Phase 3: Resolution
    └── Import/call resolution → CALLS, IMPORTS, DEFINES edges (language-aware)

Phase 4: Clustering (community detection)
    └── Graph community algorithm → Cluster nodes with cohesion scores

Phase 5: Process Tracing
    └── Execution flow analysis → Process nodes with ordered steps

Phase 6: Embedding Generation (optional, --skip-embeddings to skip)
    └── Semantic vectors for hybrid BM25+semantic search (RRF fusion)
```

### 2.3 Graph Data Model (KuzuDB Schema)

All data lives in `.gitnexus/` inside each repo as a KuzuDB native database.

#### Node Types

| Node Label | Key Properties | Description |
|-----------|---------------|-------------|
| `Repository` | `name: string`, `path: string`, `language: string`, `indexed_at: timestamp` | Root node for a repo |
| `Folder` | `path: string`, `name: string` | Directory node |
| `File` | `path: string`, `name: string`, `language: string`, `size: int`, `hash: string` | Source file |
| `Function` | `name: string`, `signature: string`, `start_line: int`, `end_line: int`, `docstring: string`, `embedding: float[]` | Top-level function |
| `Class` | `name: string`, `start_line: int`, `end_line: int`, `docstring: string`, `embedding: float[]` | Class definition |
| `Method` | `name: string`, `class_name: string`, `signature: string`, `start_line: int`, `end_line: int` | Class method |
| `Interface` | `name: string`, `file_path: string` | Interface/type definition |
| `Cluster` | `name: string`, `description: string`, `cohesion_score: float`, `member_count: int` | Functional community |
| `Process` | `name: string`, `description: string`, `entry_point: string`, `step_count: int` | Execution flow |

#### Edge Types

| Edge Label | From → To | Key Properties | Description |
|-----------|-----------|---------------|-------------|
| `CONTAINS` | Repository → Folder, Folder → File | — | Structural containment |
| `DEFINES` | File → Function/Class/Interface | `line: int` | Symbol definition |
| `CALLS` | Function/Method → Function/Method | `line: int`, `confidence: float` | Direct invocation |
| `IMPORTS` | File → File | `symbol: string`, `alias: string` | Import dependency |
| `EXTENDS` | Class → Class | — | Inheritance |
| `IMPLEMENTS` | Class → Interface | — | Interface implementation |
| `MEMBER_OF` | Function/Method/Class → Cluster | `weight: float` | Cluster membership |
| `PART_OF` | Function/Method → Process | `step_index: int`, `role: string` | Process participation |
| `DEPENDS_ON` | Cluster → Cluster | `strength: float` | Cluster-level dependency |

### 2.4 MCP Server — Tool Signatures

The MCP server runs via `gitnexus mcp` (stdio transport). Tools are served with JSON schema via the `@modelcontextprotocol/sdk`.

```typescript
// Tool: list_repos
// No parameters. Returns all indexed repos.
list_repos() → {
  repos: Array<{
    name: string;
    path: string;
    language: string;
    indexed_at: string;
    file_count: number;
    symbol_count: number;
  }>
}

// Tool: query
// Hybrid BM25 + semantic search with RRF fusion, process-grouped results
query({
  query: string,           // natural language or symbol name
  repo?: string,           // optional — required if multiple repos indexed
  limit?: number,          // default 10
  include_processes?: boolean  // group results by process participation
}) → {
  results: Array<{
    node_type: string;     // "Function" | "Class" | "Method" | ...
    name: string;
    file: string;
    line: number;
    snippet: string;
    score: number;         // RRF-fused relevance score
    processes: string[];   // processes this symbol participates in
    cluster: string;       // cluster membership
  }>
}

// Tool: context
// 360-degree symbol view — all references categorised by type and process
context({
  symbol: string,          // function/class/method name
  repo?: string,
  include_callers?: boolean,  // default true
  include_callees?: boolean,  // default true
  depth?: number              // hop depth (default 2)
}) → {
  symbol: { name, type, file, line, docstring },
  callers: Array<{ name, file, line, process? }>,
  callees: Array<{ name, file, line, process? }>,
  cluster: { name, cohesion_score, members: string[] },
  processes: Array<{ name, step_index, role }>
}

// Tool: impact
// Blast radius analysis — upstream callers with depth grouping + confidence
impact({
  symbol: string,
  repo?: string,
  direction?: "upstream" | "downstream" | "both",  // default "upstream"
  max_depth?: number  // default 4
}) → {
  symbol: string;
  total_affected: number;
  depth_groups: Array<{
    depth: number;
    symbols: Array<{ name, file, confidence: number, cluster? }>
  }>,
  affected_processes: string[],
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

// Tool: detect_changes
// Map git diff changed lines → affected processes and symbols
detect_changes({
  diff: string,    // raw git diff output
  repo?: string
}) → {
  changed_files: string[],
  affected_symbols: Array<{ name, file, change_type: "modified" | "added" | "deleted" }>,
  affected_processes: Array<{ name, risk: string }>,
  blast_radius: number
}

// Tool: rename
// Multi-file coordinated rename using graph + text search
rename({
  old_name: string,
  new_name: string,
  repo?: string,
  dry_run?: boolean  // default false
}) → {
  files_to_change: Array<{ file, occurrences: number }>,
  call_sites: number,
  import_sites: number,
  changes_applied?: boolean
}

// Tool: cypher
// Raw Cypher query against KuzuDB — for advanced traversals
cypher({
  query: string,  // Cypher query string
  repo?: string
}) → {
  columns: string[],
  rows: Array<Record<string, any>>
}
```

### 2.5 MCP Resources

| Resource URI | Returns |
|-------------|---------|
| `gitnexus://repos` | All indexed repos (JSON array) |
| `gitnexus://repo/{name}/context` | Codebase stats, staleness, available tools |
| `gitnexus://repo/{name}/clusters` | All clusters with cohesion scores |
| `gitnexus://repo/{name}/cluster/{name}` | Cluster members and details |
| `gitnexus://repo/{name}/processes` | All execution flows |
| `gitnexus://repo/{name}/process/{name}` | Full process trace with steps |
| `gitnexus://repo/{name}/schema` | Graph schema for Cypher queries |

### 2.6 Multi-Repo Registry Architecture

```
~/.gitnexus/registry.json   → { repos: [{ name, path, indexedAt }] }
<repo>/.gitnexus/           → KuzuDB native database (per-repo)
```

Connection pool: lazy open, max 5 concurrent connections, 5-minute inactivity eviction.

### 2.7 Web Frontend Architecture

- **Framework**: React + TypeScript
- **Graph Rendering**: Sigma.js (WebGL) with `graphology` for graph data structures
- **Parsing (WASM)**: `web-tree-sitter` — same grammars as CLI, different binding
- **Storage (WASM)**: KuzuDB WASM — in-memory per session (no persistence in browser mode)
- **Embeddings**: In-browser embedding model (no network call for embeddings)
- **Bridge Mode**: `gitnexus serve` exposes HTTP API; web UI auto-detects `localhost` and routes queries through backend instead of WASM

### 2.8 Agent Skills (installed to `.claude/skills/`)

Four skills automatically installed on `gitnexus analyze`:
- **Exploring**: Navigate unfamiliar code using knowledge graph
- **Debugging**: Trace bugs through call chains
- **Impact Analysis**: Blast radius analysis before changes
- **Refactoring**: Plan safe refactors using dependency mapping

### 2.9 Eval Framework

Located in `eval/`. Supports multiple models (Claude Haiku/Sonnet/Opus, GLM-4.7/5, MiniMax 2.5/M2.1) and modes (baseline, native, native_augment). Baseline = no GitNexus context; native = GitNexus MCP tools; native_augment = hooks + skills.

---

## 3. llm-wiki-compiler Deep Dive

### 3.1 Overview

`llm-wiki-compiler` (CLI: `llmwiki`) transforms raw source documents into an interlinked, navigable wiki. It operates as a deterministic compiler: sources in, Markdown wiki out. No server, no database — state tracked in `.llmwiki/state.json`.

**CLI Commands:**
```bash
llmwiki ingest <url|file>       # Ingest source (web or file) into sources/
llmwiki compile                 # Run full pipeline
llmwiki watch                   # Watch sources/ for changes, auto-compile
llmwiki query "..."             # Semantic query against compiled wiki
llmwiki lint                    # Lint wiki pages for structural issues
```

### 3.2 TypeScript Interfaces (Core Types)

```typescript
// src/utils/types.ts

/** Single concept extracted from source by LLM */
interface ExtractedConcept {
  concept: string;       // Human-readable concept title
  summary: string;       // One-sentence summary
  is_new: boolean;       // True if not in existing wiki index
  tags?: string[];       // Categorisation tags
}

/** Per-source entry in .llmwiki/state.json */
interface SourceState {
  hash: string;          // SHA-256 of source file (change detection)
  concepts: string[];    // Slugified concept names extracted from this source
  compiledAt: string;    // ISO timestamp
}

/** Root shape of .llmwiki/state.json */
interface WikiState {
  version: 1;
  indexHash: string;                        // Hash of wiki index for deduplication
  sources: Record<string, SourceState>;     // filename → state
  frozenSlugs?: string[];                   // Concepts preserved from deleted sources
}

/** Change detection result for a single source file */
interface SourceChange {
  file: string;
  status: "new" | "changed" | "unchanged" | "deleted";
}

/** Wiki page frontmatter (YAML) */
interface WikiFrontmatter {
  title: string;
  sources: string[];       // Contributing source files
  summary: string;
  orphaned?: boolean;      // True if all contributing sources deleted
  tags?: string[];
  aliases?: string[];      // Obsidian-compatible aliases
  createdAt: string;
  updatedAt: string;
}

/** Summary entry for index.md generation */
interface PageSummary {
  title: string;
  slug: string;
  summary: string;
}
```

### 3.3 Full Compilation Pipeline

```
Phase 0: Lock Acquisition
    └── Acquire .llmwiki/lock (prevents concurrent compilation)

Phase 1: Change Detection
    ├── Hash all files in sources/
    ├── Compare with .llmwiki/state.json
    └── Classify: new | changed | unchanged | deleted

Phase 1b: Semantic Dependency Tracking
    ├── Find unchanged sources that share concepts with changed sources
    └── Add them to compile queue (to preserve cross-source content)

Phase 2: Concept Extraction (LLM — one call per source)
    ├── System prompt: buildExtractionPrompt(sourceContent, existingIndex)
    ├── User: "Extract the key concepts from this source."
    ├── Tool use: CONCEPT_EXTRACTION_TOOL (structured output)
    └── Returns: ExtractedConcept[]

Phase 2b: Late Dependency Detection
    └── New sources may share concepts with unchanged sources → re-extract

Phase 3: Freeze Management
    └── Protect concepts from deleted sources by freezing their slugs

Phase 4: Concept Merging
    ├── Group extractions by slug
    └── Multiple sources → combined content for single LLM page generation call

Phase 5: Wiki Page Generation (LLM — one call per concept, concurrent)
    ├── System: buildPagePrompt(concept, combinedContent, existingPage, relatedPages)
    ├── User: "Write the wiki page for '{concept}'."
    ├── Streams response, validates, atomically writes wiki/concepts/{slug}.md
    └── Concurrency: COMPILE_CONCURRENCY = 5 parallel calls

Phase 6: Orphan Marking
    └── Pages whose all contributing sources are deleted → orphaned: true in frontmatter

Phase 7: Interlink Resolution (rule-based, NOT LLM)
    ├── Pass 1 (outbound): scan changed pages for concept title mentions → [[wikilinks]]
    ├── Pass 2 (inbound): scan ALL pages for new concept titles → [[wikilinks]]
    └── Complexity: O(changed × total) per incremental compile

Phase 8: Index Generation
    └── wiki/index.md — sorted summary table of all non-orphaned pages

Phase 9: MOC Generation (Obsidian Map of Content)
    └── wiki/MOC.md — Obsidian-compatible navigation file

Phase 10: Lock Release
```

### 3.4 LLM Integration

**Providers supported:** `anthropic` (default), `openai`, `ollama`

**Configuration:**
```bash
LLMWIKI_PROVIDER=anthropic    # or openai, ollama
LLMWIKI_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

**Default models:**
```typescript
const PROVIDER_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  ollama: "llama3.1",
};
```

**Retry config:** 3 retries, 1s base delay, 4× multiplier.

### 3.5 File Layout

```
<project>/
├── sources/           # Raw input documents (md, txt, web-fetched)
├── wiki/
│   ├── concepts/      # Generated wiki pages, one per concept
│   │   └── {slug}.md  # Frontmatter + body + [[wikilinks]]
│   ├── index.md       # Auto-generated concept index
│   └── MOC.md         # Obsidian Map of Content
└── .llmwiki/
    ├── state.json     # Compilation state (hashes + concept tracking)
    └── lock           # Mutex lock file
```

### 3.6 Constants

```typescript
const MAX_SOURCE_CHARS = 100_000;  // Source truncation limit
const MIN_SOURCE_CHARS = 50;       // Minimum viable source length
const QUERY_PAGE_LIMIT = 5;        // Pages loaded for query context
const COMPILE_CONCURRENCY = 5;     // Parallel LLM calls during generation
const RETRY_COUNT = 3;
const RETRY_BASE_MS = 1000;
const RETRY_MULTIPLIER = 4;
```

### 3.7 Wikilink Resolution Algorithm

The resolver is entirely rule-based (no LLM calls):
1. Build `PageInfo[]` index: `{slug, title, filePath}` for all non-orphaned pages
2. For each changed page: scan body for title substrings (case-insensitive regex)
3. Check `isWordBoundary()`, `isInsideWikilink()`, `isInsideCitation()`
4. Replace first match per title (in reverse position order to preserve offsets)
5. Write atomically via `atomicWrite()` (rename pattern)

---

## 4. mempalace Deep Dive

### 4.1 Architecture Overview

mempalace is a **local-first, API-key-free persistent memory system** for AI agents. It uses a spatial metaphor: a "palace" contains "wings" (projects/domains), "rooms" (named aspects/topics), and "drawers" (verbatim text chunks stored in ChromaDB).

```
~/.mempalace/         (default palace path, overridable via env/config)
├── knowledge_graph.sqlite3   ← Temporal entity-relationship graph (SQLite)
├── identity.txt              ← Layer 0 identity (100 tokens, always loaded)
├── wal/write_log.jsonl       ← Write-ahead log (audit trail)
└── chroma.sqlite3 + ...      ← ChromaDB persistent storage (embeddings)
```

**Collection name:** `mempalace_drawers`

### 4.2 Core Data Model

#### Drawer (ChromaDB document)

```python
{
    # ChromaDB document content (verbatim text chunk, 800 chars max)
    "document": str,

    # Metadata stored alongside embedding
    "metadata": {
        "wing": str,          # Project/domain name (e.g., "wing_code")
        "room": str,          # Aspect name (e.g., "chromadb-setup")
        "source_file": str,   # Absolute path to source file
        "chunk_index": int,   # Sequential chunk number within file
        "added_by": str,      # Agent name that filed this
        "filed_at": str,      # ISO timestamp
        "source_mtime": float,  # File mtime (for change detection)
        "importance": float,   # Optional weight (1.0–5.0, default 3.0)
        "hall": str,           # Optional hall (corridor) metadata
        "date": str,           # Optional date for timeline queries
    },

    # Auto-generated ID
    "id": f"drawer_{wing}_{room}_{sha256(source_file+chunk_index)[:24]}"
}
```

**Chunk parameters:**
```python
CHUNK_SIZE = 800       # chars per drawer
CHUNK_OVERLAP = 100    # overlap between adjacent chunks
MIN_CHUNK_SIZE = 50    # skip tiny chunks
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB — skip larger files
```

#### Knowledge Graph (SQLite)

```sql
-- Entities table
CREATE TABLE entities (
    id TEXT PRIMARY KEY,      -- normalised: name.lower().replace(' ', '_')
    name TEXT NOT NULL,
    type TEXT DEFAULT 'unknown',   -- 'person', 'project', 'animal', etc.
    properties TEXT DEFAULT '{}',  -- JSON blob
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Triples table (temporal RDF-like triples)
CREATE TABLE triples (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,    -- entity.id
    predicate TEXT NOT NULL,  -- e.g., 'child_of', 'loves', 'works_on'
    object TEXT NOT NULL,     -- entity.id
    valid_from TEXT,          -- ISO date when fact became true
    valid_to TEXT,            -- ISO date when fact ceased (NULL = current)
    confidence REAL DEFAULT 1.0,
    source_closet TEXT,       -- drawer ID reference
    source_file TEXT,
    extracted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject) REFERENCES entities(id),
    FOREIGN KEY (object) REFERENCES entities(id)
);

CREATE INDEX idx_triples_subject ON triples(subject);
CREATE INDEX idx_triples_object ON triples(object);
CREATE INDEX idx_triples_predicate ON triples(predicate);
CREATE INDEX idx_triples_valid ON triples(valid_from, valid_to);
```

### 4.3 Memory Layers (4-Layer Stack)

```python
# Layer 0: Identity (~100 tokens) — ALWAYS loaded
class Layer0:
    def __init__(self, identity_path: str = "~/.mempalace/identity.txt"): ...
    def render(self) -> str: ...
    def token_estimate(self) -> int: ...

# Layer 1: Essential Story (~500-800 tokens) — ALWAYS loaded
class Layer1:
    MAX_DRAWERS = 15       # Top N moments by importance score
    MAX_CHARS = 3200       # Hard cap (~800 tokens)
    def __init__(self, palace_path: str = None, wing: str = None): ...
    def generate(self) -> str: ...  # Pulls top drawers, groups by room

# Layer 2: On-Demand (~200-500 tokens per call) — loaded when topic comes up
class Layer2:
    def __init__(self, palace_path: str = None): ...
    def retrieve(self, wing: str = None, room: str = None, n_results: int = 10) -> str: ...

# Layer 3: Deep Search (unlimited) — full semantic search
class Layer3:
    def __init__(self, palace_path: str = None): ...
    def search(self, query: str, wing: str = None, room: str = None, n_results: int = 5) -> str: ...
    def search_raw(self, query: str, wing: str = None, room: str = None, n_results: int = 5) -> list: ...
```

**Wake-up cost:** L0+L1 = ~600-900 tokens. 95%+ of context remains free.

### 4.4 MCP Server Tools

The MCP server (`mempalace.mcp_server`) exposes these tools:

**Read tools:**
```python
tool_status() → {
    "total_drawers": int,
    "wings": dict[str, int],       # wing → drawer count
    "rooms": dict[str, int],       # room → drawer count
    "palace_path": str,
    "protocol": str,               # PALACE_PROTOCOL instructions
    "aaak_dialect": str,           # AAAK compressed memory dialect spec
}

tool_list_wings() → {
    "wings": [{ "name": str, "drawer_count": int, "rooms": list[str] }]
}

tool_list_rooms(wing: str) → {
    "wing": str,
    "rooms": [{ "name": str, "drawer_count": int }]
}

tool_get_taxonomy() → {
    "taxonomy": { wing: { room: count } }
}

tool_search(query: str, wing: str = None, room: str = None, n_results: int = 5) → {
    "query": str,
    "filters": { "wing": str | None, "room": str | None },
    "results": [{
        "text": str,
        "wing": str,
        "room": str,
        "source_file": str,
        "similarity": float   # 1 - ChromaDB distance
    }]
}

tool_check_duplicate(content: str, wing: str = None, room: str = None) → {
    "is_duplicate": bool,
    "similarity": float,
    "existing_drawer": str | None
}
```

**Write tools (all WAL-logged before execution):**
```python
tool_add_drawer(
    content: str,       # verbatim text to store
    wing: str,          # project/domain name
    room: str,          # aspect name (slugified)
    source_file: str = "",
    importance: float = 3.0
) → { "drawer_id": str, "wing": str, "room": str }

tool_delete_drawer(drawer_id: str) → { "deleted": bool }

# Knowledge graph tools:
tool_kg_add(subject: str, predicate: str, obj: str,
            valid_from: str = None, confidence: float = 1.0) → { "triple_id": str }
tool_kg_query(entity: str, as_of: str = None, direction: str = "both") → [...]
tool_kg_invalidate(subject: str, predicate: str, obj: str, ended: str = None) → bool
tool_kg_timeline(entity: str = None) → [...]
tool_kg_stats() → { "entities": int, "triples": int, "current_facts": int, ... }

# Graph traversal tools:
tool_graph_traverse(start_room: str, max_hops: int = 2) → [...]
tool_find_tunnels(wing_a: str = None, wing_b: str = None) → [...]

# Diary / extended tools:
tool_diary_write(content: str, wing: str = "wing_agent") → { "drawer_id": str }
```

### 4.5 File Routing Algorithm

```python
def detect_room(filepath: Path, content: str, rooms: list, project_path: Path) -> str:
    """Priority:
    1. Folder path matches room name/keyword
    2. Filename matches room name
    3. Content keyword scoring (keyword frequency)
    4. Fallback: "general"
    """
```

### 4.6 Palace Graph

```python
# palace_graph.py — No external graph DB, built from ChromaDB metadata

def build_graph(col=None, config=None) -> tuple[dict, list]:
    """
    Nodes: { room: { wings: list, halls: list, count: int, dates: list } }
    Edges: [{ room, wing_a, wing_b, hall, count }] — rooms shared across wings
    """

def traverse(start_room: str, col=None, config=None, max_hops: int = 2) -> list:
    """BFS from start_room, returns [{room, wings, halls, count, hop, connected_via}]"""

def find_tunnels(wing_a: str = None, wing_b: str = None, col=None, config=None) -> list:
    """Rooms connecting two wings (or all tunnel rooms)"""

def graph_stats(col=None, config=None) -> dict:
    """{ total_rooms, tunnel_rooms, total_edges, rooms_per_wing, top_tunnels }"""
```

### 4.7 AAAK Memory Dialect

mempalace defines a compressed memory dialect (AAAK) for efficient LLM storage:
- **Entity codes**: 3-letter uppercase (ALC=Alice, JOR=Jordan)
- **Emotion markers**: `*warm*`, `*fierce*`, `*raw*`, `*bloom*`
- **Structure**: Pipe-separated fields (FAM: | PROJ: | ⚠:)
- **Importance**: ★ to ★★★★★
- **Date**: ISO format, counts as `Nx`

### 4.8 Configuration

```python
# Priority: env vars > ~/.mempalace/config.json > defaults
class MempalaceConfig:
    palace_path: str          # MEMPALACE_PALACE_PATH or ~/.mempalace
    collection_name: str      # "mempalace_drawers"
    # Sanitisation of wing/room names enforced via sanitize_name()
```

### 4.9 Supported File Types

```python
READABLE_EXTENSIONS = {
    ".txt", ".md", ".py", ".js", ".ts", ".jsx", ".tsx",
    ".json", ".yaml", ".yml", ".html", ".css", ".java",
    ".go", ".rs", ".rb", ".sh", ".csv", ".sql", ".toml"
}
```

---

## 5. Memento-Skills Deep Dive

### 5.1 Overview

Memento-Skills is a **fully self-developed agent framework** centred on the `Read → Execute → Reflect → Write` loop. Skills are the primary capability unit: retrievable, executable, evolvable. The system learns from deployment experience without modifying LLM weights.

**Entry points:**
```bash
memento agent             # Interactive CLI agent
memento agent -m "..."    # Single-message mode
memento-gui               # Desktop GUI (Flet)
memento feishu            # Feishu IM bridge
memento verify            # Skill audit + download
memento doctor            # Environment diagnostics
```

### 5.2 Agent Architecture

```
MementoSAgent
├── LLMClient (middleware/llm)
├── SkillGateway (core/skill/gateway.py)
│   └── SkillProvider (core/skill/provider.py)
│       ├── SkillStore (SQLite via SQLAlchemy)
│       ├── SkillIndexer (embedding index for retrieval)
│       └── SkillInitializer (builtin skill sync)
├── ToolDispatcher (core/memento_s/tools.py)
├── ContextManager (core/context/manager.py)
├── PolicyManager (core/memento_s/policies.py)
├── SessionManager (core/manager/session_manager.py)
└── ConversationManager (core/manager/conversation_manager.py)
```

### 5.3 Read-Execute-Reflect-Write Loop (Detailed)

```
Phase 1: INTENT RECOGNITION
    recognize_intent(user_content, history, llm, context_manager)
    → IntentResult { mode: IntentMode, task: str, intent_shifted: bool }

    IntentMode:
    ├── DIRECT    → simple streaming reply (no tools, no plan)
    ├── INTERRUPT → immediate interrupt handling
    └── AGENTIC   → full plan-execute-reflect pipeline

Phase 2: PLAN GENERATION (AGENTIC only)
    generate_plan(goal, context, llm)
    → TaskPlan {
        goal: str,
        steps: [PlanStep { step_id: int, action: str, expected_output: str }]
    }

Phase 3: EXECUTION (inner bounded react loop per step)
    run_plan_execution(state, llm, tool_dispatcher, tool_schemas, ...)
    For each PlanStep:
        Inner loop (max_react_per_step iterations):
            ├── LLM call with current messages + tool schemas
            ├── Tool dispatch via ToolDispatcher
            │   ├── TOOL_SEARCH_SKILL: search(query, k=5) → SkillManifest[]
            │   └── TOOL_EXECUTE_SKILL: execute(skill_name, params)
            ├── Parse tool calls
            └── Accumulate results

Phase 4: REFLECTION (after each plan step)
    reflect(plan, current_step, step_result, remaining_steps, llm)
    → ReflectionResult {
        decision: ReflectionDecision,
        reason: str,
        next_step_hint: str | None,
        completed_step_id: int | None
    }

    ReflectionDecision:
    ├── CONTINUE  → proceed to next step
    ├── REPLAN    → regenerate plan from current state
    └── FINALIZE  → task complete, emit final response

Phase 5: WRITE (on failure / skill improvement)
    SkillGateway.execute("skill-creator", {
        "request": "Optimise skill X for failure Y"
    })
    → New/updated skill written to skills/{name}/SKILL.md
```

### 5.4 Skill Domain Model

```python
# core/skill/schema.py

class ExecutionMode(str, Enum):
    KNOWLEDGE = "knowledge"   # SKILL.md only — pure prompt/knowledge skill
    PLAYBOOK  = "playbook"    # SKILL.md + scripts/ directory — executes code

class Skill(BaseModel):
    name: str                       # Unique skill identifier (e.g., "web-search")
    description: str
    content: str                    # SKILL.md content (instructions + context)
    dependencies: list[str]         # pip packages required
    version: int                    # Increment on each write-back optimisation
    files: dict[str, str]           # filename → content for script files
    references: dict[str, str]      # references/ → content (agentskills.io format)
    source_dir: str | None          # Filesystem path to skill directory
    execution_mode: ExecutionMode | None  # None = inferred from directory structure
    entry_script: str | None        # Playbook entry point (default: main.py)
    required_keys: list[str]        # API key env vars required
    parameters: dict[str, Any] | None  # OpenAI-compatible tool parameter schema
    allowed_tools: list[str]        # Subset of tools this skill may invoke

    @property
    def is_playbook(self) -> bool: ...  # True if scripts/ directory exists
    def to_embedding_text(self) -> str: ...  # For embedding index
```

### 5.5 SkillGateway Protocol

```python
class SkillGateway(Protocol):
    def discover(self) -> list[SkillManifest]:
        """Return all registered skills (builtin + local + cloud-downloaded)."""

    async def search(self, query: str, k: int = 5, cloud_only: bool = False) -> list[SkillManifest]:
        """Semantic search over skill library using embedding index."""

    async def execute(
        self,
        skill_name: str,
        params: dict[str, Any],
        options: SkillExecOptions | None = None
    ) -> SkillExecutionResponse: ...

class SkillManifest(BaseModel):
    name: str
    description: str
    execution_mode: ExecutionMode
    parameters: dict[str, Any] | None = None   # None = self-describing skill
    dependencies: list[str] = []
    governance: SkillGovernanceMeta              # source: "local" | "cloud" | "builtin"

class SkillExecutionResponse(BaseModel):
    ok: bool
    status: SkillStatus                    # "success" | "partial" | "failed" | "blocked" | "timeout"
    error_code: SkillErrorCode | None
    summary: str
    output: Any
    outputs: dict[str, Any]
    artifacts: list[str]                   # File paths produced
    diagnostics: dict[str, Any]
    skill_name: str

class SkillExecOptions(BaseModel):
    workdir: str | None = None
    timeout: int | None = None
    env: dict[str, str] = {}

# Default parameters schema (single natural-language request)
DEFAULT_SKILL_PARAMS = {
    "type": "object",
    "properties": {
        "request": { "type": "string", "description": "Describe clearly what you need this skill to do." }
    },
    "required": ["request"]
}
```

### 5.6 Built-in Skills Catalogue

| Skill Name | Mode | Description |
|-----------|------|-------------|
| `filesystem` | Playbook | File read/write/search/directory operations |
| `web-search` | Playbook | Tavily-based web search + page fetching |
| `image-analysis` | Knowledge | Image understanding, OCR, captioning |
| `pdf` | Playbook | PDF read/form-fill/merge/split/OCR |
| `docx` | Playbook | Word document creation and editing |
| `xlsx` | Playbook | Spreadsheet processing |
| `pptx` | Playbook | PowerPoint creation and editing |
| `skill-creator` | Playbook | New skill creation, optimisation, evaluation |
| `uv-pip-install` | Playbook | Python dependency installation via `uv` |

**skill-creator sub-agents:**
- `analyzer.md` — Diagnose why a skill failed
- `grader.md` — Grade skill execution quality
- `comparator.md` — Compare old vs new skill implementations

### 5.7 Storage Models (SQLAlchemy / SQLite)

```python
class Session(Base):               # Top-level conversation session
    __tablename__ = "sessions"
    id: str                        # UUID
    status: SessionStatus          # active | paused | completed | archived
    created_at: datetime
    updated_at: datetime
    metadata: JSON

class Conversation(Base):          # Single conversation turn
    __tablename__ = "conversations"
    id: str
    session_id: str                # FK → sessions.id
    role: str                      # "user" | "assistant" | "system"
    content: Text
    created_at: datetime
```

### 5.8 LLM Client (Middleware)

```python
# middleware/llm — profile-based LLM routing
# Config: ~/memento_s/config.json
{
    "llm": {
        "active_profile": "default",
        "profiles": {
            "default": {
                "model": "openai/gpt-4o",  # provider/model format
                "api_key": "...",
                "base_url": "https://api.openai.com/v1",
                "max_tokens": 8192,
                "temperature": 0.7,
                "timeout": 120
            }
        }
    }
}
```

Supports: Anthropic Claude, OpenAI, OpenRouter, Ollama, Kimi/Moonshot, MiniMax, GLM/Zhipu, any OpenAI-compatible endpoint.

### 5.9 Context Manager

```python
# core/context/manager.py
class ContextManager:
    async def load_history(self) -> list[dict]: ...
    async def assemble_messages(
        history, current_message, media,
        matched_skills_context, agent_profile, session_context,
        mode, intent_shifted
    ) -> list[dict]: ...
    total_tokens: int
```

Includes scratchpad (session-local scratch space) and compaction logic for long conversations.

---

## 6. lambda-RLM Deep Dive

### 6.1 Overview

lambda-RLM (λ-RLM) is a **Deterministic Recursive Language Model** that replaces the open-ended LLM `while` loop of the original RLM with a pre-verified combinator chain Φ that guarantees termination and bounded cost.

**The core insight:** For long-context problems, instead of feeding everything to one LLM call (context window overflow) or running an open-ended agent loop (non-terminating), λ-RLM computes the *optimal* recursive decomposition analytically and executes it as pure Python code in a REPL — with LLM calls only at the leaves.

### 6.2 Task Types and Operators

```python
class TaskType(str, Enum):
    SUMMARIZATION  = "summarization"
    QA             = "qa"
    TRANSLATION    = "translation"
    CLASSIFICATION = "classification"
    EXTRACTION     = "extraction"
    ANALYSIS       = "analysis"
    GENERAL        = "general"

class ComposeOp(str, Enum):
    CONCATENATE       = "concatenate"        # deterministic: ordered string join
    MERGE_SUMMARIES   = "merge_summaries"    # 1 LLM call: hierarchical merge
    SELECT_RELEVANT   = "select_relevant"    # 1 LLM call: synthesise answers
    MAJORITY_VOTE     = "majority_vote"      # deterministic: frequency count
    MERGE_EXTRACTIONS = "merge_extractions"  # deterministic: deduplication
    COMBINE_ANALYSIS  = "combine_analysis"   # 1 LLM call: combine insights

# Composition cost table (relative LLM call cost per reduce operation)
C_COMPOSE: dict[ComposeOp, float] = {
    ComposeOp.CONCATENATE:       0.01,   # near-free
    ComposeOp.MERGE_SUMMARIES:   2.0,    # one LLM call
    ComposeOp.SELECT_RELEVANT:   1.5,    # one LLM call
    ComposeOp.MAJORITY_VOTE:     0.05,   # near-free
    ComposeOp.MERGE_EXTRACTIONS: 0.05,   # near-free
    ComposeOp.COMBINE_ANALYSIS:  2.0,    # one LLM call
}

# Task → operator mapping
COMPOSITION_TABLE: dict[TaskType, ComposeOp] = {
    TaskType.SUMMARIZATION:  ComposeOp.MERGE_SUMMARIES,
    TaskType.QA:             ComposeOp.SELECT_RELEVANT,
    TaskType.TRANSLATION:    ComposeOp.CONCATENATE,
    TaskType.CLASSIFICATION: ComposeOp.MAJORITY_VOTE,
    TaskType.EXTRACTION:     ComposeOp.MERGE_EXTRACTIONS,
    TaskType.ANALYSIS:       ComposeOp.COMBINE_ANALYSIS,
    TaskType.GENERAL:        ComposeOp.MERGE_SUMMARIES,
}

# Task → pipeline flags (whether to include Filter step)
class PipelineFlags:
    use_filter: bool = False   # QA and EXTRACTION include relevance filter

PLAN_TABLE: dict[TaskType, PipelineFlags] = {
    TaskType.QA:        PipelineFlags(use_filter=True),
    TaskType.EXTRACTION: PipelineFlags(use_filter=True),
    # All others: use_filter=False
}
```

### 6.3 LambdaRLM Class Signature

```python
class LambdaRLM:
    def __init__(
        self,
        backend: ClientBackend = "openai",          # "openai" | "anthropic" | "gemini" | ...
        backend_kwargs: dict[str, Any] | None = None,   # e.g., {"model_name": "gpt-4o"}
        environment: EnvironmentType = "local",     # only "local" used by λ-RLM
        environment_kwargs: dict[str, Any] | None = None,
        context_window_chars: int = 100_000,        # ≈ 25k tokens
        accuracy_target: float = 0.80,              # minimum accuracy α
        a_leaf: float = 0.95,                       # single-call accuracy A(K)
        a_compose: float = 0.90,                    # per-level composition accuracy A_⊕
        query: str | None = None,                   # question for QA/Extraction tasks
        verbose: bool = False,
        logger: RLMLogger | None = None,
    ): ...

    def completion(self, prompt: str) -> RLMChatCompletion:
        """
        Main entry point. Returns RLMChatCompletion (drop-in for RLM.completion).
        Runs all 5 phases internally.
        """
```

### 6.4 Five-Phase Algorithm

```
Phase 1: InitREPL
    LocalREPL created; context stored as context_0, NOT in LLM context
    env_kwargs = { lm_handler_address, context_payload, depth: 1 }

Phase 2: Task Detection (EXACTLY 1 LLM call)
    Sends metadata preview (500 chars) to LLM
    LLM replies with single digit 1-7 (menu selection)
    Maps digit → TaskType

Phase 3: Optimal Planning (0 LLM calls — pure math)
    If n ≤ K: k*=1, τ*=n, depth=0 (direct single call)
    Else:
        k* = ⌈√(n · c_in / c_⊕)⌉          # optimal branching factor
        k* = min(_K_STAR_MAX=20, max(2, k*))
        d  = ⌈log_{k*}(n/K)⌉               # recursion depth
        # Accuracy constraint: A(K)^d · A_⊕^d ≥ α
        # If not satisfied, increment k* (reduces d) until satisfied
        τ* = min(K, ⌊n/k*⌋)               # leaf chunk size

Phase 4: Cost Estimate (deterministic)
    Ĉ = k*^d · C(τ*) + d · C_⊕(k*) + C(500)  [probe cost included]

Phase 5: Execute Φ in REPL
    RegisterLibrary: inject combinators into repl.globals
        _Split(text, k) → list[str]          — word-boundary aware splitting
        _Peek(text, start, length) → str     — preview without full copy
        _Reduce([R₁…R_k']) → str            — task-specific composition
        _FilterRelevant(query, [(chunk, preview)]) → list[str]  — QA/Extraction only
    BuildExecutor: generate Python code string:
        def _Phi(P):
            if len(P) <= τ*:
                return llm_query(template.format(text=P, query=query))  # LEAF
            else:
                [_raw = _Split(P, k*)]
                [_pairs = [(raw[i], _Peek(raw[i], 0, peek_len)) for i in range(len(_raw))]]
                [_chunks = _FilterRelevant(query, _pairs)]  # only if use_filter
                return _Reduce([_Phi(c) for c in _chunks])
        lambda_rlm_result = _Phi(context_0)
    execute_code(phi_code) → result stored in repl.locals["lambda_rlm_result"]
```

### 6.5 LambdaPlan Dataclass

```python
@dataclass
class LambdaPlan:
    task_type:     TaskType
    compose_op:    ComposeOp
    pipeline:      PipelineFlags
    k_star:        int    # optimal branching factor
    tau_star:      int    # leaf chunk size (chars)
    depth:         int    # recursion depth d = ⌈log_{k*}(n/K)⌉
    cost_estimate: float  # Ĉ: relative cost units
    n:             int    # total input length (chars)
```

### 6.6 Return Type

```python
@dataclass
class RLMChatCompletion:
    root_model: str
    prompt: str | dict[str, Any]
    response: str
    usage_summary: UsageSummary          # token counts + cost across all models used
    execution_time: float                # wall-clock seconds
    metadata: dict | None = None         # full trajectory if logger captures it
```

### 6.7 Supported Backends

```python
ClientBackend = Literal[
    "openai", "portkey", "openrouter", "vercel", "vllm",
    "litellm", "anthropic", "azure_openai", "gemini"
]

EnvironmentType = Literal[
    "local", "docker", "modal", "prime", "daytona", "e2b"
]
```

### 6.8 Key Properties

| Property | Value |
|---------|-------|
| LLM calls for task detection | Exactly 1 |
| LLM calls for planning | 0 (pure math) |
| LLM calls in Φ | k*^d leaf calls + d compose calls (where c_⊕ > 0.1) |
| Termination guarantee | Yes (finite recursion depth, no while loop) |
| Max branching factor (k*) | 20 (hard cap) |
| Python recursion limit | 5000 (set via sys.setrecursionlimit) |
| Context management | Context stored in REPL locals, NOT LLM context window |
| Drop-in compatibility | `LambdaRLM.completion()` returns same type as `RLM.completion()` |

---

## 7. awesome-autoresearch Deep Dive

### 7.1 Overview

`awesome-autoresearch` is a curated index — not executable code — of autonomous improvement loops, research agents, and descendants inspired by Karpathy's `autoresearch`. It serves as a **reference taxonomy** and **discovery layer** for the ecosystem.

### 7.2 Key Categories

The README organises projects into:

1. **Autoresearch Descendants** — Direct forks/implementations of Karpathy's pattern (self-referential research loops)
2. **Self-Improvement Agents** — Systems that evolve their own capabilities (Memento-Skills falls here)
3. **Research Automation** — Full literature review/synthesis pipelines
4. **Multi-Agent Research** — Collaborative agent networks for research
5. **Tool-Augmented Reasoning** — RAG + tools for research tasks
6. **Benchmark Agents** — Systems evaluated on GAIA, HLE, SWE-Bench, etc.
7. **Memory-Augmented Research** — Systems with persistent knowledge stores (mempalace falls here)
8. **Code Research Agents** — Codebase understanding agents (GitNexus falls here)
9. **Knowledge Compilation** — Source-to-structured-knowledge pipelines (llm-wiki-compiler falls here)
10. **Long-Context Processing** — Recursive decomposition approaches (lambda-RLM falls here)

### 7.3 Relevance to the Ecosystem

This repo serves as the **theoretical framework** and **external validation** for the other five repos:
- Confirms Memento-Skills' Read-Reflect-Write loop is a recognised paradigm
- Validates the niche of each tool in the autonomous AI landscape
- Provides integration inspiration from community work (e.g., combining RAG with self-improvement)

---

## 8. Integration Opportunities

### 8.1 GitNexus → lambda-RLM: Large Codebase Reasoning

**Problem:** GitNexus `query` tool returns rich graph context, but for very large codebases the combined context exceeds LLM context windows.

**Solution:**
```python
# Integration pattern
async def analyze_large_codebase(query: str, repo: str) -> str:
    # Step 1: Get all relevant context from GitNexus (may be very large)
    context = gitnexus_mcp.query(query=query, repo=repo, limit=100)
    context_text = format_context_for_rlm(context)

    # Step 2: Use lambda-RLM to process if context exceeds threshold
    if len(context_text) > 50_000:  # ~12.5k tokens
        rlm = LambdaRLM(backend="openai", backend_kwargs={"model_name": "gpt-4o"},
                         query=query, context_window_chars=100_000)
        result = rlm.completion(f"Context:\n{context_text}\n\nQuestion: {query}\n\nAnswer:")
        return result.response
    else:
        # Direct LLM call for smaller contexts
        return llm.complete(f"Context: {context_text}\n\nQuestion: {query}")
```

**Data transformation needed:**
- GitNexus JSON results → text format compatible with lambda-RLM's "Context:\n...\n\nQuestion:..." pattern
- Structured graph data → linearised text with clear section markers

### 8.2 GitNexus → llm-wiki-compiler: Automatic Codebase Wiki

**Problem:** GitNexus generates AGENTS.md/CLAUDE.md contextual files, but these are flat. A navigable wiki would be richer.

**Solution:**
```bash
# Step 1: Export GitNexus clusters + processes as source documents
gitnexus cypher --repo my-app "MATCH (c:Cluster) RETURN c.name, c.description" > sources/clusters.md
gitnexus cypher --repo my-app "MATCH (p:Process) RETURN p.name, p.description" > sources/processes.md

# Step 2: Compile into interlinked wiki
llmwiki compile
# → wiki/concepts/authentication-flow.md
# → wiki/concepts/user-service.md (with [[Authentication Flow]] wikilinks)
```

**Specific connection points:**
- GitNexus `gitnexus://repo/{name}/clusters` resource → llm-wiki-compiler source document
- GitNexus `gitnexus://repo/{name}/processes` resource → source document
- Each cluster becomes a wiki concept page with wikilinks to its member functions
- GitNexus `detect_changes` → llm-wiki-compiler `watch` mode (only recompile affected concepts)

### 8.3 llm-wiki-compiler → mempalace: Compiled Knowledge → Persistent Memory

**Problem:** llm-wiki-compiler generates wiki pages but they're file-based, not semantically searchable with wing/room structure.

**Solution:**
```python
def ingest_wiki_into_palace(wiki_root: str, palace_path: str, project_name: str):
    """Ingest compiled wiki pages into mempalace for semantic retrieval."""
    from pathlib import Path
    import chromadb

    col = get_collection(palace_path)
    concepts_dir = Path(wiki_root) / "wiki" / "concepts"

    for md_file in concepts_dir.glob("*.md"):
        content = md_file.read_text()
        parsed = parse_frontmatter(content)
        concept_title = parsed["title"]
        concept_summary = parsed["summary"]
        tags = parsed.get("tags", [])

        # Room = concept slug, Wing = project name
        room = md_file.stem  # e.g., "authentication-flow"
        wing = project_name  # e.g., "wing_myproject"

        # Mine chunks into palace
        for chunk in chunk_text(content, str(md_file)):
            add_drawer(col, wing=wing, room=room,
                      content=chunk["content"],
                      source_file=str(md_file),
                      chunk_index=chunk["chunk_index"],
                      agent="wiki-compiler")
```

**Data flow:** `sources/*.md` → llm-wiki-compiler → `wiki/concepts/*.md` → mempalace drawers

### 8.4 mempalace → Memento-Skills: Persistent Skill Memory

**Problem:** Memento-Skills stores skill evolution in local SQLite, but cross-session semantic memory of *why* a skill was optimised is not captured.

**Solution:**
```python
# After skill optimisation, file a memory
async def after_skill_reflection(skill_name: str, failure_reason: str, solution: str):
    await mempalace_mcp.add_drawer(
        content=f"Skill: {skill_name}\nFailure: {failure_reason}\nSolution: {solution}",
        wing="wing_agent",
        room="skill-learnings",
        importance=4.0  # High importance
    )

# Before skill execution, check palace for prior learnings
async def before_skill_search(skill_name: str) -> str:
    results = await mempalace_mcp.search(
        query=f"{skill_name} failure solution",
        wing="wing_agent",
        room="skill-learnings",
        n_results=3
    )
    return format_learnings(results)
```

### 8.5 lambda-RLM → Memento-Skills: Long-Context Skill Execution

**Problem:** Some Memento-Skills skill executions produce or require very large text (e.g., PDF analysis, web search aggregation).

**Solution:** Use lambda-RLM as a transparent "long-context-capable" drop-in within skill execution:

```python
# core/skill/execution/long_context.py
class LongContextSkillExecutor:
    def __init__(self, threshold_chars: int = 50_000):
        self.threshold = threshold_chars
        self.rlm = LambdaRLM(backend="openai", verbose=True)

    async def execute(self, content: str, query: str) -> str:
        if len(content) <= self.threshold:
            return await self.llm.complete(f"{content}\n\nQuestion: {query}")
        return self.rlm.completion(
            f"Context:\n{content}\n\nQuestion: {query}\n\nAnswer:"
        ).response
```

### 8.6 GitNexus → Memento-Skills: Code Impact as Agent Skill

**Problem:** Memento-Skills has a `filesystem` skill but no code-structure-aware skill.

**Solution:** Register GitNexus MCP tools as a Memento-Skills skill:

```markdown
<!-- builtin/skills/gitnexus/SKILL.md -->
# GitNexus Code Intelligence Skill

Use the GitNexus MCP server to understand codebase structure, trace dependencies, and assess change impact.

## Available Operations
- `query(query, repo)` — Search for symbols
- `impact(symbol, repo)` — Blast radius analysis
- `context(symbol, repo)` — 360-degree symbol view
- `detect_changes(diff, repo)` — Map git diff to processes
```

### 8.7 All Systems → awesome-autoresearch: Pattern Validation

The awesome-autoresearch index validates that each component implements a recognised paradigm:

| Component | Autoresearch Pattern |
|-----------|---------------------|
| Memento-Skills | Self-improving agent (Read-Execute-Reflect-Write) |
| lambda-RLM | Long-context recursive reasoning |
| mempalace | Memory-augmented research |
| GitNexus | Code research agent |
| llm-wiki-compiler | Knowledge compilation |

---

## 9. Key Data Flows

### 9.1 Codebase Understanding Flow

```
Developer: "What would break if I rename UserService.validate()?"
    │
    ▼
Memento-Skills (intent: AGENTIC)
    │
    ├─1─► GitNexus MCP: impact({ symbol: "UserService.validate", direction: "upstream" })
    │      └── KuzuDB Cypher traversal
    │      └── Returns: { affected_symbols: 47, depth_groups: [...], risk_level: "HIGH" }
    │
    ├─2─► GitNexus MCP: context({ symbol: "UserService.validate" })
    │      └── Returns: { callers: [...], processes: ["auth-flow", "api-gateway"] }
    │
    ├─3─► lambda-RLM (if combined context > 50k chars)
    │      └── TaskType: ANALYSIS
    │      └── Φ: Split(context, k*) → Filter(relevant) → Map(analyze) → Reduce(combine)
    │      └── Returns: synthesised risk assessment
    │
    ├─4─► mempalace: search("UserService.validate prior changes")
    │      └── ChromaDB semantic search → prior incident memories
    │
    └─5─► Memento-Skills: reflect → finalize
           └── Assembles: impact report + context + rlm synthesis + memory
           └── Files memory: add_drawer(content=report, wing="wing_code", room="user-service")
```

### 9.2 Knowledge Compilation Flow

```
Research Docs (PDFs, web pages, markdown files)
    │
    ├─► llmwiki ingest <url>         # Web scrape → sources/
    ├─► llmwiki ingest <file.pdf>    # PDF → sources/
    │
    ▼
sources/
├── paper1.md
├── blog-post.md
└── documentation.md
    │
    ▼
llmwiki compile
    │
    ├─ Phase 2: LLM concept extraction
    │    ├── "knowledge-compilation" (new)
    │    ├── "incremental-compilation" (new)
    │    └── "wikilinks" (new)
    │
    ├─ Phase 5: LLM wiki page generation (concurrent, k=5)
    │    ├── wiki/concepts/knowledge-compilation.md
    │    ├── wiki/concepts/incremental-compilation.md
    │    └── wiki/concepts/wikilinks.md
    │
    ├─ Phase 7: Rule-based wikilink resolution
    │    └── "incremental-compilation.md" now contains [[Knowledge Compilation]]
    │
    ▼
wiki/concepts/*.md (interlinked wiki)
    │
    ▼
mempalace mine <wiki-root>       # Ingest wiki into palace
    │
    ▼
ChromaDB (palace)
    ├── wing: "research"
    │   ├── room: "knowledge-compilation"  (drawers from wiki page)
    │   ├── room: "incremental-compilation"
    │   └── room: "wikilinks"
    │
    ▼
mempalace search "how does incremental compilation work?"
    └── Returns: verbatim wiki page chunks with similarity scores
```

### 9.3 Self-Evolving Agent Flow

```
User: "Analyse this 500-page PDF and extract all regulatory requirements"
    │
    ▼
Memento-Skills
    │
    ├─ Intent: AGENTIC
    │
    ├─ Plan:
    │   Step 1: Read PDF
    │   Step 2: Extract requirements using lambda-RLM
    │   Step 3: Store in mempalace
    │   Step 4: Generate summary report
    │
    ├─ Execute Step 1: skill="pdf", params={request: "Read /path/to/document.pdf"}
    │   ├── SkillGateway.search("pdf reading") → pdf skill
    │   ├── Execute pdf/scripts/main.py
    │   └── SkillExecutionResponse { ok: true, output: "500 pages of text..." }
    │
    ├─ Execute Step 2: LongContextSkillExecutor
    │   ├── len(pdf_text) = 750,000 chars >> 100,000 (context window)
    │   ├── LambdaRLM(query="extract regulatory requirements")
    │   │   ├── Phase 2: TaskType.EXTRACTION (1 LLM call)
    │   │   ├── Phase 3: k*=9, τ*=83333, d=1 (0 LLM calls)
    │   │   └── Phase 5: Split(9) → FilterRelevant → Map(extract) → MergeExtractions
    │   │       └── ~9 leaf LLM calls + 0 compose (deterministic dedup)
    │   └── Returns: deduplicated list of requirements
    │
    ├─ Execute Step 3: mempalace_add_drawer (for each requirement)
    │   └── wing="wing_legal", room="regulatory-requirements"
    │
    ├─ Reflect: CONTINUE → FINALIZE
    │
    ├─ (On failure) Reflect: REPLAN
    │   └── skill-creator: "pdf skill failed on scanned PDF — add OCR support"
    │   └── New skill version written to skills/pdf/scripts/ocr_main.py
    │   └── Skill.version incremented
    │
    └─ Final: Report filed in mempalace + streamed to user
```

### 9.4 Multi-Repo Code Graph Flow (ASCII Diagram)

```
Repo A                  Repo B                  Repo C
(.gitnexus/)            (.gitnexus/)            (.gitnexus/)
    │                       │                       │
    └───────────────────────┴───────────────────────┘
                            │
                    ~/.gitnexus/registry.json
                            │
                    gitnexus mcp (stdio)
                    ┌───────────────────┐
                    │  KuzuDB Pool      │
                    │  (max 5 conns)    │
                    │  5min TTL         │
                    └───────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
         list_repos()              query({repo:"A"})
         → [{A,B,C}]               → [results from A]
               │                         │
               ▼                         ▼
        AI Agent                  lambda-RLM
        (any MCP client)          (if context > 50k)
```

---

## 10. Tech Stack Compatibility

### 10.1 Language Boundaries

| Repo | Primary Language | Runtime | Version |
|------|-----------------|---------|---------|
| GitNexus | TypeScript | Node.js ≥ 18 | npm/npx |
| llm-wiki-compiler | TypeScript | Node.js ≥ 18 | npm |
| mempalace | Python | CPython ≥ 3.9 | pip / uv |
| Memento-Skills | Python | CPython ≥ 3.12 | pip / uv |
| lambda-RLM | Python | CPython ≥ 3.10 (implied) | pip |
| awesome-autoresearch | — | — | — |

**Key boundary:** TypeScript (Node.js) vs Python — requires inter-process communication.

**Communication patterns:**
1. **MCP (Model Context Protocol)** — GitNexus exposes MCP; Python clients can connect via stdio
2. **HTTP API** — `gitnexus serve` exposes REST; Python `requests` can call it
3. **CLI subprocess** — Python can shell out to `gitnexus` and `llmwiki` CLI

### 10.2 Dependency Analysis

#### Python Dependencies (potential conflicts)

| Package | mempalace | Memento-Skills | lambda-RLM | Notes |
|---------|-----------|----------------|------------|-------|
| `chromadb` | `>=0.5.0,<0.7` | — | — | ONNX Runtime for embeddings; CoreML disabled on Apple Silicon |
| `pyyaml` | `>=6.0,<7` | — | — | |
| `sqlalchemy` | — | Yes (ORM) | — | |
| `pydantic` | — | Yes (BaseModel) | — | Likely v2 given Python 3.12+ requirement |
| `anthropic` | — | Profile-based | Yes (client) | |
| `openai` | — | Profile-based | Yes (client) | |
| `flet` | — | GUI only | — | Desktop GUI |

**Potential conflict:** mempalace pins `chromadb<0.7` — check compatibility if installed alongside.

#### Node.js Dependencies (llm-wiki-compiler)

```json
{
    "@anthropic-ai/sdk": "^0.39.0",
    "openai": "^4.0.0",
    "commander": "^13.0.0",
    "chokidar": "^4.0.0",    // Watch mode
    "p-limit": "^6.0.0",     // Concurrency limiting
    "js-yaml": "^4.1.1",
    "@mozilla/readability": "^0.5.0",  // Web ingestion
    "jsdom": "^25.0.0",
    "turndown": "^7.2.0"     // HTML → Markdown
}
```

#### Node.js Dependencies (GitNexus)

```json
{
    "@modelcontextprotocol/sdk": "latest",  // MCP server
    "kuzu": "latest",                        // KuzuDB Node.js binding
    "web-tree-sitter": "latest",             // WASM parsing for web UI
    "graphology": "latest",                  // Graph data structures
    "sigma": "latest"                        // WebGL graph rendering
}
```

### 10.3 MCP as the Universal Interface

MCP (Model Context Protocol) is the natural integration boundary between TypeScript tools (GitNexus) and Python agents (Memento-Skills, mempalace):

```
Python Agent                    TypeScript Tool
(Memento-Skills)                (GitNexus)
     │                               │
     │  mcp.tool("query", {...})     │
     │──────────────────────────────►│
     │                               │ KuzuDB query
     │  {"results": [...]}           │
     │◄──────────────────────────────│
     │                               │
```

**Python MCP client for GitNexus:**
```python
# Using mcp Python SDK
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def query_gitnexus(query: str, repo: str = None):
    async with stdio_client(StdioServerParameters(
        command="npx", args=["-y", "gitnexus@latest", "mcp"]
    )) as (read, write):
        async with ClientSession(read, write) as session:
            result = await session.call_tool("query", {
                "query": query, "repo": repo
            })
            return result.content
```

### 10.4 Version Compatibility Matrix

| Component | Python 3.9 | Python 3.10 | Python 3.11 | Python 3.12 | Node 18 | Node 20 |
|-----------|-----------|-------------|-------------|-------------|---------|---------|
| mempalace | ✓ | ✓ | ✓ | ✓ | — | — |
| lambda-RLM | ~ | ✓ | ✓ | ✓ | — | — |
| Memento-Skills | ✗ | ✗ | ✗ | ✓ | — | — |
| GitNexus | — | — | — | — | ✓ | ✓ |
| llm-wiki-compiler | — | — | — | — | ✓ | ✓ |

**Recommendation:** Use Python 3.12 for all Python components. Use Node 20 LTS for TypeScript components.

### 10.5 Storage Compatibility

| System | Storage Backend | Location | Concurrent Access |
|--------|----------------|----------|------------------|
| GitNexus | KuzuDB | `<repo>/.gitnexus/` | Pool (max 5, lazy) |
| llm-wiki-compiler | JSON + Markdown files | `.llmwiki/state.json` | Lock file (no concurrent) |
| mempalace (vector) | ChromaDB (persistent) | `~/.mempalace/` | SQLite WAL mode |
| mempalace (kg) | SQLite (WAL mode) | `~/.mempalace/knowledge_graph.sqlite3` | WAL, thread-safe |
| Memento-Skills | SQLite (SQLAlchemy) | `~/memento_s/` | Standard SQLAlchemy |
| Memento-Skills (skills) | Filesystem | skills/ directory | File-level |

---

## 11. Recommended Architecture Patterns

### 11.1 Unified "Super 3D Node Graph Recursive GitNexus" System

The target system combines all six repositories into a coherent architecture with the following layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERACTION LAYER                             │
│   CLI (memento agent)  │  GUI (memento-gui)  │  Feishu Bridge  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                  AGENT ORCHESTRATION LAYER                       │
│              Memento-Skills (MementoSAgent)                      │
│   Intent → Plan → Execute → Reflect → Write (self-evolving)     │
└───┬────────────────┬──────────────────┬─────────────────────────┘
    │                │                  │
    ▼                ▼                  ▼
┌───────┐   ┌────────────┐   ┌──────────────────────────────────┐
│       │   │  KNOWLEDGE  │   │         MEMORY LAYER             │
│ CODE  │   │ COMPILATION │   │  mempalace                       │
│ LAYER │   │   LAYER     │   │  ├── ChromaDB (semantic search)  │
│       │   │             │   │  ├── SQLite KG (temporal facts)  │
│GitNex.│   │llm-wiki-    │   │  ├── 4-Layer memory stack        │
│MCP    │   │compiler     │   │  └── WAL audit trail             │
│       │   │             │   └──────────────────────────────────┘
│KuzuDB │   │sources/→    │
│graph  │   │wiki/        │
└───────┘   └────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 LONG-CONTEXT REASONING LAYER                     │
│                     lambda-RLM                                   │
│   Φ = Split(k*) → Filter? → Map(leaf_LLM) → Reduce(⊕)          │
│   Guaranteed termination, O(k*^d) leaf LLM calls                │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Microservice Boundaries

**Recommendation: 5 microservices + 1 shared bus**

```
Service 1: GitNexus Code Intelligence Service
    Protocol: MCP (stdio) or HTTP (gitnexus serve)
    Lang: Node.js / TypeScript
    Responsibility: Code graph indexing, symbol queries, impact analysis
    Exposed: MCP tools (query, context, impact, detect_changes, cypher)

Service 2: Knowledge Compilation Service
    Protocol: CLI subprocess or HTTP wrapper
    Lang: Node.js / TypeScript
    Responsibility: Source → wiki compilation (watch mode for continuous)
    Exposed: REST: POST /compile, GET /wiki/concepts, POST /ingest

Service 3: Memory Palace Service
    Protocol: MCP (stdio) or HTTP wrapper
    Lang: Python
    Responsibility: Semantic memory storage and retrieval
    Exposed: MCP tools (search, add_drawer, kg_query, kg_add)

Service 4: Long-Context Reasoning Service
    Protocol: Python function call or gRPC
    Lang: Python
    Responsibility: λ-RLM processing for inputs > threshold
    Exposed: completion(prompt: str) → RLMChatCompletion

Service 5: Agent Orchestration Service
    Protocol: CLI + GUI + WebSocket (Feishu)
    Lang: Python
    Responsibility: Intent recognition, planning, skill routing, reflection
    Exposed: reply_stream(session_id, user_content) → AsyncGenerator

Shared: Event Bus (optional for async workflows)
    e.g., Redis Streams, NATS, or simple SQLite queue
    Events: "source_ingested", "skill_optimised", "memory_filed", "wiki_compiled"
```

### 11.3 Data Contracts

**Contract 1: GitNexus → lambda-RLM**
```python
@dataclass
class CodebaseAnalysisRequest:
    query: str
    context_text: str          # Linearised graph context from GitNexus
    context_chars: int         # len(context_text) — routing decision
    repo: str
    threshold_chars: int = 50_000  # Route to lambda-RLM if exceeded

@dataclass
class CodebaseAnalysisResponse:
    answer: str
    source: Literal["direct", "lambda_rlm"]
    llm_calls: int
    execution_time: float
```

**Contract 2: llm-wiki-compiler → mempalace**
```python
@dataclass
class WikiPageIngestRequest:
    slug: str                  # Concept slug (filename without .md)
    title: str
    content: str               # Full wiki page content
    wing: str                  # Palace wing to store in
    room: str                  # = slug (concept as room)
    sources: list[str]         # Contributing source files
    tags: list[str]
```

**Contract 3: Memento-Skills → mempalace (skill learnings)**
```python
@dataclass
class SkillLearningRecord:
    skill_name: str
    version: int
    failure_reason: str | None
    solution: str | None
    task_context: str
    outcome: Literal["success", "failure", "improvement"]
    importance: float          # 1-5 scale
```

**Contract 4: Memento-Skills → GitNexus (code skill)**
```python
# SKILL.md for gitnexus skill:
# Parameters schema:
{
    "type": "object",
    "properties": {
        "operation": {
            "type": "string",
            "enum": ["query", "context", "impact", "detect_changes", "rename", "cypher"]
        },
        "params": { "type": "object" },
        "repo": { "type": "string" }
    },
    "required": ["operation", "params"]
}
```

### 11.4 Event-Driven Integration Patterns

**Pattern 1: Code Change → Wiki Update → Memory Refresh**
```
git commit
    │
    ▼
GitNexus detect_changes(diff)
    │ Event: "code_changed" { affected_processes, risk_level }
    ▼
llm-wiki-compiler watch (file watcher)
    │ Recompile affected concept pages
    ▼
Event: "wiki_updated" { changed_concepts }
    │
    ▼
mempalace: mine updated wiki pages
    │ Update drawers for changed concepts
    ▼
Memento-Skills: invalidate cached skill contexts
```

**Pattern 2: Agent Failure → Skill Evolution → Memory Update**
```
Skill execution failure
    │
    ▼
Memento-Skills: reflect(REPLAN/FAILED)
    │
    ├─► mempalace: search prior failure patterns for this skill
    │    └── Returns: similar failure context + prior solutions
    │
    ├─► skill-creator: analyze + optimize skill
    │    └── May invoke lambda-RLM for large skill analysis context
    │
    ├─► Write improved skill (new version)
    │
    └─► mempalace: add_drawer(skill_learning_record, importance=4.0)
```

**Pattern 3: Research Pipeline**
```
Research topic request
    │
    ▼
Memento-Skills plan:
    Step 1: web-search(topic)
    Step 2: llmwiki ingest(URLs)
    Step 3: llmwiki compile
    Step 4: lambda-RLM synthesis(all wiki pages)
    Step 5: mempalace mine(wiki) + kg_add(discovered entities)
    Step 6: GitNexus index(any code repositories found)
    Step 7: Generate structured research report
```

### 11.5 "Super 3D Node Graph" — Specific Design for GitNexus Extension

The "Super 3D Node Graph" extends GitNexus's 2D Sigma.js graph to a **multi-dimensional knowledge graph** where:

**Dimension 1:** Code structure (current GitNexus graph — functions, classes, processes)  
**Dimension 2:** Knowledge concepts (llm-wiki-compiler — concept pages, wikilinks)  
**Dimension 3:** Memory traces (mempalace — wings, rooms, temporal facts)

**Implementation recommendation:**

```typescript
// Extended node types for the 3D graph
interface SuperNode {
    id: string;
    // Existing GitNexus dimensions
    type: "Function" | "Class" | "Cluster" | "Process" | "File"
        | "Concept"       // NEW: llm-wiki-compiler
        | "Memory"        // NEW: mempalace drawer
        | "Entity";       // NEW: mempalace KG entity
    label: string;
    // 3D positioning
    x: number;
    y: number;
    z: number;           // Dimension = conceptual layer
    layer: "code" | "knowledge" | "memory";
    color: string;       // Layer-specific coloring
    metadata: Record<string, any>;
}

interface SuperEdge {
    id: string;
    source: string;
    target: string;
    type: "CALLS" | "IMPORTS" | "DEFINES"          // code layer
        | "WIKILINKS" | "CONCEPTS" | "ORPHANED"    // knowledge layer
        | "REMEMBERS" | "RELATED_TO" | "KG_TRIPLE" // memory layer
        | "GROUNDS"      // cross-layer: concept ↔ code symbol
        | "CAPTURES";    // cross-layer: memory ↔ code event
    weight: number;
    cross_layer: boolean;
}

// Cross-layer resolution queries (Cypher extensions):
// MATCH (f:Function)-[:GROUNDS]-(c:Concept)-[:CAPTURES]-(m:Memory)
// WHERE f.name = "UserService.validate"
// RETURN f, c, m
```

**3D layout algorithm:**
- Z-axis: layer separation (code=0, knowledge=1, memory=2)
- XY plane per layer: force-directed (current Sigma.js layout)
- Cross-layer edges: vertical arcs connecting related nodes across dimensions
- Interactive: click a code function → see its wiki concept pages → see what agents have remembered about it

### 11.6 Recommended Development Sequence

1. **Phase 1: Foundation** — Get all 5 services running independently  
   - Verify GitNexus indexes a test repo and MCP works
   - Verify llm-wiki-compiler compiles a test source set
   - Verify mempalace mines and searches correctly
   - Verify Memento-Skills runs with builtin skills
   - Verify lambda-RLM processes a test long-context prompt

2. **Phase 2: Point Integrations**  
   - Wire GitNexus as a Memento-Skills skill (SKILL.md wrapper)
   - Wire mempalace MCP into Memento-Skills context injection
   - Wire lambda-RLM as a transparent long-context handler in skill execution

3. **Phase 3: Pipeline Integrations**  
   - GitNexus → llm-wiki-compiler (export clusters/processes as sources)
   - llm-wiki-compiler → mempalace (ingest wiki pages as drawers)
   - Skill failure → mempalace (file learnings) + skill-creator (evolve)

4. **Phase 4: Event-Driven Automation**  
   - File watcher: code change → wiki recompile → memory refresh
   - Agent loop: failure → reflection → skill evolution → memory write

5. **Phase 5: 3D Visualization**  
   - Extend GitNexus web UI with z-axis rendering
   - Add mempalace drawers and llm-wiki concepts as node types
   - Implement cross-layer edge types (GROUNDS, CAPTURES)

### 11.7 Configuration Unification

Recommend a single `unified.config.json`:

```json
{
  "gitnexus": {
    "mcp_mode": "stdio",
    "registry": "~/.gitnexus/registry.json"
  },
  "llmwiki": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "sources_dir": "sources/",
    "compile_concurrency": 5
  },
  "mempalace": {
    "palace_path": "~/.mempalace",
    "collection": "mempalace_drawers",
    "default_wing": "wing_research"
  },
  "lambda_rlm": {
    "backend": "openai",
    "model": "gpt-4o",
    "context_window_chars": 100000,
    "threshold_chars": 50000,
    "accuracy_target": 0.80
  },
  "memento_skills": {
    "python": "3.12",
    "skills_dir": "~/memento_s/skills/",
    "max_iterations": 10,
    "reflection_enabled": true
  }
}
```

---

## Appendix A: Key File Locations Summary

| Repo | Critical Files |
|------|---------------|
| GitNexus | `gitnexus/src/mcp/server.ts`, `gitnexus/src/indexer/`, `gitnexus/src/graph/schema.ts` |
| llm-wiki-compiler | `src/compiler/index.ts`, `src/utils/types.ts`, `src/compiler/prompts.ts`, `src/compiler/resolver.ts` |
| mempalace | `mempalace/palace.py`, `mempalace/miner.py`, `mempalace/searcher.py`, `mempalace/layers.py`, `mempalace/knowledge_graph.py`, `mempalace/mcp_server.py` |
| Memento-Skills | `core/memento_s/agent.py`, `core/memento_s/phases/execution.py`, `core/memento_s/phases/reflection.py`, `core/skill/gateway.py`, `core/skill/schema.py` |
| lambda-RLM | `rlm/lambda_rlm.py`, `rlm/core/types.py`, `rlm/core/rlm.py` |

## Appendix B: Quick Reference — All Public APIs

```
# GitNexus CLI
gitnexus analyze [path] [--force] [--skip-embeddings]
gitnexus mcp                     # stdio MCP server
gitnexus serve                   # HTTP server (default :3000)
gitnexus list | status | clean | wiki [--model] [--base-url]

# llmwiki CLI
llmwiki ingest <url|file>
llmwiki compile [--root <path>]
llmwiki watch [--root <path>]
llmwiki query "<question>" [--root <path>]
llmwiki lint [--root <path>]

# mempalace CLI
mempalace init <dir>
mempalace mine <dir> [--dry-run]
mempalace search "<query>" [--wing W] [--room R] [--n N]
mempalace status [--palace PATH]

# Memento-Skills CLI
memento agent [-m "<message>"]
memento-gui
memento doctor
memento verify
memento feishu

# lambda-RLM Python API
rlm = LambdaRLM(backend, backend_kwargs, context_window_chars, accuracy_target, query)
result = rlm.completion(prompt)  # → RLMChatCompletion
```

---

*End of Report — Generated by Copilot Deep Research Agent*
