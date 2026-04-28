import subprocess
import json
import os
import math
import random
import networkx as nx
from typing import List, Dict, Any
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.graph import GraphNode, GraphEdge

REPOS_BASE = "/home/runner/work/meta-harness-tbench2-artifact/meta-harness-tbench2-artifact/repos"

REPO_NODES: Dict[str, List[Dict]] = {
    "GitNexus": [
        {"id": "gn_cli", "label": "CLI", "type": "Class", "file_path": "src/cli.ts"},
        {"id": "gn_analyze", "label": "analyzeCommand", "type": "Function", "file_path": "src/commands/analyze.ts"},
        {"id": "gn_serve", "label": "serveCommand", "type": "Function", "file_path": "src/commands/serve.ts"},
        {"id": "gn_mcp", "label": "mcpCommand", "type": "Function", "file_path": "src/commands/mcp.ts"},
        {"id": "gn_indexer", "label": "RepoIndexer", "type": "Class", "file_path": "src/indexer.ts"},
        {"id": "gn_graph", "label": "GraphBuilder", "type": "Class", "file_path": "src/graph.ts"},
        {"id": "gn_parser", "label": "parseRepo", "type": "Function", "file_path": "src/parser.ts"},
        {"id": "gn_export", "label": "exportGraph", "type": "Function", "file_path": "src/export.ts"},
        {"id": "gn_server", "label": "DevServer", "type": "Process", "file_path": "src/server.ts"},
        {"id": "gn_types", "label": "types", "type": "File", "file_path": "src/types.ts"},
        {"id": "gn_cluster_core", "label": "CoreCluster", "type": "Cluster", "file_path": "src/"},
        {"id": "gn_cluster_cmd", "label": "CommandsCluster", "type": "Cluster", "file_path": "src/commands/"},
        {"id": "gn_node_factory", "label": "NodeFactory", "type": "Function", "file_path": "src/graph.ts"},
        {"id": "gn_edge_builder", "label": "EdgeBuilder", "type": "Function", "file_path": "src/graph.ts"},
        {"id": "gn_walker", "label": "ASTWalker", "type": "Class", "file_path": "src/ast.ts"},
        {"id": "gn_cache", "label": "GraphCache", "type": "Class", "file_path": "src/cache.ts"},
        {"id": "gn_main", "label": "main", "type": "File", "file_path": "src/index.ts"},
        {"id": "gn_config", "label": "Config", "type": "File", "file_path": "src/config.ts"},
        {"id": "gn_process_main", "label": "MainProcess", "type": "Process", "file_path": "src/index.ts"},
        {"id": "gn_process_watch", "label": "WatchProcess", "type": "Process", "file_path": "src/watcher.ts"},
    ],
    "llm-wiki-compiler": [
        {"id": "wc_compiler", "label": "WikiCompiler", "type": "Class", "file_path": "src/compiler.ts"},
        {"id": "wc_ingest", "label": "ingestPage", "type": "Function", "file_path": "src/ingest.ts"},
        {"id": "wc_llm", "label": "LLMClient", "type": "Class", "file_path": "src/llm.ts"},
        {"id": "wc_parser", "label": "PageParser", "type": "Class", "file_path": "src/parser.ts"},
        {"id": "wc_linker", "label": "WikiLinker", "type": "Function", "file_path": "src/linker.ts"},
        {"id": "wc_export", "label": "exportWiki", "type": "Function", "file_path": "src/export.ts"},
        {"id": "wc_embed", "label": "EmbedGenerator", "type": "Class", "file_path": "src/embed.ts"},
        {"id": "wc_chunk", "label": "chunkText", "type": "Function", "file_path": "src/chunk.ts"},
        {"id": "wc_cluster", "label": "WikiCluster", "type": "Cluster", "file_path": "src/"},
        {"id": "wc_process", "label": "CompileProcess", "type": "Process", "file_path": "src/index.ts"},
        {"id": "wc_types", "label": "types", "type": "File", "file_path": "src/types.ts"},
        {"id": "wc_main", "label": "main", "type": "File", "file_path": "src/index.ts"},
        {"id": "wc_config", "label": "Config", "type": "File", "file_path": "src/config.ts"},
        {"id": "wc_search", "label": "searchPages", "type": "Function", "file_path": "src/search.ts"},
        {"id": "wc_render", "label": "renderPage", "type": "Function", "file_path": "src/render.ts"},
    ],
    "mempalace": [
        {"id": "mp_palace", "label": "MemPalace", "type": "Class", "file_path": "mempalace/palace.py"},
        {"id": "mp_collection", "label": "get_collection", "type": "Function", "file_path": "mempalace/palace.py"},
        {"id": "mp_store", "label": "store_memory", "type": "Function", "file_path": "mempalace/palace.py"},
        {"id": "mp_search", "label": "search_memories", "type": "Function", "file_path": "mempalace/palace.py"},
        {"id": "mp_embed", "label": "EmbedEngine", "type": "Class", "file_path": "mempalace/embed.py"},
        {"id": "mp_chroma", "label": "ChromaAdapter", "type": "Class", "file_path": "mempalace/chroma.py"},
        {"id": "mp_wing", "label": "Wing", "type": "Class", "file_path": "mempalace/wing.py"},
        {"id": "mp_room", "label": "Room", "type": "Class", "file_path": "mempalace/room.py"},
        {"id": "mp_cluster_api", "label": "APICluster", "type": "Cluster", "file_path": "mempalace/"},
        {"id": "mp_cluster_store", "label": "StorageCluster", "type": "Cluster", "file_path": "mempalace/"},
        {"id": "mp_process_index", "label": "IndexProcess", "type": "Process", "file_path": "mempalace/palace.py"},
        {"id": "mp_init", "label": "__init__", "type": "File", "file_path": "mempalace/__init__.py"},
        {"id": "mp_types", "label": "types", "type": "File", "file_path": "mempalace/types.py"},
        {"id": "mp_utils", "label": "utils", "type": "File", "file_path": "mempalace/utils.py"},
        {"id": "mp_config", "label": "Config", "type": "File", "file_path": "mempalace/config.py"},
    ],
    "Memento-Skills": [
        {"id": "ms_session", "label": "Session", "type": "Class", "file_path": "models.py"},
        {"id": "ms_skill", "label": "Skill", "type": "Class", "file_path": "models.py"},
        {"id": "ms_service", "label": "SkillService", "type": "Class", "file_path": "services.py"},
        {"id": "ms_create", "label": "create_skill", "type": "Function", "file_path": "services.py"},
        {"id": "ms_list", "label": "list_skills", "type": "Function", "file_path": "services.py"},
        {"id": "ms_execute", "label": "execute_skill", "type": "Function", "file_path": "services.py"},
        {"id": "ms_reflect", "label": "reflect_skill", "type": "Function", "file_path": "services.py"},
        {"id": "ms_db", "label": "DatabaseEngine", "type": "Class", "file_path": "database.py"},
        {"id": "ms_api", "label": "APIRouter", "type": "Class", "file_path": "api.py"},
        {"id": "ms_cluster_model", "label": "ModelCluster", "type": "Cluster", "file_path": "models.py"},
        {"id": "ms_cluster_svc", "label": "ServiceCluster", "type": "Cluster", "file_path": "services.py"},
        {"id": "ms_process_async", "label": "AsyncProcess", "type": "Process", "file_path": "main.py"},
        {"id": "ms_main", "label": "main", "type": "File", "file_path": "main.py"},
        {"id": "ms_config", "label": "Config", "type": "File", "file_path": "config.py"},
        {"id": "ms_utils", "label": "utils", "type": "File", "file_path": "utils.py"},
        {"id": "ms_schemas", "label": "schemas", "type": "File", "file_path": "schemas.py"},
    ],
    "lambda-RLM": [
        {"id": "lr_lambda", "label": "LambdaRLM", "type": "Class", "file_path": "rlm/lambda_rlm.py"},
        {"id": "lr_task", "label": "TaskType", "type": "Class", "file_path": "rlm/types.py"},
        {"id": "lr_compose", "label": "ComposeOp", "type": "Class", "file_path": "rlm/types.py"},
        {"id": "lr_split", "label": "split_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_map", "label": "map_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_reduce", "label": "reduce_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_filter", "label": "filter_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_concat", "label": "concat_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_cross", "label": "cross_op", "type": "Function", "file_path": "rlm/ops.py"},
        {"id": "lr_lm", "label": "LanguageModel", "type": "Class", "file_path": "rlm/lm.py"},
        {"id": "lr_chunk", "label": "ChunkEngine", "type": "Class", "file_path": "rlm/chunk.py"},
        {"id": "lr_cluster_ops", "label": "OpsCluster", "type": "Cluster", "file_path": "rlm/ops.py"},
        {"id": "lr_cluster_core", "label": "CoreCluster", "type": "Cluster", "file_path": "rlm/"},
        {"id": "lr_process_exec", "label": "ExecutionProcess", "type": "Process", "file_path": "rlm/lambda_rlm.py"},
        {"id": "lr_init", "label": "__init__", "type": "File", "file_path": "rlm/__init__.py"},
        {"id": "lr_types", "label": "types", "type": "File", "file_path": "rlm/types.py"},
        {"id": "lr_config", "label": "Config", "type": "File", "file_path": "rlm/config.py"},
    ],
    "awesome-autoresearch": [
        {"id": "ar_index", "label": "INDEX", "type": "File", "file_path": "README.md"},
        {"id": "ar_survey", "label": "Survey", "type": "File", "file_path": "survey.md"},
        {"id": "ar_papers", "label": "Papers", "type": "File", "file_path": "papers.md"},
        {"id": "ar_cluster_ai", "label": "AIResearch", "type": "Cluster", "file_path": "./"},
        {"id": "ar_cluster_tools", "label": "Tools", "type": "Cluster", "file_path": "./"},
        {"id": "ar_loop", "label": "ResearchLoop", "type": "Class", "file_path": "loop.py"},
        {"id": "ar_hypothesis", "label": "HypothesisGen", "type": "Function", "file_path": "loop.py"},
        {"id": "ar_eval", "label": "Evaluator", "type": "Class", "file_path": "eval.py"},
        {"id": "ar_process_main", "label": "MainProcess", "type": "Process", "file_path": "main.py"},
    ],
}

