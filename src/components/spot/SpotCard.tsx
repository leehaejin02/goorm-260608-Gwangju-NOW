import { useState } from 'react'
import type { Spot } from '../../types/spot'
import { getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'
import { courseItemFromSpot } from '../../lib/courseUtils'
import AddToCourseButton from '../course/AddToCourseButton'

const categoryStyles: Record<Spot['category'], string> = {
  관광지: 'bg-teal-100 text-teal-700',
  문화시설: 'bg-indigo-100 text-indigo-700',
  레포츠: 'bg-sky-100 text-sky-700',
  쇼핑: 'bg-pink-100 text-pink-700',
}

const categoryVisuals: Record<Spot['category'], { emoji: string; gradient: string }> = {
  관광지: { emoji: '🏞️', gradient: 'from-teal-100 via-emerald-50 to-teal-50' },
  문화시설: { emoji: '🏛️', gradient: 'from-indigo-100 via-violet-50 to-indigo-50' },
  레포츠: { emoji: '🚴', gradient: 'from-sky-100 via-cyan-50 to-sky-50' },
  쇼핑: { emoji: '🛍️', gradient: 'from-pink-100 via-rose-50 to-pink-50' },
}

interface SpotCardProps {
  spot: Spot
}

export default function SpotCard({ spot }: SpotCardProps) {
  const [imgError, setImgError] = useState(false)
  const visual = categoryVisuals[spot.category]
  const showPhoto = Boolean(spot.imageUrl) && !imgError
  const hasCoords = spot.lat != null && spot.lng != null

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[5/3] overflow-hidden bg-gray-100">
        {showPhoto ? (
          <img
            src={spot.imageUrl}
            alt={`${spot.title} 사진`}
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
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles[spot.category]}`}
        >
          {spot.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{spot.title}</h3>
        <p className="mt-1.5 line-clamp-1 text-sm text-gray-500">{spot.address}</p>
        {spot.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {spot.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {hasCoords && (
            <a
              href={getKakaoDirectionsUrl(spot.title, spot.lat!, spot.lng!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#378ADD] hover:underline"
            >
              길찾기 →
            </a>
          )}
          <AddToCourseButton item={courseItemFromSpot(spot)} size="sm" />
        </div>
      </div>
    </article>
  )
}
