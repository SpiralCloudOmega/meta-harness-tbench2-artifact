import { useStore } from '../../store'

export function StatusBar() {
  const { selectedRepo, graphData } = useStore()
  const nodeCount = graphData?.nodes.length ?? 0
  const edgeCount = graphData?.edges.length ?? 0
  return (
    <footer className="bg-slate-800 border-t border-slate-700 px-4 py-1 flex items-center gap-6 text-xs text-slate-400 shrink-0">
      <span>Repo: <span className="text-blue-400">{selectedRepo}</span></span>
      <span>Nodes: <span className="text-green-400">{nodeCount}</span></span>
      <span>Edges: <span className="text-orange-400">{edgeCount}</span></span>
      <span className="ml-auto">Super 3D Node Graph Recursive GitNexus v1.0.0</span>
    </footer>
  )
}
