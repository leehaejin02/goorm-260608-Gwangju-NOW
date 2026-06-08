import { useEffect, useState } from 'react'
import { fetchGwangjuRestaurants, searchGwangjuRestaurants } from '../../api/restaurantApi'
import type { Restaurant } from '../../types/restaurant'
import RestaurantCard from './RestaurantCard'
import RestaurantCardSkeleton from './RestaurantCardSkeleton'
import RestaurantSearchBar from './RestaurantSearchBar'
import ErrorMessage from '../common/ErrorMessage'
import SectionHeading from '../common/SectionHeading'

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

  const cardGrid = (items: Restaurant[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )

  const skeletonGrid = (count: number) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  )

  return (
    <section id="restaurants" className="gj-section-bg">
      <div className="gj-container">
        <SectionHeading
          badge="맛집·카페"
          title="광주 맛집"
          subtitle="추천 맛집을 보거나, 원하는 음식점을 직접 검색해 코스에 담아보세요"
        />

        <RestaurantSearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {isSearchMode && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gj-sub">
              「{lastSearched}」 검색 결과 {searchResults.length}곳
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-medium text-gj-purple hover:underline"
            >
              추천 맛집으로 돌아가기
            </button>
          </div>
        )}

        {!isSearchMode && isLoading && skeletonGrid(6)}

        {!isSearchMode && !isLoading && error && (
          <ErrorMessage message={error} onRetry={loadRecommended} />
        )}

        {isSearchMode && isSearching && skeletonGrid(3)}

        {isSearchMode && !isSearching && searchError && (
          <ErrorMessage message={searchError} onRetry={handleSearch} />
        )}

        {!isSearching && !error && !searchError && displayList.length > 0 && (
          <>
            {!isSearchMode && (
              <p className="mb-4 text-sm font-medium text-gj-sub">추천 맛집</p>
            )}
            {cardGrid(displayList)}
          </>
        )}

        {isSearchMode && !isSearching && !searchError && searchResults.length === 0 && (
          <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-gj-border bg-white">
            <p className="text-sm text-gj-sub">검색 결과가 없습니다. 다른 키워드로 시도해 보세요.</p>
          </div>
        )}
      </div>
    </section>
  )
}
