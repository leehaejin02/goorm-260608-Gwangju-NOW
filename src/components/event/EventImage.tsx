import { useState } from 'react'
import type { Event } from '../../types/event'
import { EVENT_CATEGORY_VISUALS, isPlaceholderEventImage } from '../../lib/eventImageFallback'

interface EventImageProps {
  event: Pick<Event, 'title' | 'category' | 'imageUrl'>
  className?: string
}

export default function EventImage({ event, className = 'h-full w-full object-cover' }: EventImageProps) {
  const [imgError, setImgError] = useState(false)
  const visual = EVENT_CATEGORY_VISUALS[event.category]
  const showPhoto = event.imageUrl && !isPlaceholderEventImage(event.imageUrl) && !imgError

  if (showPhoto) {
    return (
      <img
        src={event.imageUrl}
        alt={event.title}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${visual.gradient}`}
    >
      <span className="text-5xl drop-shadow-sm" aria-hidden>
        {visual.emoji}
      </span>
    </div>
  )
}
