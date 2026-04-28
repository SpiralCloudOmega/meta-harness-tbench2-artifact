import { useState } from 'react'
import { wikiApi } from '../../api/client'
import type { WikiPage } from '../../types'

export function WikiPanel() {
  const [pages, setPages] = useState<WikiPage[]>([])
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'browse' | 'ingest'>('browse')
  const [status, setStatus] = useState('')

  const loadPages = async () => {
    setLoading(true)
    try {
      const data = await wikiApi.listPages()
      setPages(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!query) { loadPages(); return }
    setLoading(true)
    try {
      const data = await wikiApi.query(query)
      setPages(data)
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    if (!content) return
    setLoading(true)
    try {
      await wikiApi.ingest(content, title)
      setStatus('Ingested successfully!')
      setContent('')
      setTitle('')
      setTab('browse')
      loadPages()
    } finally {
      setLoading(false)
    }
  }

  const handleCompile = async () => {
    setLoading(true)
    try {
      const res = await wikiApi.compile()
      setStatus(`Compiled ${res.page_count} pages with ${res.wikilinks} wiki-links`)
      loadPages()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-bold text-slate-100">📖 Wiki</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setTab('browse'); loadPages() }}
            className={`px-3 py-1 rounded text-sm ${tab === 'browse' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('ingest')}
            className={`px-3 py-1 rounded text-sm ${tab === 'ingest' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Ingest
          </button>
          <button
            onClick={handleCompile}
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
          >
            Compile
          </button>
        </div>
        {status && <span className="text-xs text-green-400">{status}</span>}
      </div>

      {tab === 'browse' ? (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search wiki..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              Search
            </button>
            <button
              onClick={loadPages}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            >
              All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {pages.length === 0 && !loading && (
              <div className="text-slate-500 text-sm text-center py-8">
                No pages yet. Click "All" to load or "Ingest" to add content.
              </div>
            )}
            {pages.map((p) => (
              <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-slate-100 mb-1">{p.title}</h3>
                {p.preview && <p className="text-xs text-slate-400 line-clamp-2">{p.preview}</p>}
                {p.wikilinks && p.wikilinks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.wikilinks.map((l, i) => (
                      <span key={i} className="text-xs bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded">[[{l}]]</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3 max-w-lg">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Page content or URL..."
              rows={8}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleIngest}
            disabled={!content || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Ingesting...' : 'Ingest Page'}
          </button>
        </div>
      )}
    </div>
  )
}
