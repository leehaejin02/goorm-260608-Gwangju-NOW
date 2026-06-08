export interface Restaurant {
  id: string
  name: string
  address: string
  category: string
  imageUrl: string
  description: string
  lat?: number
  lng?: number
  tel?: string
  placeUrl?: string
}

export interface RestaurantWithDistance extends Restaurant {
  distanceKm: number
}
