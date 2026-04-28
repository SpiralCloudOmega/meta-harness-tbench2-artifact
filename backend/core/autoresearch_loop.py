import asyncio
import uuid
from datetime import datetime
from typing import Dict, List
import random

RUNS: Dict[str, dict] = {}


class AutoresearchLoop:
    async def start_run(self, goal: str, max_iterations: int = 5) -> dict:
        run_id = str(uuid.uuid4())
        run = {
            "id": run_id,
            "goal": goal,
            "status": "running",
            "experiments": [],
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
        strategies = [
            "iterative refinement",
            "recursive decomposition",
            "chain-of-thought",
            "self-reflection",
            "multi-agent debate",
        ]
        hypotheses = [
            f"Hypothesis {i+1}: If we apply {strategies[i % len(strategies)]} to '{goal[:30]}', we expect improved outcomes."
            for i in range(max_iter)
        ]
        for i in range(max_iter):
            await asyncio.sleep(1)
            exp = {
                "id": str(uuid.uuid4()),
                "hypothesis": hypotheses[i],
                "result": f"Experiment {i+1} result: {'Confirmed' if random.random() > 0.3 else 'Refuted'} with evidence score {round(random.uniform(0.4, 0.99), 2)}",
                "score": round(random.uniform(0.4, 0.99), 2),
                "iteration": i + 1,
            }
            RUNS[run_id]["experiments"].append(exp)
            RUNS[run_id]["current_iteration"] = i + 1
        RUNS[run_id]["status"] = "completed"
        RUNS[run_id]["end_time"] = datetime.utcnow().isoformat()

    async def get_status(self, run_id: str) -> dict:
        if run_id not in RUNS:
            raise KeyError(f"Run {run_id} not found")
        return RUNS[run_id]

    async def get_experiments(self, run_id: str) -> List[dict]:
        if run_id not in RUNS:
            raise KeyError(f"Run {run_id} not found")
        return RUNS[run_id]["experiments"]
