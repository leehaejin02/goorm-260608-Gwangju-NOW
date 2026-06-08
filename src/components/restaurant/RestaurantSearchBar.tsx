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
      <div className="flex gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <input
          id="restaurant-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="가고 싶은 음식점 이름 (예: 송정 떡갈비, 양동 순대)"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="shrink-0 bg-brand px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? '검색 중…' : '검색'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">광주 지역 음식점 · 검색 결과에서 코스에 담을 수 있어요</p>
    </form>
  )
}
