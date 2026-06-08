import { useEffect, useState } from 'react'
import { fetchGwangjuRestaurants, searchGwangjuRestaurants } from '../../api/restaurantApi'
import type { Restaurant } from '../../types/restaurant'
import RestaurantCard from './RestaurantCard'
import RestaurantCardSkeleton from './RestaurantCardSkeleton'
import RestaurantSearchBar from './RestaurantSearchBar'
import ErrorMessage from '../common/ErrorMessage'

export default function RestaurantSection() {
  const [recommended, setRecommended] = useState<Restaurant[]>([])
  const [searchResults, setSearchResults] = useState<Restaurant[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearched, setLastSearched] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const loadRecommended = () => {
    setIsLoading(true)
    setError(null)

    fetchGwangjuRestaurants()
      .then((data) => setRecommended(data.slice(0, 6)))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '맛집 정보를 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadRecommended()
  }, [])

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setIsSearching(true)
    setSearchError(null)
    setLastSearched(trimmed)

    searchGwangjuRestaurants(trimmed)
      .then(setSearchResults)
      .catch((err: unknown) => {
        setSearchError(err instanceof Error ? err.message : '검색에 실패했습니다.')
        setSearchResults([])
      })
      .finally(() => setIsSearching(false))
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    setSearchError(null)
    setLastSearched('')
  }

  const displayList = searchResults ?? recommended
  const isSearchMode = searchResults !== null

  return (
    <section id="restaurants" className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">광주 맛집</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            추천 맛집을 보거나, 원하는 음식점을 직접 검색해 코스에 담아보세요
          </p>
        </div>

        <RestaurantSearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {isSearchMode && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              「{lastSearched}」 검색 결과 {searchResults.length}곳
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-medium text-[#378ADD] hover:underline"
            >
              추천 맛집으로 돌아가기
            </button>
          </div>
        )}

        {!isSearchMode && isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isSearchMode && !isLoading && error && (
          <ErrorMessage message={error} onRetry={loadRecommended} />
        )}

        {isSearchMode && isSearching && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isSearchMode && !isSearching && searchError && (
          <ErrorMessage message={searchError} onRetry={handleSearch} />
        )}

        {!isSearching && !error && !searchError && displayList.length > 0 && (
          <>
            {!isSearchMode && (
              <p className="mb-4 text-sm font-medium text-gray-500">추천 맛집</p>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayList.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </>
        )}

        {isSearchMode && !isSearching && !searchError && searchResults.length === 0 && (
          <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <p className="text-sm text-gray-500">검색 결과가 없습니다. 다른 키워드로 시도해 보세요.</p>
          </div>
        )}
      </div>
    </section>
  )
}
