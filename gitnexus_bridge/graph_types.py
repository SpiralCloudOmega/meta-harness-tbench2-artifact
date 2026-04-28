from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Any


class NodeType(Enum):
    FUNCTION = "Function"
    CLASS = "Class"
    FILE = "File"
    CLUSTER = "Cluster"
    PROCESS = "Process"


class EdgeType(Enum):
    CALLS = "CALLS"
    IMPORTS = "IMPORTS"
    MEMBER_OF = "MEMBER_OF"


@dataclass
class GraphNode:
    id: str
    label: str
    type: NodeType
    file_path: str
    importance: float = 0.5
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphEdge:
    source: str
    target: str
    type: EdgeType
    weight: float = 1.0
