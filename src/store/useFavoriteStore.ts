import { create } from 'zustand'
import type { Event } from '../types/event'
import type { Restaurant } from '../types/restaurant'

const EVENT_STORAGE_KEY = 'gwangju_now_favorites'
const RESTAURANT_STORAGE_KEY = 'gwangju_now_restaurant_favorites'

interface FavoriteStore {
  favorites: Event[]
  restaurantFavorites: Restaurant[]
  addFavorite: (event: Event) => void
  removeFavorite: (eventId: string) => void
  isFavorite: (eventId: string) => boolean
  addRestaurantFavorite: (restaurant: Restaurant) => void
  removeRestaurantFavorite: (restaurantId: string) => void
  isRestaurantFavorite: (restaurantId: string) => boolean
  loadFromStorage: () => void
}

function saveEventFavorites(favorites: Event[]) {
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(favorites))
}

function saveRestaurantFavorites(favorites: Restaurant[]) {
  localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(favorites))
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  restaurantFavorites: [],

  addFavorite: (event) => {
    const { favorites } = get()
    if (favorites.some((item) => item.id === event.id)) return
    const next = [...favorites, event]
    saveEventFavorites(next)
    set({ favorites: next })
  },

  removeFavorite: (eventId) => {
    const next = get().favorites.filter((item) => item.id !== eventId)
    saveEventFavorites(next)
    set({ favorites: next })
  },

  isFavorite: (eventId) => get().favorites.some((item) => item.id === eventId),

  addRestaurantFavorite: (restaurant) => {
    const { restaurantFavorites } = get()
    if (restaurantFavorites.some((item) => item.id === restaurant.id)) return
    const next = [...restaurantFavorites, restaurant]
    saveRestaurantFavorites(next)
    set({ restaurantFavorites: next })
  },

  removeRestaurantFavorite: (restaurantId) => {
    const next = get().restaurantFavorites.filter((item) => item.id !== restaurantId)
    saveRestaurantFavorites(next)
    set({ restaurantFavorites: next })
  },

  isRestaurantFavorite: (restaurantId) =>
    get().restaurantFavorites.some((item) => item.id === restaurantId),

  loadFromStorage: () => {
    const eventRaw = localStorage.getItem(EVENT_STORAGE_KEY)
    const restaurantRaw = localStorage.getItem(RESTAURANT_STORAGE_KEY)

    let favorites: Event[] = []
    let restaurantFavorites: Restaurant[] = []

    if (eventRaw) {
      try {
        favorites = JSON.parse(eventRaw) as Event[]
      } catch {
        localStorage.removeItem(EVENT_STORAGE_KEY)
      }
    }

    if (restaurantRaw) {
      try {
        restaurantFavorites = JSON.parse(restaurantRaw) as Restaurant[]
      } catch {
        localStorage.removeItem(RESTAURANT_STORAGE_KEY)
      }
    }

    set({ favorites, restaurantFavorites })
  },
}))
