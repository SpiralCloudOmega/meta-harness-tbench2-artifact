import { useStore } from '../../store'

const TYPE_COLORS: Record<string, string> = {
  Function: 'text-blue-400',
  Class: 'text-green-400',
  File: 'text-slate-400',
  Cluster: 'text-purple-400',
  Process: 'text-orange-400',
}

export function NodePanel() {
  const { selectedNode, setSelectedNode } = useStore()

  if (!selectedNode) return null

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-4 z-10">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-bold ${TYPE_COLORS[selectedNode.type] || 'text-slate-300'}`}>
          {selectedNode.type}
        </span>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-slate-400 hover:text-slate-100 text-lg leading-none"
        >
          ×
        </button>
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{selectedNode.label}</h3>
      <p className="text-xs text-slate-400 mb-3 font-mono">{selectedNode.file_path}</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Importance</span>
          <span className="text-slate-200">{(selectedNode.importance * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full"
            style={{ width: `${selectedNode.importance * 100}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Position</span>
          <span className="text-slate-200 font-mono">
            ({selectedNode.x.toFixed(1)}, {selectedNode.y.toFixed(1)}, {selectedNode.z.toFixed(1)})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">ID</span>
          <span className="text-slate-400 font-mono text-[10px]">{selectedNode.id}</span>
        </div>
      </div>
    </div>
  )
}
