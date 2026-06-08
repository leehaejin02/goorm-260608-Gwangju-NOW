import { useMemo } from 'react'
import { useCourseStore } from '../../store/useCourseStore'
import { getProactiveSuggestions } from '../../lib/agentProactive'
import { scrollToElement } from '../../lib/scrollToSection'

export default function FloatingCourseBar() {
  const currentItems = useCourseStore((s) => s.currentItems)
  const count = currentItems.length
  const proactive = useMemo(() => getProactiveSuggestions(currentItems)[0], [currentItems])

  const scrollToPlanner = () => {
    scrollToElement('ai-chat')
  }

  if (count === 0) {
    return (
      <button
        type="button"
        onClick={scrollToPlanner}
        className="fixed bottom-6 right-4 z-40 flex max-w-[220px] items-center gap-2 rounded-full gj-grad-bg px-5 py-3 text-sm font-semibold text-white md:right-6"
        title={proactive?.message}
      >
        <span>🤖</span>
        <span className="truncate">AI 플래너</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={scrollToPlanner}
      className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full gj-grad-bg px-5 py-3 text-sm font-semibold text-white md:right-6"
    >
      🗺️ 내 코스
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
        {count}
      </span>
    </button>
  )
}
