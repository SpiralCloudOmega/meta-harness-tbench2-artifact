import subprocess
import json
import os
from typing import Dict, Any
from .graph_types import NodeType, EdgeType


class GitNexusIndexer:
    def __init__(self, gitnexus_bin: str = "npx gitnexus"):
        self.gitnexus_bin = gitnexus_bin

    def analyze(self, repo_path: str, timeout: int = 60) -> Dict[str, Any]:
        try:
            cmd = self.gitnexus_bin.split() + ["analyze", repo_path]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=repo_path if os.path.isdir(repo_path) else None,
            )
            return {"status": "ok", "stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
        except subprocess.TimeoutExpired:
            return {"status": "error", "error": "Timeout", "stdout": "", "stderr": ""}
        except FileNotFoundError:
            return {"status": "error", "error": "gitnexus not installed", "stdout": "", "stderr": ""}
        except Exception as e:
            return {"status": "error", "error": str(e), "stdout": "", "stderr": ""}

    def serve(self, repo_path: str, port: int = 3000) -> subprocess.Popen:
        cmd = self.gitnexus_bin.split() + ["serve", repo_path, "--port", str(port)]
        return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def parse_output(self, raw: str) -> Dict[str, Any]:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"raw": raw}
