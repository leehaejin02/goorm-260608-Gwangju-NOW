interface SpotSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function SpotSearchBar({ searchQuery, onSearchChange }: SpotSearchBarProps) {
  return (
    <div className="mb-4">
      <label htmlFor="spot-search" className="sr-only">
        명소 검색
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        <input
          id="spot-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="명소 이름, 주소로 검색"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20"
        />
      </div>
    </div>
  )
}