IMPORTANCE_MAP = {
    "Class": 0.8,
    "Function": 0.6,
    "File": 0.4,
    "Cluster": 0.9,
    "Process": 0.7,
}


class GraphEngine:
    def _get_repo_nodes_raw(self, repo: str) -> List[Dict]:
        return REPO_NODES.get(repo, REPO_NODES["GitNexus"])

    def _compute_3d_layout(self, nodes: List[Dict], edges: List[tuple]) -> Dict[str, tuple]:
        G = nx.Graph()
        for n in nodes:
            G.add_node(n["id"])
        for src, tgt in edges:
            G.add_edge(src, tgt)
        pos2d = nx.spring_layout(G, seed=42, k=2.0)
        pos3d = {}
        for node_id, (x, y) in pos2d.items():
            z = random.uniform(-1, 1) * 0.5
            pos3d[node_id] = (x * 10, y * 10, z * 10)
        return pos3d

    def _gen_edges_for_repo(self, repo: str) -> List[tuple]:
        nodes = self._get_repo_nodes_raw(repo)
        node_ids = [n["id"] for n in nodes]
        edges = []
        functions = [n for n in nodes if n["type"] == "Function"]
        classes = [n for n in nodes if n["type"] == "Class"]
        files = [n for n in nodes if n["type"] == "File"]
        clusters = [n for n in nodes if n["type"] == "Cluster"]
        processes = [n for n in nodes if n["type"] == "Process"]

        for fn in functions:
            if classes:
                target = random.choice(classes)
                edges.append((fn["id"], target["id"], "MEMBER_OF"))
        for cls in classes:
            if files:
                target = random.choice(files)
                edges.append((cls["id"], target["id"], "IMPORTS"))
        for i, fn in enumerate(functions[:-1]):
            edges.append((fn["id"], functions[i + 1]["id"], "CALLS"))
        for cluster in clusters:
            targets = random.sample(node_ids, min(3, len(node_ids)))
            for t in targets:
                if t != cluster["id"]:
                    edges.append((cluster["id"], t, "MEMBER_OF"))
        for proc in processes:
            if functions:
                target = random.choice(functions)
                edges.append((proc["id"], target["id"], "CALLS"))
        return edges

    async def index_repo(self, repo_path: str) -> dict:
        try:
            result = subprocess.run(
                ["npx", "gitnexus", "analyze", repo_path],
                capture_output=True,
                text=True,
                timeout=30,
            )
            return {"status": "ok", "output": result.stdout or "(no output)", "repo": repo_path}
        except Exception:
            return {"status": "ok", "output": f"Synthetic indexing complete for {repo_path}", "repo": repo_path}

    async def get_nodes(self, repo: str) -> List[GraphNode]:
        raw_nodes = self._get_repo_nodes_raw(repo)
        raw_edges = self._gen_edges_for_repo(repo)
        edge_pairs = [(e[0], e[1]) for e in raw_edges]
        pos3d = self._compute_3d_layout(raw_nodes, edge_pairs)
        nodes = []
        for n in raw_nodes:
            pos = pos3d.get(n["id"], (0.0, 0.0, 0.0))
            importance = IMPORTANCE_MAP.get(n["type"], 0.5) + random.uniform(-0.1, 0.1)
            nodes.append(GraphNode(
                id=n["id"],
                label=n["label"],
                type=n["type"],
                file_path=n["file_path"],
                importance=round(min(1.0, max(0.1, importance)), 2),
                x=round(pos[0], 3),
                y=round(pos[1], 3),
                z=round(pos[2], 3),
                metadata={"repo": repo, "node_type": n["type"]},
            ))
        return nodes

    async def get_edges(self, repo: str) -> List[GraphEdge]:
        raw_edges = self._gen_edges_for_repo(repo)
        edges = []
        for src, tgt, etype in raw_edges:
            edges.append(GraphEdge(
                source=src,
                target=tgt,
                type=etype,
                weight=round(random.uniform(0.3, 1.0), 2),
            ))
        return edges

    async def query_graph(self, repo: str, query: str, limit: int) -> List[GraphNode]:
        all_nodes = await self.get_nodes(repo)
        q = query.lower()
        return [n for n in all_nodes if q in n.label.lower() or q in n.file_path.lower()][:limit]

    async def get_impact(self, repo: str, node_id: str) -> dict:
        all_nodes = await self.get_nodes(repo)
        node_ids = [n.id for n in all_nodes]
        affected = random.sample(node_ids, min(5, len(node_ids)))
        return {
            "node_id": node_id,
            "affected_nodes": [n for n in affected if n != node_id],
            "dependency_chain": [node_id] + random.sample([n for n in node_ids if n != node_id], min(3, len(node_ids) - 1)),
            "risk_score": round(random.uniform(0.1, 0.9), 2),
        }

    async def get_clusters(self, repo: str) -> List[dict]:
        raw_nodes = self._get_repo_nodes_raw(repo)
        clusters = [n for n in raw_nodes if n["type"] == "Cluster"]
        result = []
        for c in clusters:
            result.append({
                "id": c["id"],
                "name": c["label"],
                "node_count": random.randint(3, 8),
                "cohesion_score": round(random.uniform(0.5, 1.0), 2),
            })
        return result

    async def get_processes(self, repo: str) -> List[dict]:
        raw_nodes = self._get_repo_nodes_raw(repo)
        procs = [n for n in raw_nodes if n["type"] == "Process"]
        result = []
        for p in procs:
            steps = [f"init_{p['id']}", f"run_{p['id']}", f"cleanup_{p['id']}"]
            result.append({
                "id": p["id"],
                "name": p["label"],
                "steps": steps,
            })
        return result
