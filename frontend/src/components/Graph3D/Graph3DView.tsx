import { useEffect, useState, useRef, useCallback } from 'react'
import * as THREE from 'three'
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

// WebGPU capability detection
async function detectWebGPU(): Promise<{ available: boolean; adapterName: string }> {
  if (!('gpu' in navigator)) return { available: false, adapterName: '' }
  try {
    const adapter = await (navigator as any).gpu.requestAdapter({
      powerPreference: 'high-performance',
    })
    if (!adapter) return { available: false, adapterName: '' }
    const info = await adapter.requestAdapterInfo()
    return { available: true, adapterName: info?.description || info?.vendor || 'GPU' }
  } catch {
    return { available: false, adapterName: '' }
  }
}

export function Graph3DView() {
  const { graphData, loading, error } = useGraph()
  const { setSelectedNode, searchFilter, selectedRepo } = useStore()
  const [ForceGraph3D, setForceGraph3D] = useState<React.ComponentType<any> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [expandedNodes, setExpandedNodes] = useState<GraphNode[]>([])
  const [expandedEdges, setExpandedEdges] = useState<{ source: string; target: string; type: string; weight: number }[]>([])
  const [gpuStatus, setGpuStatus] = useState<{ webgpu: boolean; label: string }>({ webgpu: false, label: 'Detecting GPU…' })

  // Detect WebGPU on mount
  useEffect(() => {
    detectWebGPU().then(({ available, adapterName }) => {
      setGpuStatus({
        webgpu: available,
        label: available ? `WebGPU ✓ ${adapterName}` : 'WebGL (WebGPU unavailable)',
      })
    })
  }, [])

  useEffect(() => {
    import('react-force-graph-3d').then((mod) => {
      setForceGraph3D(() => mod.default)
    })
  }, [])

  // After ForceGraph3D mounts, configure the Three.js renderer for the RTX 3090
  const configureRenderer = useCallback(() => {
    if (!fgRef.current) return
    const renderer: THREE.WebGLRenderer | undefined = fgRef.current.renderer?.()
    if (!renderer) return

    // High-quality rendering tuned for RTX 3090 24GB
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Maximize texture quality — 3090 has 24GB VRAM
    renderer.capabilities && Object.defineProperty(renderer.capabilities, 'maxTextureSize', {
      get: () => 16384,
      configurable: true,
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

  useEffect(() => {
    setExpandedNodes([])
    setExpandedEdges([])
  }, [selectedRepo])

  const handleNodeClick = useCallback(async (node: any) => {
    const gn = node as GraphNode
    setSelectedNode(gn)
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
        // Graceful fallback
      }
    }
  }, [setSelectedNode, selectedRepo])

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

      {/* GPU status badge */}
      <div className={`absolute top-3 right-3 z-30 px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5 ${gpuStatus.webgpu ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' : 'bg-slate-800/80 text-slate-400 border border-slate-700'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${gpuStatus.webgpu ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        {gpuStatus.label}
      </div>

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
          ref={fgRef}
          graphData={fgData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#020617"
          // High-performance renderer config for RTX 3090
          rendererConfig={{
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'highp',
            logarithmicDepthBuffer: true,
            alpha: false,
            stencil: false,
          }}
          nodeColor={(node: any) => NODE_COLORS[node.type] || '#6b7280'}
          nodeVal={(node: any) => {
            const isExpandable = node.metadata?.is_expandable
            return (node.importance || 0.5) * 5 + 2 + (isExpandable ? 3 : 0)
          }}
          nodeOpacity={(node: any) => filter && !node.label.toLowerCase().includes(filter) ? 0.2 : 1.0}
          linkColor={(link: any) => EDGE_COLORS[link.type] || '#475569'}
          linkWidth={(link: any) => (link.weight || 0.5) * 2}
          linkDirectionalParticles={(link: any) => link.type === 'STEP_IN_PROCESS' ? 6 : 3}
          linkDirectionalParticleSpeed={(link: any) => link.type === 'STEP_IN_PROCESS' ? 0.012 : 0.005}
          linkDirectionalParticleWidth={1.5}
          onNodeClick={handleNodeClick}
          onEngineStop={configureRenderer}
          nodeLabel={(node: any) => {
            const expandHint = node.metadata?.is_expandable ? ' · <b>click to expand</b>' : ''
            return `<div style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:12px;">${node.label}${expandHint}<br/><span style="color:#94a3b8">${node.type} · ${node.file_path}</span></div>`
          }}
          enableNodeDrag
          enableNavigationControls
          showNavInfo={false}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.25}
          warmupTicks={200}
          cooldownTicks={500}
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
