import { useState } from 'react'
import type { ProactiveSuggestion } from '../../lib/agentProactive'

interface AgentProactiveBannerProps {
  suggestions: ProactiveSuggestion[]
  onAction: (prompt: string) => void
  isLoading?: boolean
}

export default function AgentProactiveBanner({
  suggestions,
  onAction,
  isLoading = false,
}: AgentProactiveBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = suggestions.filter((s) => !dismissed.has(s.id))
  if (visible.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {visible.map((suggestion) => (
        <div
          key={suggestion.id}
          className="flex items-start gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 p-3 sm:p-4"
        >
          <span className="text-xl" aria-hidden>
            {suggestion.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{suggestion.message}</p>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onAction(suggestion.actionPrompt)}
              className="mt-2 text-sm font-semibold text-[#378ADD] hover:underline disabled:opacity-50"
            >
              에이전트에게 맡기기 →
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDismissed((prev) => new Set(prev).add(suggestion.id))}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
