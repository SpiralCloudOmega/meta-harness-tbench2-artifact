export type NodeType = "Function" | "Class" | "File" | "Cluster" | "Process";
export type EdgeType = "CALLS" | "IMPORTS" | "MEMBER_OF";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  file_path: string;
  importance: number;
  x: number;
  y: number;
  z: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MemoryItem {
  id: string;
  wing: string;
  room: string;
  content: string;
  metadata: Record<string, unknown>;
  score?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; required: boolean }[];
  utility_score: number;
  usage_count: number;
  category: string;
}

export interface WikiPage {
  id: string;
  title: string;
  preview?: string;
  content?: string;
  wikilinks?: string[];
  created_at?: string;
}

export interface ReasoningResult {
  task_type: string;
  operators_used: string[];
  chunks: string[];
  result: string;
  tree: ReasoningTree;
}

export interface ReasoningTree {
  op: string;
  content: string;
  children: ReasoningTree[];
}

export interface AutoresearchRun {
  id: string;
  goal: string;
  status: "running" | "completed" | "failed";
  experiments: Experiment[];
  start_time: string;
  end_time?: string;
  max_iterations: number;
  current_iteration: number;
}

export interface Experiment {
  id: string;
  hypothesis: string;
  result: string;
  score: number;
  iteration: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
