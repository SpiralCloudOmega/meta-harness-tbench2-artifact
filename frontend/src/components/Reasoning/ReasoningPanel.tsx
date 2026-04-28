import { useState } from 'react'
import { reasoningApi, autoresearchApi } from '../../api/client'
import type { ReasoningResult, ReasoningTree, AutoresearchRun } from '../../types'

const TASK_TYPES = ['general', 'summarization', 'qa', 'classification', 'extraction', 'analysis', 'translation']

function TreeNode({ node, depth = 0 }: { node: ReasoningTree; depth?: number }) {
  const colors: Record<string, string> = {
    SPLIT: 'border-blue-500 bg-blue-900/20',
    MAP: 'border-green-500 bg-green-900/20',
    REDUCE: 'border-orange-500 bg-orange-900/20',
    LEAF: 'border-slate-600 bg-slate-800',
    FILTER: 'border-yellow-500 bg-yellow-900/20',
    CONCAT: 'border-purple-500 bg-purple-900/20',
    CROSS: 'border-red-500 bg-red-900/20',
  }
  return (
    <div className={`ml-${depth * 4} border-l-2 pl-3 py-1 mb-1 rounded-r ${colors[node.op] || 'border-slate-600'}`}>
      <span className="text-xs font-mono font-bold text-slate-300">{node.op}</span>
      <span className="text-xs text-slate-400 ml-2">{node.content}</span>
      {node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export function ReasoningPanel() {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [taskType, setTaskType] = useState('general')
  const [result, setResult] = useState<ReasoningResult | null>(null)
  const [loading, setLoading] = useState(false)

  const [arGoal, setArGoal] = useState('')
  const [arIterations, setArIterations] = useState(3)
  const [arRun, setArRun] = useState<AutoresearchRun | null>(null)
  const [arLoading, setArLoading] = useState(false)
  const [tab, setTab] = useState<'lambda' | 'autoresearch'>('lambda')

  const analyze = async () => {
    if (!text) return
    setLoading(true)
    try {
      const res = await reasoningApi.analyze(text, taskType, query)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const startResearch = async () => {
    if (!arGoal) return
    setArLoading(true)
    try {
      const run = await autoresearchApi.start(arGoal, arIterations)
      setArRun(run)
      const poll = setInterval(async () => {
        const status = await autoresearchApi.getStatus(run.id)
        setArRun(status)
        if (status.status === 'completed') clearInterval(poll)
      }, 1500)
    } finally {
      setArLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-bold text-slate-100">🔬 Reasoning</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('lambda')}
            className={`px-3 py-1 rounded text-sm ${tab === 'lambda' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Lambda-RLM
          </button>
          <button
            onClick={() => setTab('autoresearch')}
            className={`px-3 py-1 rounded text-sm ${tab === 'autoresearch' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            AutoResearch
          </button>
        </div>
      </div>

      {tab === 'lambda' ? (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-80 shrink-0 space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {taskType === 'qa' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Your question..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Input Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to process with Lambda-RLM..."
                rows={8}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <button
              onClick={analyze}
              disabled={!text || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {loading ? 'Processing...' : 'Analyze with Lambda-RLM'}
            </button>
          </div>

          {result && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Task: <span className="text-blue-400">{result.task_type}</span></div>
                <div className="text-xs text-slate-400 mb-2">Operators: <span className="text-orange-400">{result.operators_used.join(' → ')}</span></div>
                <p className="text-sm text-slate-200">{result.result}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-2">Execution Tree</div>
                <TreeNode node={result.tree} />
              </div>
              {result.chunks.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-2">Chunks ({result.chunks.length})</div>
                  <div className="space-y-1.5">
                    {result.chunks.map((c, i) => (
                      <div key={i} className="text-xs text-slate-300 bg-slate-900 rounded px-2 py-1 font-mono line-clamp-2">{c}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-80 shrink-0 space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Research Goal</label>
              <textarea
                value={arGoal}
                onChange={(e) => setArGoal(e.target.value)}
                placeholder="What should the agent research?"
                rows={4}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Max Iterations: {arIterations}</label>
              <input
                type="range"
                min={1}
                max={10}
                value={arIterations}
                onChange={(e) => setArIterations(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <button
              onClick={startResearch}
              disabled={!arGoal || arLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {arLoading ? 'Starting...' : 'Start AutoResearch'}
            </button>
          </div>

          {arRun && (
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">{arRun.goal.slice(0, 60)}...</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${arRun.status === 'completed' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300 animate-pulse'}`}>
                    {arRun.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Iteration {arRun.current_iteration}/{arRun.max_iterations}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(arRun.current_iteration / arRun.max_iterations) * 100}%` }}
                  />
                </div>
              </div>
              {arRun.experiments.map((exp) => (
                <div key={exp.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-purple-400 font-semibold">Iteration {exp.iteration}</span>
                    <span className="text-xs text-green-400">{(exp.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">{exp.hypothesis}</p>
                  <p className="text-xs text-slate-400 italic">{exp.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
