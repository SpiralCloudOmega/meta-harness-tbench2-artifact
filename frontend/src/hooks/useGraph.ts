import { useState, useEffect, useCallback } from 'react';
import { graphApi } from '../api/client';
import { useStore } from '../store';
import type { GraphNode } from '../types';

export function useGraph() {
  const { selectedRepo, setGraphData, graphData } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = useCallback(async (repo: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nodes, edges] = await Promise.all([
        graphApi.getNodes(repo),
        graphApi.getEdges(repo),
      ]);
      setGraphData({ nodes, edges });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  }, [setGraphData]);

  useEffect(() => {
    fetchGraph(selectedRepo);
  }, [selectedRepo, fetchGraph]);

  const refetch = () => fetchGraph(selectedRepo);

  const searchNodes = useCallback(async (query: string): Promise<GraphNode[]> => {
    try {
      return await graphApi.queryGraph(selectedRepo, query);
    } catch {
      return [];
    }
  }, [selectedRepo]);

  return { graphData, loading, error, refetch, searchNodes };
}
