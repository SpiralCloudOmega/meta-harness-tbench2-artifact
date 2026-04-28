import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../../store'
import { useGraph } from '../../hooks/useGraph'
import { NodePanel } from './NodePanel'
import { GraphControls } from './GraphControls'
import type { GraphNode } from '../../types'

const NODE_COLORS: Record<string, string> = {
  Function: '#3b82f6',
  Class: '#22c55e',
  File: '#6b7280',
  Folder: '#94a3b8',
  Community: '#a855f7',
  Cluster: '#a855f7',
  Process: '#f97316',
  Interface: '#06b6d4',
  Method: '#84cc16',
}

const EDGE_COLORS: Record<string, string> = {
  CALLS: '#ef4444',
  IMPORTS: '#eab308',
  MEMBER_OF: '#a855f7',
  CONTAINS: '#475569',
  DEFINES: '#22c55e',
  EXTENDS: '#06b6d4',
  IMPLEMENTS: '#84cc16',
  STEP_IN_PROCESS: '#f97316',
}

export function Graph3DView() {
  const { graphData, loading, error } = useGraph()
  const { setSelectedNode, searchFilter, selectedRepo } = useStore()
  const [ForceGraph3D, setForceGraph3D] = useState<React.ComponentType<any> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  // Extra nodes injected by cluster drill-down
  const [expandedNodes, setExpandedNodes] = useState<GraphNode[]>([])
  const [expandedEdges, setExpandedEdges] = useState<{ source: string; target: string; type: string; weight: number }[]>([])

  useEffect(() => {
    import('react-force-graph-3d').then((mod) => {
      setForceGraph3D(() => mod.default)
    })
  }, [])

  useEffect(() => {
    // Reset drill-down state when repo changes
    setExpandedNodes([])
    setExpandedEdges([])
  }, [selectedRepo])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    obs.observe(el)
    setDimensions({ width: el.clientWidth, height: el.clientHeight })
    return () => obs.disconnect()
  }, [])

  const handleNodeClick = useCallback(async (node: any) => {
    const gn = node as GraphNode
    setSelectedNode(gn)
    // Cluster drill-down: expand Community/Cluster/Folder nodes in-place
    if (gn.metadata?.is_expandable) {
      try {
        const res = await fetch(`http://localhost:8000/api/graph/${selectedRepo}/children/${gn.id}`)
        if (res.ok) {
          const children: GraphNode[] = await res.json()
          setExpandedNodes((prev) => {
            const existing = new Set(prev.map((n) => n.id))
            return [...prev, ...children.filter((c) => !existing.has(c.id))]
          })
          setExpandedEdges((prev) => [
            ...prev,
            ...children.map((c) => ({ source: gn.id, target: c.id, type: 'CONTAINS', weight: 0.5 })),
          ])
        }
      } catch {
        // Graceful fallback — node is still selected
      }
    }
  }, [setSelectedNode, selectedRepo])

  // Apply search filter
  const filter = searchFilter.toLowerCase()
  const baseNodes = graphData?.nodes ?? []
  const baseEdges = graphData?.edges ?? []
  const filteredNodes = filter
    ? baseNodes.filter((n) => n.label.toLowerCase().includes(filter) || n.type.toLowerCase().includes(filter) || n.file_path.toLowerCase().includes(filter))
    : baseNodes

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
  const allNodes = [...filteredNodes, ...expandedNodes.filter((n) => !filteredNodeIds.has(n.id))]
  const allNodeIds = new Set(allNodes.map((n) => n.id))
  const allEdges = [
    ...baseEdges.filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target)),
    ...expandedEdges.filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target)),
  ]

  const fgData = {
    nodes: allNodes.map((n) => ({ ...n, name: n.label })),
    links: allEdges.map((e) => ({ source: e.source, target: e.target, type: e.type, weight: e.weight })),
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950">
      <GraphControls />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
          <div className="text-slate-300 text-sm animate-pulse">Loading graph...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300 text-sm max-w-sm text-center">
            <div className="font-bold mb-1">Error loading graph</div>
            <div>{error}</div>
          </div>
        </div>
      )}
      {ForceGraph3D && (
        <ForceGraph3D
          graphData={fgData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#020617"
          nodeColor={(node: any) => NODE_COLORS[node.type] || '#6b7280'}
          nodeVal={(node: any) => {
            const isExpandable = node.metadata?.is_expandable
            return (node.importance || 0.5) * 5 + 2 + (isExpandable ? 3 : 0)
          }}
          nodeOpacity={(node: any) => filter && !node.label.toLowerCase().includes(filter) ? 0.2 : 1.0}
          linkColor={(link: any) => EDGE_COLORS[link.type] || '#475569'}
          linkWidth={(link: any) => (link.weight || 0.5) * 2}
          linkDirectionalParticles={(link: any) => link.type === 'STEP_IN_PROCESS' ? 4 : 2}
          linkDirectionalParticleSpeed={(link: any) => link.type === 'STEP_IN_PROCESS' ? 0.01 : 0.004}
          onNodeClick={handleNodeClick}
          nodeLabel={(node: any) => {
            const expandHint = node.metadata?.is_expandable ? ' · <b>click to expand</b>' : ''
            return `<div style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:12px;">${node.label}${expandHint}<br/><span style="color:#94a3b8">${node.type} · ${node.file_path}</span></div>`
          }}
        />
      )}
      {!ForceGraph3D && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          Initializing 3D engine...
        </div>
      )}
      <NodePanel />
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 text-xs max-h-60 overflow-y-auto">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-400">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
