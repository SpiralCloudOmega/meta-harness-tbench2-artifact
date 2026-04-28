import asyncio
import uuid
from datetime import datetime
from typing import Dict, List

RUNS: Dict[str, dict] = {}

STRATEGIES = [
    "iterative refinement",
    "recursive decomposition",
    "chain-of-thought",
    "self-reflection",
    "multi-agent debate",
]


def _propose(goal: str, iteration: int, prev_score: float) -> str:
    strat = STRATEGIES[iteration % len(STRATEGIES)]
    if iteration == 0:
        return f"Hypothesis 1: Apply {strat} directly to '{goal[:40]}'"
    elif prev_score < 0.6:
        return f"Hypothesis {iteration+1}: Mutate — switch to {strat} after low score ({prev_score:.2f})"
    else:
        return f"Hypothesis {iteration+1}: Extend — deepen {strat} given good score ({prev_score:.2f})"


def _execute(hypothesis: str, goal: str) -> str:
    words = goal.split()
    return (
        f"Executed: decomposed into {max(1, len(words)//3)} sub-tasks. "
        f"Applied '{hypothesis[:60]}'. "
        f"Gathered {len(words)*2} evidence tokens."
    )


def _score(result: str, iteration: int) -> float:
    # Deterministic-ish score based on iteration and result length
    base = 0.45 + (len(result) % 20) * 0.01
    improvement = min(0.4, iteration * 0.07)
    return round(min(0.97, base + improvement), 2)


def _mutate(hypothesis: str, score: float, iteration: int) -> str:
    if score >= 0.75:
        return f"[mutate: amplify] {hypothesis}"
    next_strat = STRATEGIES[(iteration + 2) % len(STRATEGIES)]
    return f"[mutate: pivot→{next_strat}] {hypothesis}"


class AutoresearchLoop:
    async def start_run(self, goal: str, max_iterations: int = 5) -> dict:
        run_id = str(uuid.uuid4())
        run = {
            "id": run_id,
            "goal": goal,
            "status": "running",
            "experiments": [],
            "graph_nodes": [],  # for 3D visualization
            "start_time": datetime.utcnow().isoformat(),
            "max_iterations": max_iterations,
            "current_iteration": 0,
        }
        RUNS[run_id] = run
        asyncio.create_task(self._run_loop(run_id))
        return run

    async def _run_loop(self, run_id: str):
        run = RUNS.get(run_id)
        if not run:
            return
        goal = run["goal"]
        max_iter = run["max_iterations"]
        prev_score = 0.5
        current_hypothesis = ""

        for i in range(max_iter):
            await asyncio.sleep(1)

            # propose → execute → score → mutate
            hypothesis = _propose(goal, i, prev_score)
            result_text = _execute(hypothesis, goal)
            score = _score(result_text, i)
            mutated = _mutate(hypothesis, score, i)

            exp = {
                "id": str(uuid.uuid4()),
                "iteration": i + 1,
                "hypothesis": hypothesis,
                "result": result_text,
                "score": score,
                "mutated_hypothesis": mutated,
                "strategy": STRATEGIES[i % len(STRATEGIES)],
            }
            # Graph node for 3D autoresearch visualization
            graph_node = {
                "id": exp["id"],
                "label": f"Iter {i+1}: {STRATEGIES[i % len(STRATEGIES)]}",
                "type": "Process",
                "score": score,
                "iteration": i + 1,
                "x": i * 4.0,
                "y": score * 6.0,
                "z": float(i % 2) * 2.0,
            }
            RUNS[run_id]["experiments"].append(exp)
            RUNS[run_id]["graph_nodes"].append(graph_node)
            RUNS[run_id]["current_iteration"] = i + 1
            prev_score = score
            current_hypothesis = mutated

        RUNS[run_id]["status"] = "completed"
        RUNS[run_id]["end_time"] = datetime.utcnow().isoformat()
        RUNS[run_id]["final_hypothesis"] = current_hypothesis

    async def get_status(self, run_id: str) -> dict:
        if run_id not in RUNS:
            raise KeyError(f"Run {run_id} not found")
        return RUNS[run_id]

    async def get_experiments(self, run_id: str) -> List[dict]:
        if run_id not in RUNS:
            raise KeyError(f"Run {run_id} not found")
        return RUNS[run_id]["experiments"]
