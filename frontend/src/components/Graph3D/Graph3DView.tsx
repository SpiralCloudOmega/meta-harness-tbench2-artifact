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
  Cluster: '#a855f7',
  Process: '#f97316',
}

const EDGE_COLORS: Record<string, string> = {
  CALLS: '#ef4444',
  IMPORTS: '#eab308',
  MEMBER_OF: '#a855f7',
}

export function Graph3DView() {
  const { graphData, loading, error } = useGraph()
  const { setSelectedNode } = useStore()
  const [ForceGraph3D, setForceGraph3D] = useState<React.ComponentType<any> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    import('react-force-graph-3d').then((mod) => {
      setForceGraph3D(() => mod.default)
    })
  }, [])

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

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode)
  }, [setSelectedNode])

  const fgData = graphData
    ? {
        nodes: graphData.nodes.map((n) => ({ ...n, name: n.label })),
        links: graphData.edges.map((e) => ({ source: e.source, target: e.target, type: e.type, weight: e.weight })),
      }
    : { nodes: [], links: [] }

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
          nodeVal={(node: any) => (node.importance || 0.5) * 5 + 2}
          linkColor={(link: any) => EDGE_COLORS[link.type] || '#475569'}
          linkWidth={(link: any) => (link.weight || 0.5) * 2}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={handleNodeClick}
          nodeLabel={(node: any) => `<div style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:12px;">${node.label}<br/><span style="color:#94a3b8">${node.type} · ${node.file_path}</span></div>`}
        />
      )}
      {!ForceGraph3D && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          Initializing 3D engine...
        </div>
      )}
      <NodePanel />
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 text-xs">
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
