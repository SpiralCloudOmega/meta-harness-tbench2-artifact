import axios from 'axios';
import type { GraphNode, GraphEdge, MemoryItem, Skill, WikiPage, ReasoningResult, AutoresearchRun, Experiment } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const graphApi = {
  getNodes: (repo: string) => api.get<GraphNode[]>(`/graph/${repo}/nodes`).then(r => r.data),
  getEdges: (repo: string) => api.get<GraphEdge[]>(`/graph/${repo}/edges`).then(r => r.data),
  indexRepo: (repoPath: string) => api.post('/graph/index', { repo_path: repoPath }).then(r => r.data),
  queryGraph: (repo: string, query: string, limit = 10) =>
    api.post<GraphNode[]>(`/graph/${repo}/query`, { query, limit }).then(r => r.data),
  getClusters: (repo: string) => api.get(`/graph/${repo}/clusters`).then(r => r.data),
  getImpact: (repo: string, nodeId: string) =>
    api.post(`/graph/${repo}/impact`, { node_id: nodeId }).then(r => r.data),
};

export const memoryApi = {
  store: (wing: string, room: string, content: string, metadata: Record<string, unknown> = {}) =>
    api.post('/memory/store', { wing, room, content, metadata }).then(r => r.data),
  search: (query: string, limit = 10, wing = '') =>
    api.get<MemoryItem[]>('/memory/search', { params: { q: query, limit, wing } }).then(r => r.data),
  listSessions: () => api.get('/memory/sessions').then(r => r.data),
};

export const reasoningApi = {
  analyze: (text: string, taskType = 'general', query = '') =>
    api.post<ReasoningResult>('/reasoning/analyze', { text, task_type: taskType, query }).then(r => r.data),
  listOperators: () => api.get('/reasoning/operators').then(r => r.data),
};

export const skillsApi = {
  list: () => api.get<Skill[]>('/skills/').then(r => r.data),
  execute: (skillId: string, params: Record<string, unknown>) =>
    api.post('/skills/execute', { skill_id: skillId, params }).then(r => r.data),
  reflect: (skillId: string, outcome: string) =>
    api.post('/skills/reflect', { skill_id: skillId, outcome }).then(r => r.data),
};

export const wikiApi = {
  ingest: (urlOrContent: string, title = '') =>
    api.post('/wiki/ingest', { url_or_content: urlOrContent, title }).then(r => r.data),
  compile: () => api.post('/wiki/compile').then(r => r.data),
  listPages: () => api.get<WikiPage[]>('/wiki/pages').then(r => r.data),
  query: (query: string) => api.post<WikiPage[]>('/wiki/query', { query }).then(r => r.data),
};

export const autoresearchApi = {
  start: (goal: string, maxIterations = 5) =>
    api.post<AutoresearchRun>('/autoresearch/start', { goal, max_iterations: maxIterations }).then(r => r.data),
  getStatus: (runId: string) => api.get<AutoresearchRun>(`/autoresearch/${runId}/status`).then(r => r.data),
  getExperiments: (runId: string) => api.get<Experiment[]>(`/autoresearch/${runId}/experiments`).then(r => r.data),
};
