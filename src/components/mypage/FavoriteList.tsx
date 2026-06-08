import { useNavigate } from 'react-router-dom'
import type { Event } from '../../types/event'
import EventCard from '../EventCard'

interface FavoriteListProps {
  favorites: Event[]
}

export default function FavoriteList({ favorites }: FavoriteListProps) {
  const navigate = useNavigate()

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
        <span className="text-4xl" aria-hidden>
          🤍
        </span>
        <p className="mt-3 text-sm font-medium text-gray-500">찜한 행사가 없어요</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
        >
          행사 보러 가기
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {favorites.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  )
}
