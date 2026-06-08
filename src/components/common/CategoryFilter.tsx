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
          className={`chip ${selected === category ? 'chip-active' : 'chip-inactive'}`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
