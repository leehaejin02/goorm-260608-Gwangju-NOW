import type { EventCategory } from '../../types/event'

const CATEGORIES: EventCategory[] = ['전체', '축제', '공연', '전시']

interface CategoryFilterProps {
  selected: EventCategory
  onChange: (category: EventCategory) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
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
          {category}
        </button>
      ))}
    </div>
  )
}
