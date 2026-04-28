import { useEffect, useState } from 'react'
import { skillsApi } from '../../api/client'
import { useStore } from '../../store'
import type { Skill } from '../../types'

const CATEGORY_COLORS: Record<string, string> = {
  analysis: 'bg-blue-900/50 text-blue-300',
  language: 'bg-green-900/50 text-green-300',
  extraction: 'bg-yellow-900/50 text-yellow-300',
  generation: 'bg-purple-900/50 text-purple-300',
  transformation: 'bg-orange-900/50 text-orange-300',
  debugging: 'bg-red-900/50 text-red-300',
  documentation: 'bg-slate-700 text-slate-300',
}

export function SkillsPanel() {
  const { skills, setSkills } = useStore()
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})
  const [params, setParams] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Skill | null>(null)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    setLoading(true)
    try {
      const data = await skillsApi.list()
      setSkills(data)
    } finally {
      setLoading(false)
    }
  }

  const execute = async (skill: Skill) => {
    setExecuting(skill.id)
    try {
      const parsedParams: Record<string, unknown> = {}
      for (const p of skill.parameters) {
        const val = params[`${skill.id}_${p.name}`] || ''
        if (val) parsedParams[p.name] = val
      }
      const res = await skillsApi.execute(skill.id, parsedParams)
      setResults((prev) => ({ ...prev, [skill.id]: res.result }))
      await skillsApi.reflect(skill.id, 'success')
      loadSkills()
    } catch {
      setResults((prev) => ({ ...prev, [skill.id]: 'Error executing skill' }))
      await skillsApi.reflect(skill.id, 'failure')
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">⚡ Skills</h2>
          <p className="text-xs text-slate-400 mt-1">{skills.length} skills loaded</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {skills.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`w-full text-left rounded-lg p-2.5 text-sm transition-colors ${
                selected?.id === s.id ? 'bg-blue-700 text-white' : 'hover:bg-slate-700 text-slate-200'
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[s.category] || 'bg-slate-700 text-slate-300'}`}>
                  {s.category}
                </span>
                <span className="text-xs text-slate-400">{(s.utility_score * 100).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Select a skill to execute
          </div>
        ) : (
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-100">{selected.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{selected.description}</p>
              <div className="flex gap-3 mt-2 text-xs text-slate-400">
                <span>Used {selected.usage_count}x</span>
                <span>Utility: {(selected.utility_score * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300">Parameters</h4>
              {selected.parameters.map((p) => (
                <div key={p.name}>
                  <label className="text-xs text-slate-400 block mb-1">
                    {p.name} <span className="text-slate-500">({p.type})</span>
                    {p.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={params[`${selected.id}_${p.name}`] || ''}
                    onChange={(e) => setParams((prev) => ({ ...prev, [`${selected.id}_${p.name}`]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder={`Enter ${p.name}...`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => execute(selected)}
              disabled={executing === selected.id}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {executing === selected.id ? 'Executing...' : 'Execute Skill'}
            </button>

            {results[selected.id] && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Result</div>
                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans">{results[selected.id]}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
