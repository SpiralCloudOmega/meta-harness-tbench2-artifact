import type { ChatMessage } from '../../types'

interface Props {
  messages: ChatMessage[]
}

export function MessageList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <div>Ask anything about the codebase or selected node</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-100'
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
