import { useState } from 'react'
import { useGraph } from '../../hooks/useGraph'

export function GraphControls() {
  const [search, setSearch] = useState('')
  const { refetch, loading } = useGraph()

  return (
    <div className="absolute top-4 left-4 flex gap-2 z-10">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search nodes..."
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 w-48 focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={refetch}
        disabled={loading}
        className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : '↺ Refresh'}
      </button>
    </div>
  )
}
