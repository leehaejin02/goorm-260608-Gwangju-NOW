import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSpotStore } from '../../store/useSpotStore'
import SpotCard from './SpotCard'
import SpotCardSkeleton from './SpotCardSkeleton'
import SpotCategoryFilter from './SpotCategoryFilter'
import ErrorMessage from '../common/ErrorMessage'
import SectionHeading from '../common/SectionHeading'

const PREVIEW_COUNT = 8

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
    <section id="spots" className="gj-section-white">
      <div className="gj-container">
        <SectionHeading
          title="가볼만한 곳"
          subtitle={
            spots.length > 0
              ? `광주 관광지·문화시설·레포츠·쇼핑 — 총 ${spots.length}곳`
              : '광주 관광지·문화시설·레포츠·쇼핑'
          }
          action={
            !isLoading && spots.length > 0 ? (
              <Link
                to={spotsListPath(selectedCategory)}
                className="gj-section-more rounded-lg px-3 py-1.5 hover:no-underline hover:bg-violet-50"
              >
                전체 보기 →
              </Link>
            ) : undefined
          }
        />

        {!isLoading && !error && spots.length > 0 && (
          <SpotCategoryFilter selected={selectedCategory} onChange={setCategory} />
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && <ErrorMessage message={error} onRetry={loadSpots} />}

        {!isLoading && !error && filteredSpots.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gj-border bg-gj-bg">
            <p className="text-sm text-gj-sub">
              {selectedCategory === '전체'
                ? '표시할 명소가 없습니다.'
                : `${selectedCategory} 카테고리의 명소가 없습니다.`}
            </p>
          </div>
        )}

        {!isLoading && !error && previewSpots.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {previewSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
            {filteredSpots.length > PREVIEW_COUNT && (
              <div className="mt-8 text-center">
                <Link
                  to={spotsListPath(selectedCategory)}
                  className="inline-flex rounded-xl border border-gj-border bg-white px-6 py-2.5 text-sm font-medium text-gj-dark transition-colors hover:border-gj-purple hover:text-gj-purple"
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
