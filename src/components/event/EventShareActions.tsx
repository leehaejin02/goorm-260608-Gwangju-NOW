import { useState } from 'react'
import type { Event } from '../../types/event'

interface EventShareActionsProps {
  event: Event
}

export default function EventShareActions({ event }: EventShareActionsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/events/${event.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('아래 링크를 복사하세요', shareUrl)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.place} · ${event.startDate}`,
          url: shareUrl,
        })
        return
      } catch {
        // user cancelled or failed
      }
    }
    handleCopyLink()
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d6fc4]"
      >
        공유하기
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        {copied ? '✓ 링크 복사됨' : '🔗 링크 복사'}
      </button>
    </div>
  )
}
