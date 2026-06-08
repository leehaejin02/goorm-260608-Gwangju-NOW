import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../types/event'
import { getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'

interface MapEventListProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (eventId: string) => void
}

function formatDateRange(start: string, end: string) {
  if (!start) return ''
  if (start === end || !end) return start
  return `${start} ~ ${end}`
}

export default function MapEventList({
  events,
  selectedEventId,
  onSelect,
}: MapEventListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedEventId])

  if (events.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-500">표시할 행사가 없습니다.</p>
      </div>
    )
  }

  return (
    <div ref={listRef} className="flex h-full max-h-[450px] flex-col">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">행사 목록</p>
        <p className="mt-0.5 text-xs text-gray-500">{events.length}개 · 클릭하면 지도에서 위치 확인</p>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {events.map((event) => {
          const selected = selectedEventId === event.id
          const hasCoords = event.lat != null && event.lng != null

          return (
            <li key={event.id} className="border-b border-gray-50 last:border-b-0">
              <button
                ref={selected ? selectedRef : undefined}
                type="button"
                onClick={() => onSelect(event.id)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  selected
                    ? 'bg-blue-50 ring-1 ring-inset ring-[#378ADD]/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="line-clamp-1 text-sm font-semibold text-gray-900">{event.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{event.place}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                {!hasCoords && (
                  <p className="mt-1 text-xs text-amber-600">위치 정보 없음</p>
                )}
              </button>
              {selected && hasCoords && (
                <div className="flex gap-2 px-4 pb-3">
                  <Link
                    to={`/events/${event.id}`}
                    className="rounded-md bg-[#378ADD] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#2d6fb8]"
                  >
                    상세보기
                  </Link>
                  <a
                    href={getKakaoDirectionsUrl(event.title, event.lat!, event.lng!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    길찾기
                  </a>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
