import { useEffect, useState } from 'react'
import { fetchAISummary } from '../../api/aiApi'

interface AISummaryBadgeProps {
  eventId: string
  eventTitle: string
  eventDescription: string
}

export default function AISummaryBadge({
  eventId,
  eventTitle,
  eventDescription,
}: AISummaryBadgeProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchAISummary(eventId, eventTitle, eventDescription).then((result) => {
      if (!cancelled) {
        setSummary(result)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [eventId, eventTitle, eventDescription])

  if (isLoading) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
        <span className="mt-0.5 shrink-0 text-sm" aria-hidden>
          ✨
        </span>
        <div className="flex items-center gap-1 pt-0.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:300ms]" />
          <span className="sr-only">AI 요약 생성 중</span>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
      <span className="mt-0.5 shrink-0 text-sm" aria-hidden>
        ✨
      </span>
      <p className="text-xs leading-relaxed text-gray-700">{summary}</p>
    </div>
  )
}
