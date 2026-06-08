import { useState } from 'react'
import { formatDistanceKm } from '../../lib/geoUtils'
import type { Restaurant, RestaurantWithDistance } from '../../types/restaurant'
import RestaurantFavoriteButton from './RestaurantFavoriteButton'
import AddToCourseButton from '../course/AddToCourseButton'
import { courseItemFromRestaurant } from '../../lib/courseUtils'

interface RestaurantCardProps {
  restaurant: Restaurant | RestaurantWithDistance
  showDistance?: boolean
}

const categoryStyles: Record<string, string> = {
  한식: 'bg-orange-100 text-orange-700',
  중식: 'bg-red-100 text-red-700',
  일식: 'bg-pink-100 text-pink-700',
  양식: 'bg-yellow-100 text-yellow-700',
  '카페·디저트': 'bg-purple-100 text-purple-700',
  카페: 'bg-purple-100 text-purple-700',
  '시장·먹거리': 'bg-emerald-100 text-emerald-700',
  맛집거리: 'bg-blue-100 text-blue-700',
  치킨: 'bg-amber-100 text-amber-700',
  '곱창,막창': 'bg-rose-100 text-rose-700',
  '곱창, 막창': 'bg-rose-100 text-rose-700',
}

const categoryVisuals: Record<string, { emoji: string; gradient: string }> = {
  한식: { emoji: '🍚', gradient: 'from-orange-100 via-amber-50 to-orange-50' },
  중식: { emoji: '🥟', gradient: 'from-red-100 via-rose-50 to-red-50' },
  일식: { emoji: '🍣', gradient: 'from-pink-100 via-rose-50 to-pink-50' },
  양식: { emoji: '🍝', gradient: 'from-yellow-100 via-amber-50 to-yellow-50' },
  '카페·디저트': { emoji: '☕', gradient: 'from-purple-100 via-violet-50 to-purple-50' },
  카페: { emoji: '☕', gradient: 'from-purple-100 via-violet-50 to-purple-50' },
  '시장·먹거리': { emoji: '🏪', gradient: 'from-emerald-100 via-green-50 to-emerald-50' },
  맛집거리: { emoji: '🍽️', gradient: 'from-blue-100 via-sky-50 to-blue-50' },
  치킨: { emoji: '🍗', gradient: 'from-amber-100 via-yellow-50 to-amber-50' },
  '곱창,막창': { emoji: '🥘', gradient: 'from-rose-100 via-orange-50 to-rose-50' },
  '곱창, 막창': { emoji: '🥘', gradient: 'from-rose-100 via-orange-50 to-rose-50' },
}

const defaultVisual = { emoji: '🍽️', gradient: 'from-slate-100 via-gray-50 to-slate-50' }

export default function RestaurantCard({ restaurant, showDistance = false }: RestaurantCardProps) {
  const [imgError, setImgError] = useState(false)
  const distanceKm = 'distanceKm' in restaurant ? restaurant.distanceKm : undefined
  const badgeClass = categoryStyles[restaurant.category] ?? 'bg-gray-100 text-gray-600'
  const visual = categoryVisuals[restaurant.category] ?? defaultVisual
  const showPhoto = Boolean(restaurant.imageUrl) && !imgError

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[5/3] overflow-hidden bg-gray-100">
        {showPhoto ? (
          <img
            src={restaurant.imageUrl}
            alt={`${restaurant.name} 사진`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${visual.gradient}`}
          >
            <span className="text-5xl drop-shadow-sm" aria-hidden>
              {visual.emoji}
            </span>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {restaurant.category}
        </span>
        {showDistance && distanceKm != null && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#378ADD] shadow-sm">
            {formatDistanceKm(distanceKm)}
          </span>
        )}
        {!showDistance && (
          <div className="absolute right-3 top-3">
            <RestaurantFavoriteButton restaurant={restaurant} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{restaurant.name}</h3>
        <p className="mt-1.5 line-clamp-1 text-sm text-gray-500">{restaurant.address}</p>
        {restaurant.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {restaurant.description}
          </p>
        )}
        {restaurant.tel && (
          <p className="mt-2 text-xs text-gray-400">{restaurant.tel}</p>
        )}
        {restaurant.placeUrl && (
          <a
            href={restaurant.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#378ADD] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            카카오맵에서 보기 →
          </a>
        )}
        {!showDistance && (
          <div className="mt-3">
            <AddToCourseButton
              item={courseItemFromRestaurant(restaurant)}
              size="sm"
            />
          </div>
        )}
      </div>
    </article>
  )
}
