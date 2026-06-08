import type { Event } from '../types/event'
import type { Restaurant } from '../types/restaurant'
import type { Spot } from '../types/spot'
import { getKakaoDirectionsUrl } from './kakaoMapLinks'

export interface AgentPoiCatalogEntry {
  item_type: 'event' | 'spot' | 'restaurant'
  ref_id: string
  title: string
  lat?: number
  lng?: number
  link?: string
}

export function buildPoiCatalog(
  events: Event[],
  spots: Spot[],
  restaurants: Restaurant[],
): AgentPoiCatalogEntry[] {
  const catalog: AgentPoiCatalogEntry[] = []

  for (const event of events) {
    catalog.push({
      item_type: 'event',
      ref_id: event.id,
      title: event.title,
      lat: event.lat,
      lng: event.lng,
      link: `/events/${event.id}`,
    })
  }

  for (const spot of spots) {
    catalog.push({
      item_type: 'spot',
      ref_id: spot.id,
      title: spot.title,
      lat: spot.lat,
      lng: spot.lng,
      link:
        spot.lat != null && spot.lng != null
          ? getKakaoDirectionsUrl(spot.title, spot.lat, spot.lng)
          : undefined,
    })
  }

  for (const restaurant of restaurants) {
    catalog.push({
      item_type: 'restaurant',
      ref_id: restaurant.id,
      title: restaurant.name,
      lat: restaurant.lat,
      lng: restaurant.lng,
      link: restaurant.placeUrl,
    })
  }

  return catalog
}
