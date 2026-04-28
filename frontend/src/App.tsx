import { useStore } from './store'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { StatusBar } from './components/Layout/StatusBar'
import { Graph3DView } from './components/Graph3D/Graph3DView'
import { ChatPanel } from './components/Chat/ChatPanel'
import { MemoryPanel } from './components/Memory/MemoryPanel'
import { WikiPanel } from './components/Wiki/WikiPanel'
import { SkillsPanel } from './components/Skills/SkillsPanel'
import { ReasoningPanel } from './components/Reasoning/ReasoningPanel'

export default function App() {
  const { activePanel } = useStore()

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {activePanel === 'graph' && <Graph3DView />}
          {activePanel === 'chat' && <ChatPanel />}
          {activePanel === 'memory' && <MemoryPanel />}
          {activePanel === 'wiki' && <WikiPanel />}
          {activePanel === 'skills' && <SkillsPanel />}
          {activePanel === 'reasoning' && <ReasoningPanel />}
        </main>
      </div>
      <StatusBar />
    </div>
  )
}
