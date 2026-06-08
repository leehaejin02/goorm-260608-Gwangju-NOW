import { Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import SpotCard from '../components/spot/SpotCard'
import SpotCardSkeleton from '../components/spot/SpotCardSkeleton'
import SpotCategoryFilter from '../components/spot/SpotCategoryFilter'
import SpotSearchBar from '../components/spot/SpotSearchBar'
import ErrorMessage from '../components/common/ErrorMessage'
import { usePageMeta } from '../hooks/usePageMeta'
import { getSpotCategoryCounts, parseSpotCategoryParam } from '../lib/spotFilters'
import { useSpotStore } from '../store/useSpotStore'
import type { SpotFilterCategory } from '../types/spot'

export default function SpotListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = parseSpotCategoryParam(searchParams.get('category'))

  const {
    spots,
    filteredSpots,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    fetchSpots,
    setCategory,
    setSearchQuery,
  } = useSpotStore()

  usePageMeta({
    title: '가볼만한 곳',
    description: '광주 관광지·문화시설·레포츠·쇼핑 명소를 카테고리별로 탐색하세요.',
  })

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  useEffect(() => {
    setCategory(urlCategory)
  }, [urlCategory, setCategory])

  const handleCategoryChange = (category: SpotFilterCategory) => {
    setCategory(category)
    if (category === '전체') {
      setSearchParams({})
    } else {
      setSearchParams({ category })
    }
  }

  const categoryCounts = getSpotCategoryCounts(spots)

  const loadSpots = () => fetchSpots(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/#spots"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-[#378ADD]"
          >
            ← 홈으로
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">가볼만한 곳</h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            광주 관광지·문화시설·레포츠·쇼핑 명소 {spots.length > 0 && `· 총 ${spots.length}곳`}
          </p>
        </div>

        {!isLoading && !error && spots.length > 0 && (
          <>
            <SpotSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <SpotCategoryFilter
              selected={selectedCategory}
              onChange={handleCategoryChange}
              counts={categoryCounts}
            />
          </>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <SpotCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && <ErrorMessage message={error} onRetry={loadSpots} />}

        {!isLoading && !error && filteredSpots.length === 0 && spots.length > 0 && (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <p className="text-sm text-gray-500">
              {searchQuery
                ? '검색 조건에 맞는 명소가 없습니다.'
                : `${selectedCategory} 카테고리의 명소가 없습니다.`}
            </p>
          </div>
        )}

        {!isLoading && !error && spots.length === 0 && (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <p className="text-sm text-gray-500">표시할 명소가 없습니다.</p>
          </div>
        )}

        {!isLoading && !error && filteredSpots.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {filteredSpots.length}곳 표시 중
              {selectedCategory !== '전체' && ` · ${selectedCategory}`}
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
