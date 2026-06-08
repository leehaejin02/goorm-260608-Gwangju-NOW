import type { Spot, SpotFilterCategory } from '../types/spot'

export function applySpotFilters(
  spots: Spot[],
  options: { category: SpotFilterCategory; searchQuery: string },
): Spot[] {
  let result = spots

  if (options.category !== '전체') {
    result = result.filter((spot) => spot.category === options.category)
  }

  const query = options.searchQuery.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (spot) =>
        spot.title.toLowerCase().includes(query) ||
        spot.address.toLowerCase().includes(query) ||
        spot.description.toLowerCase().includes(query),
    )
  }

  return result
}

export function getSpotCategoryCounts(spots: Spot[]): Record<SpotFilterCategory, number> {
  return {
    전체: spots.length,
    관광지: spots.filter((s) => s.category === '관광지').length,
    문화시설: spots.filter((s) => s.category === '문화시설').length,
    레포츠: spots.filter((s) => s.category === '레포츠').length,
    쇼핑: spots.filter((s) => s.category === '쇼핑').length,
  }
}

export const SPOT_FILTER_CATEGORIES: SpotFilterCategory[] = [
  '전체',
  '관광지',
  '문화시설',
  '레포츠',
  '쇼핑',
]

export function parseSpotCategoryParam(value: string | null): SpotFilterCategory {
  if (value && SPOT_FILTER_CATEGORIES.includes(value as SpotFilterCategory)) {
    return value as SpotFilterCategory
  }
  return '전체'
}
