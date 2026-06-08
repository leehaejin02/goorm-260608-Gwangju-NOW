interface RestaurantSearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  isSearching: boolean
}

export default function RestaurantSearchBar({
  query,
  onQueryChange,
  onSearch,
  isSearching,
}: RestaurantSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label htmlFor="restaurant-search" className="mb-2 block text-sm font-semibold text-gray-900">
        맛집 직접 찾기
      </label>
      <div className="flex gap-2">
        <input
          id="restaurant-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="가고 싶은 음식점 이름 (예: 송정 떡갈비, 양동 순대)"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="shrink-0 rounded-xl bg-[#378ADD] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2d6fc4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? '검색 중…' : '검색'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">광주 지역 음식점 · 검색 결과에서 코스에 담을 수 있어요</p>
    </form>
  )
}
