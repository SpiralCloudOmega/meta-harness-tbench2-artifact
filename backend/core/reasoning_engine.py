import os
import sys
from typing import List, Dict, Any

LAMBDA_RLM_PATH = "/home/runner/work/meta-harness-tbench2-artifact/meta-harness-tbench2-artifact/repos/lambda-RLM"

# Try to load real lambda-RLM types for operator metadata
_rlm_available = False
try:
    sys.path.insert(0, LAMBDA_RLM_PATH)
    from rlm.core.types import ClientBackend, EnvironmentType  # noqa: F401
    _rlm_available = True
except Exception:
    pass


def _op_split(text: str) -> List[str]:
    """Divide input into sentence-level chunks."""
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s for s in sentences if s] or [text]


def _op_map(chunks: List[str], task: str) -> List[str]:
    """Apply transformation label to each chunk."""
    return [f"[{task}] {c[:120]}" for c in chunks]


def _op_filter(chunks: List[str], keyword: str = "") -> List[str]:
    """Keep only chunks containing keyword (or all if no keyword)."""
    if not keyword:
        return chunks
    kw = keyword.lower()
    return [c for c in chunks if kw in c.lower()] or chunks[:1]


def _op_reduce(chunks: List[str]) -> str:
    """Combine processed chunks into a single result."""
    return " | ".join(chunks[:5])


def _op_concat(a: List[str], b: List[str]) -> List[str]:
    """Concatenate two chunk streams sequentially."""
    return a + b


def _op_cross(a: List[str], b: List[str]) -> List[str]:
    """Cross-product: pair each element of a with each element of b."""
    return [f"{x} ↔ {y}" for x in a[:3] for y in b[:3]]


class ReasoningEngine:
    OPERATORS = ["SPLIT", "MAP", "FILTER", "REDUCE", "CONCAT", "CROSS"]

    def _build_tree(self, text: str, task_type: str, depth: int = 0) -> dict:
        if depth >= 2 or len(text) < 50:
            return {"op": "LEAF", "content": text[:80] + ("..." if len(text) > 80 else ""), "children": []}
        chunks = _op_split(text)[:2]
        return {
            "op": "SPLIT",
            "content": f"Split into {len(chunks)} chunks",
            "children": [
                {
                    "op": "MAP",
                    "content": f"[{task_type}] {c[:60]}",
                    "children": [self._build_tree(c, task_type, depth + 1)],
                }
                for c in chunks
            ],
        }

    async def analyze(self, text: str, task_type: str = "general", query: str = "") -> dict:
        task_map = {
            "summarization": "SUMMARIZATION",
            "qa": "QA",
            "translation": "TRANSLATION",
            "classification": "CLASSIFICATION",
            "extraction": "EXTRACTION",
            "analysis": "ANALYSIS",
            "general": "GENERAL",
        }
        resolved_task = task_map.get(task_type.lower(), "GENERAL")

        # Execute real SPLIT → MAP → FILTER → REDUCE pipeline
        chunks = _op_split(text)
        mapped = _op_map(chunks, resolved_task)
        filtered = _op_filter(mapped, query)
        result_str = _op_reduce(filtered)

        operators_used = ["SPLIT", "MAP", "FILTER", "REDUCE"]
        tree = self._build_tree(text, resolved_task)

        result_prefix = {
            "SUMMARIZATION": f"Summary ({len(chunks)} chunks): ",
            "QA": f"Answer to '{query or 'query'}': ",
            "CLASSIFICATION": "Classification: ",
            "EXTRACTION": "Extracted: ",
            "ANALYSIS": f"Analysis ({len(chunks)} chunks): ",
            "TRANSLATION": "Translation: ",
            "GENERAL": "Result: ",
        }.get(resolved_task, "")

        return {
            "task_type": resolved_task,
            "operators_used": operators_used,
            "rlm_available": _rlm_available,
            "chunks": chunks[:5],
            "result": result_prefix + result_str,
            "tree": tree,
        }

    async def list_operators(self) -> List[dict]:
        return [
            {"name": "SPLIT", "description": "Divide input into sentence-level chunks for parallel processing", "cost": 0.1},
            {"name": "MAP", "description": "Apply task transformation to each chunk independently", "cost": 0.2},
            {"name": "FILTER", "description": "Remove chunks not matching a keyword criterion", "cost": 0.1},
            {"name": "REDUCE", "description": "Combine processed chunks into a single result string", "cost": 0.3},
            {"name": "CONCAT", "description": "Concatenate two chunk streams sequentially", "cost": 0.1},
            {"name": "CROSS", "description": "Cross-product of two input streams (pair-wise combinations)", "cost": 0.5},
        ]
