import { create } from 'zustand';
import type { GraphNode, GraphData, MemoryItem, Skill, WikiPage, ChatMessage } from '../types';

interface AppState {
  selectedRepo: string;
  selectedNode: GraphNode | null;
  graphData: GraphData | null;
  activePanel: string;
  chatMessages: ChatMessage[];
  memories: MemoryItem[];
  skills: Skill[];
  wikiPages: WikiPage[];
  searchFilter: string;
  setSelectedRepo: (repo: string) => void;
  setSelectedNode: (node: GraphNode | null) => void;
  setGraphData: (data: GraphData | null) => void;
  setActivePanel: (panel: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setMemories: (memories: MemoryItem[]) => void;
  setSkills: (skills: Skill[]) => void;
  setWikiPages: (pages: WikiPage[]) => void;
  setSearchFilter: (filter: string) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedRepo: 'GitNexus',
  selectedNode: null,
  graphData: null,
  activePanel: 'graph',
  chatMessages: [],
  memories: [],
  skills: [],
  wikiPages: [],
  searchFilter: '',
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setGraphData: (data) => set({ graphData: data }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setMemories: (memories) => set({ memories }),
  setSkills: (skills) => set({ skills }),
  setWikiPages: (pages) => set({ wikiPages: pages }),
  setSearchFilter: (filter) => set({ searchFilter: filter }),
}));
