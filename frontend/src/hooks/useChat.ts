import { useState, useCallback } from 'react';
import { reasoningApi } from '../api/client';
import { useStore } from '../store';
import type { ChatMessage } from '../types';

export function useChat() {
  const { chatMessages, addChatMessage, selectedNode } = useStore();
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setLoading(true);
    try {
      const context = selectedNode
        ? `Context: analyzing node "${selectedNode.label}" (${selectedNode.type}) in ${selectedNode.file_path}.\n\n`
        : '';
      const result = await reasoningApi.analyze(context + content, 'general', content);
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: `**${result.task_type}** analysis complete.\n\n${result.result}\n\n*Operators used: ${result.operators_used.join(', ')}*`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMsg);
    } catch {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errMsg);
    } finally {
      setLoading(false);
    }
  }, [addChatMessage, selectedNode]);

  return { messages: chatMessages, sendMessage, loading };
}
