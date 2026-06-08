import { useState, type MouseEvent } from 'react'
import type { Event } from '../../types/event'
import { useAuthStore } from '../../store/useAuthStore'
import { useFavoriteStore } from '../../store/useFavoriteStore'

interface FavoriteButtonProps {
  event: Event
}

export default function FavoriteButton({ event }: FavoriteButtonProps) {
  const { isLoggedIn, openLoginModal } = useAuthStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore()
  const [isAnimating, setIsAnimating] = useState(false)

  const favorited = isFavorite(event.id)

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      openLoginModal()
      return
    }

    setIsAnimating(true)
    window.setTimeout(() => setIsAnimating(false), 300)

    if (favorited) {
      removeFavorite(event.id)
    } else {
      addFavorite(event)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? '찜 해제' : '찜하기'}
      className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white ${
        isAnimating ? 'scale-[1.2]' : 'scale-100 hover:scale-110'
      }`}
    >
      <svg
        className={`h-[13px] w-[13px] transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'fill-none text-gray-300'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
