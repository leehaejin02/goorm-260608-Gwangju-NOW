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
    <div className="mb-3 space-y-2">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gj-hint"
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
          className="w-full rounded-xl border border-gj-border bg-white py-2.5 pl-9 pr-3 text-[11px] text-gj-dark placeholder:text-gj-hint focus:border-gj-purple focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onDateFilterChange(value)}
            className={`chip ${dateFilter === value ? 'chip-active' : 'chip-inactive'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
