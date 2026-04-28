import { useStore } from '../../store'

const NAV_ITEMS = [
  { id: 'graph', label: 'Graph', icon: '⬡' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'memory', label: 'Memory', icon: '🧠' },
  { id: 'wiki', label: 'Wiki', icon: '📖' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'reasoning', label: 'Reason', icon: '🔬' },
]

export function Sidebar() {
  const { activePanel, setActivePanel } = useStore()
  return (
    <aside className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-2 shrink-0">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePanel(item.id)}
          title={item.label}
          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs gap-0.5 transition-colors ${
            activePanel === item.id
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[9px]">{item.label}</span>
        </button>
      ))}
    </aside>
  )
}
