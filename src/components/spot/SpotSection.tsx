import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSpotStore } from '../../store/useSpotStore'
import SpotCard from './SpotCard'
import SpotCardSkeleton from './SpotCardSkeleton'
import SpotCategoryFilter from './SpotCategoryFilter'
import ErrorMessage from '../common/ErrorMessage'

const PREVIEW_COUNT = 9

function spotsListPath(category: string): string {
  return category === '전체' ? '/spots' : `/spots?category=${encodeURIComponent(category)}`
}

export default function SpotSection() {
  const {
    spots,
    filteredSpots,
    selectedCategory,
    isLoading,
    error,
    fetchSpots,
    setCategory,
  } = useSpotStore()

  const previewSpots = filteredSpots.slice(0, PREVIEW_COUNT)

  const loadSpots = () => fetchSpots(true)

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  return (
    <section id="spots" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">가볼만한 곳</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              광주 관광지·문화시설·레포츠·쇼핑 — {spots.length > 0 && `총 ${spots.length}곳`}
            </p>
          </div>
          {!isLoading && spots.length > 0 && (
            <Link
              to={spotsListPath(selectedCategory)}
              className="text-sm font-semibold text-[#378ADD] hover:underline"
            >
              전체 보기 →
            </Link>
          )}
        </div>

        {!isLoading && !error && spots.length > 0 && (
          <SpotCategoryFilter selected={selectedCategory} onChange={setCategory} />
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && <ErrorMessage message={error} onRetry={loadSpots} />}

        {!isLoading && !error && filteredSpots.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {selectedCategory === '전체'
                ? '표시할 명소가 없습니다.'
                : `${selectedCategory} 카테고리의 명소가 없습니다.`}
            </p>
          </div>
        )}

        {!isLoading && !error && previewSpots.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {previewSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
            {filteredSpots.length > PREVIEW_COUNT && (
              <div className="mt-8 text-center">
                <Link
                  to={spotsListPath(selectedCategory)}
                  className="inline-flex rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#378ADD] hover:text-[#378ADD]"
                >
                  더 보기 ({filteredSpots.length - PREVIEW_COUNT}곳)
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
