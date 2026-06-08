import { create } from 'zustand'

import { fetchGwangjuEvents } from '../api/eventApi'

import { applyEventFilters, type DateFilter } from '../lib/eventFilters'

import type { Event, EventCategory } from '../types/event'



export interface EventStore {

  events: Event[]

  filteredEvents: Event[]

  selectedCategory: EventCategory

  searchQuery: string

  dateFilter: DateFilter

  isLoading: boolean

  error: string | null

  fetchEvents: () => Promise<void>

  setCategory: (category: EventCategory) => void

  setSearchQuery: (query: string) => void

  setDateFilter: (filter: DateFilter) => void

}



function applyFilters(

  events: Event[],

  category: EventCategory,

  searchQuery: string,

  dateFilter: DateFilter,

): Event[] {

  return applyEventFilters(events, {

    category,

    searchQuery,

    dateFilter,

  })

}



export const useEventStore = create<EventStore>((set, get) => ({

  events: [],

  filteredEvents: [],

  selectedCategory: '전체',

  searchQuery: '',

  dateFilter: 'all',

  isLoading: false,

  error: null,



  fetchEvents: async () => {

    set({ isLoading: true, error: null })

    try {

      const events = await fetchGwangjuEvents()

      const { selectedCategory, searchQuery, dateFilter } = get()

      set({

        events,

        filteredEvents: applyFilters(events, selectedCategory, searchQuery, dateFilter),

        isLoading: false,

      })

    } catch (error) {

      set({

        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',

        isLoading: false,

      })

    }

  },



  setCategory: (category) => {

    const { events, searchQuery, dateFilter } = get()

    set({

      selectedCategory: category,

      filteredEvents: applyFilters(events, category, searchQuery, dateFilter),

    })

  },



  setSearchQuery: (query) => {

    const { events, selectedCategory, dateFilter } = get()

    set({

      searchQuery: query,

      filteredEvents: applyFilters(events, selectedCategory, query, dateFilter),

    })

  },



  setDateFilter: (filter) => {

    const { events, selectedCategory, searchQuery } = get()

    set({

      dateFilter: filter,

      filteredEvents: applyFilters(events, selectedCategory, searchQuery, filter),

    })

  },

}))

export const selectHeroSlides = (state: EventStore) =>
  state.events
    .filter((e) => e.imageUrl && e.imageUrl.trim() !== '')
    .slice(0, 5)
    .map((e) => ({
      imageUrl: e.imageUrl,
      title: e.title,
      place: e.place,
      category: e.category,
      startDate: e.startDate,
    }))

