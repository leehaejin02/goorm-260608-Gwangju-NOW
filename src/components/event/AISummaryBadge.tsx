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
      <div className="rounded-lg bg-[#F0EEFF] px-2.5 py-1.5">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gj-purple [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gj-purple [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gj-purple [animation-delay:300ms]" />
          <span className="sr-only">AI 요약 생성 중</span>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <p className="rounded-lg bg-[#F0EEFF] px-2.5 py-1.5 text-[11px] leading-relaxed text-gj-purple">
      ✦ {summary}
    </p>
  )
}
