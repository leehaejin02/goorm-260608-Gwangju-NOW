import { Link } from 'react-router-dom'
import type { Event } from '../../types/event'
import type { Restaurant } from '../../types/restaurant'
import { parseAIContent } from '../../lib/linkifyAIContent'

interface ChatMessageContentProps {
  content: string
  events: Event[]
  restaurants: Restaurant[]
  variant?: 'user' | 'assistant'
}

export default function ChatMessageContent({
  content,
  events,
  restaurants,
  variant = 'assistant',
}: ChatMessageContentProps) {
  const parts = parseAIContent(content, events, restaurants)
  const linkClass =
    variant === 'user'
      ? 'font-semibold underline underline-offset-2 hover:opacity-90'
      : 'font-semibold text-[#378ADD] underline underline-offset-2 hover:text-[#2d6fc4]'

  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <span key={idx}>{part.value}</span>
        }
        if (part.type === 'event') {
          return (
            <Link key={idx} to={`/events/${part.eventId}`} className={linkClass}>
              {part.value}
            </Link>
          )
        }
        if (part.href.startsWith('http')) {
          return (
            <a
              key={idx}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {part.value}
            </a>
          )
        }
        return (
          <a key={idx} href={part.href} className={linkClass}>
            {part.value}
          </a>
        )
      })}
    </>
  )
}
