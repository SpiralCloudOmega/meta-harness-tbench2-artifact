import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { useStore } from '../../store'

export function ChatPanel() {
  const { messages, sendMessage, loading } = useChat()
  const { selectedNode } = useStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {selectedNode && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 text-xs text-slate-400">
          Context: <span className="text-blue-400">{selectedNode.label}</span>{' '}
          <span className="text-slate-500">({selectedNode.type})</span>
        </div>
      )}
      <MessageList messages={messages} />
      <div className="border-t border-slate-700 p-4 flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the codebase..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
