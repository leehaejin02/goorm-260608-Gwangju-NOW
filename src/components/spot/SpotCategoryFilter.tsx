import type { SpotFilterCategory } from '../../types/spot'
import { SPOT_FILTER_CATEGORIES } from '../../lib/spotFilters'

interface SpotCategoryFilterProps {
  selected: SpotFilterCategory
  onChange: (category: SpotFilterCategory) => void
  counts?: Partial<Record<SpotFilterCategory, number>>
}

export default function SpotCategoryFilter({
  selected,
  onChange,
  counts,
}: SpotCategoryFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {SPOT_FILTER_CATEGORIES.map((category) => {
        const count = counts?.[category]
        const label = count != null ? `${category} (${count})` : category

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected === category
                ? 'bg-[#378ADD] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
