import { useNavigate } from 'react-router-dom'
import AISummaryBadge from './event/AISummaryBadge'
import FavoriteButton from './event/FavoriteButton'
import EventImage from './event/EventImage'
import AddToCourseButton from './course/AddToCourseButton'
import { courseItemFromEvent } from '../lib/courseUtils'
import { formatDistanceKm } from '../lib/geoUtils'
import type { Event } from '../types/event'

interface EventCardProps extends Event {
  linkToDetail?: boolean
  distanceKm?: number
  className?: string
}

function getCategoryColor(cat: string) {
  const map: Record<string, string> = {
    축제: '#6C5CE7',
    공연: '#4B8EF0',
    전시: '#00B4FF',
    트렌드: '#FF6B35',
    맛집: '#2E7D32',
    기타: '#888888',
  }
  return map[cat] ?? '#888888'
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('ko-KR', options)
  const endStr = endDate.toLocaleDateString('ko-KR', options)
  return start === end ? startStr : `${startStr} ~ ${endStr}`
}

export default function EventCard(props: EventCardProps) {
  const { linkToDetail = true, distanceKm, className = '', ...event } = props
  const { id, title, place, startDate, endDate, category, description } = event
  const navigate = useNavigate()

  const handleCardClick = () => {
    if (linkToDetail) navigate(`/events/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (linkToDetail && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      navigate(`/events/${id}`)
    }
  }

  return (
    <article
      role={linkToDetail ? 'button' : undefined}
      tabIndex={linkToDetail ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`overflow-hidden rounded-2xl border border-gj-border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md ${
        linkToDetail ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="relative h-[160px] overflow-hidden bg-[#F0EEFF]">
        <EventImage
          event={event}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span
          className="absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white"
          style={{ background: getCategoryColor(category) }}
        >
          {category}
        </span>
        <div className="absolute right-3 top-3" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton event={event} />
        </div>
        {distanceKm != null && (
          <span
            className="absolute bottom-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ background: '#6C5CE7' }}
          >
            {formatDistanceKm(distanceKm)}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-gj-dark">
          {title}
        </h3>
        <p className="mb-1 flex items-center gap-1 text-[11px] text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span className="line-clamp-1">{place}</span>
        </p>
        <p className="mb-2 flex items-center gap-1 text-[11px] text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {formatDateRange(startDate, endDate)}
        </p>
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <AISummaryBadge eventId={id} eventTitle={title} eventDescription={description} />
          <AddToCourseButton item={courseItemFromEvent(event)} size="sm" />
        </div>
      </div>
    </article>
  )
}
