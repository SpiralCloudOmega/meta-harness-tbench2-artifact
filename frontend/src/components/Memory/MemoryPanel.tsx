import { useState, useEffect } from 'react'
import { useMemory } from '../../hooks/useMemory'

export function MemoryPanel() {
  const { memories, loading, search, store } = useMemory()
  const [query, setQuery] = useState('')
  const [wing, setWing] = useState('')
  const [room, setRoom] = useState('')
  const [content, setContent] = useState('')
  const [tab, setTab] = useState<'search' | 'store'>('search')

  useEffect(() => {
    search('')
  }, [])

  const handleSearch = () => search(query, wing)
  const handleStore = async () => {
    if (!wing || !room || !content) return
    await store(wing, room, content)
    setContent('')
    setTab('search')
    setQuery('')
    search('', wing)
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-bold text-slate-100">🧠 Memory Palace</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('search')}
            className={`px-3 py-1 rounded text-sm ${tab === 'search' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Search
          </button>
          <button
            onClick={() => setTab('store')}
            className={`px-3 py-1 rounded text-sm ${tab === 'store' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Store
          </button>
        </div>
      </div>

      {tab === 'search' ? (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search memories..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              placeholder="Wing (optional)"
              className="w-32 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {memories.length === 0 && !loading && (
              <div className="text-slate-500 text-sm text-center py-8">No memories found</div>
            )}
            {memories.map((m) => (
              <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">{m.wing}</span>
                  <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">{m.room}</span>
                  {m.score != null && (
                    <span className="text-xs text-green-400 ml-auto">{(m.score * 100).toFixed(0)}%</span>
                  )}
                </div>
                <p className="text-sm text-slate-200">{m.content}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3 max-w-lg">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Wing</label>
            <input
              type="text"
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              placeholder="e.g. research, code, notes"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Room</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. snippets, ideas"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Memory content..."
              rows={5}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleStore}
            disabled={!wing || !room || !content || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Storing...' : 'Store Memory'}
          </button>
        </div>
      )}
    </div>
  )
}
