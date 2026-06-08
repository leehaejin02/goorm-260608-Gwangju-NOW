import { create } from 'zustand'
import { fetchGwangjuSpots } from '../api/spotApi'
import { applySpotFilters } from '../lib/spotFilters'
import type { Spot, SpotFilterCategory } from '../types/spot'

interface SpotStore {
  spots: Spot[]
  filteredSpots: Spot[]
  selectedCategory: SpotFilterCategory
  searchQuery: string
  isLoading: boolean
  error: string | null
  fetchSpots: (force?: boolean) => Promise<void>
  setCategory: (category: SpotFilterCategory) => void
  setSearchQuery: (query: string) => void
}

function applyFilters(
  spots: Spot[],
  category: SpotFilterCategory,
  searchQuery: string,
): Spot[] {
  return applySpotFilters(spots, { category, searchQuery })
}

export const useSpotStore = create<SpotStore>((set, get) => ({
  spots: [],
  filteredSpots: [],
  selectedCategory: '전체',
  searchQuery: '',
  isLoading: false,
  error: null,

  fetchSpots: async (force = false) => {
    const { spots, isLoading } = get()
    if (!force && (spots.length > 0 || isLoading)) return

    set({ isLoading: true, error: null })

    try {
      const loaded = await fetchGwangjuSpots()
      const { selectedCategory, searchQuery } = get()

      set({
        spots: loaded,
        filteredSpots: applyFilters(loaded, selectedCategory, searchQuery),
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '명소 정보를 불러오지 못했습니다.',
        isLoading: false,
      })
    }
  },

  setCategory: (category) => {
    const { spots, searchQuery } = get()
    set({
      selectedCategory: category,
      filteredSpots: applyFilters(spots, category, searchQuery),
    })
  },

  setSearchQuery: (query) => {
    const { spots, selectedCategory } = get()
    set({
      searchQuery: query,
      filteredSpots: applyFilters(spots, selectedCategory, query),
    })
  },
}))
