import { useStore } from '../../store'

const REPOS = ['GitNexus', 'llm-wiki-compiler', 'mempalace', 'Memento-Skills', 'lambda-RLM', 'awesome-autoresearch']

export function Header() {
  const { selectedRepo, setSelectedRepo } = useStore()
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between z-10 shrink-0">
      <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
        Super 3D Node Graph Recursive GitNexus
      </h1>
      <div className="flex items-center gap-4">
        <select
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-slate-100"
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
        >
          {REPOS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Connected</span>
        </div>
      </div>
    </header>
  )
}
