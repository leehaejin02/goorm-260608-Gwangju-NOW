import type { AgentAction } from '../../types/agent'

interface AgentActionCardsProps {
  actions: AgentAction[]
  inlinePanel?: boolean
}

export default function AgentActionCards({ actions, inlinePanel = false }: AgentActionCardsProps) {
  if (actions.length === 0) return null

  return (
    <div className="mt-2 space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
      <p className="text-xs font-semibold text-emerald-800">✓ 에이전트 실행</p>
      <ul className="space-y-1">
        {actions.map((action, idx) => (
          <li key={`${action.type}-${idx}`} className="text-xs text-emerald-700">
            · {action.label}
          </li>
        ))}
      </ul>
      {!inlinePanel && (
        <button
          type="button"
          onClick={() =>
            document.getElementById('my-course')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="mt-1 text-xs font-medium text-[#378ADD] hover:underline"
        >
          나만의 코스에서 확인 →
        </button>
      )}
      {inlinePanel && (
        <p className="mt-1 text-xs text-emerald-600">→ 오른쪽 코스 패널에 반영됨</p>
      )}
    </div>
  )
}
