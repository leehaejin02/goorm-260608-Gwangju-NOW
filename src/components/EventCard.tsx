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
}
const categoryStyles: Record<EventCardProps['category'], string> = {
  축제: 'bg-orange-100 text-orange-700',
  공연: 'bg-purple-100 text-purple-700',
  전시: 'bg-green-100 text-green-700',
  기타: 'bg-gray-100 text-gray-600',
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  const startStr = startDate.toLocaleDateString('ko-KR', options)
  const endStr = endDate.toLocaleDateString('ko-KR', options)
  return start === end ? startStr : `${startStr} – ${endStr}`
}

export default function EventCard(props: EventCardProps) {
  const { linkToDetail = true, distanceKm, ...event } = props
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
      className={`group rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        linkToDetail ? 'cursor-pointer' : ''
      }`}
    >      <div className="relative aspect-[5/3] overflow-hidden bg-gray-100">
        <EventImage event={event} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles[category]}`}
        >
          {category}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteButton event={event} />
        </div>
        {distanceKm != null && (
          <span className="absolute bottom-3 right-3 rounded-full bg-[#378ADD] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {formatDistanceKm(distanceKm)}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{place}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDateRange(startDate, endDate)}
        </p>
        <AISummaryBadge
          eventId={id}
          eventTitle={title}
          eventDescription={description}
        />
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <AddToCourseButton item={courseItemFromEvent(event)} size="sm" />
        </div>
      </div>
    </article>
  )
}
