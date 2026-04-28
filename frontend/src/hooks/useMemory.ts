import { useState, useCallback } from 'react';
import { memoryApi } from '../api/client';
import { useStore } from '../store';

export function useMemory() {
  const { memories, setMemories } = useStore();
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string, wing = '') => {
    setLoading(true);
    try {
      const results = await memoryApi.search(query, 10, wing);
      setMemories(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setMemories]);

  const store = useCallback(async (wing: string, room: string, content: string) => {
    setLoading(true);
    try {
      await memoryApi.store(wing, room, content);
      await search('', wing);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  return { memories, loading, search, store };
}
