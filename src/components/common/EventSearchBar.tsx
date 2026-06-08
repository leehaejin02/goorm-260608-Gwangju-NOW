import type { DateFilter } from '../../lib/eventFilters'

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'thisWeek', label: '이번 주' },
  { value: 'thisMonth', label: '이번 달' },
]

interface EventSearchBarProps {
  searchQuery: string
  dateFilter: DateFilter
  onSearchChange: (query: string) => void
  onDateFilterChange: (filter: DateFilter) => void
}

export default function EventSearchBar({
  searchQuery,
  dateFilter,
  onSearchChange,
  onDateFilterChange,
}: EventSearchBarProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="행사명, 장소, 키워드 검색..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onDateFilterChange(value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              dateFilter === value
                ? 'bg-[#378ADD] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
