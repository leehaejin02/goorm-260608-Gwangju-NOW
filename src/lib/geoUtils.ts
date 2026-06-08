import type { Event } from '../types/event'
import type { ParkingLot, ParkingLotWithDistance } from '../types/parking'
import type { Restaurant, RestaurantWithDistance } from '../types/restaurant'

const EARTH_RADIUS_KM = 6371

interface GeoPoint {
  lat: number
  lng: number
}

interface WithOptionalCoords {
  lat?: number
  lng?: number
}

/** 에이전트·TourAPI 등에서 들어온 좌표 보정 (스케일·위경도 뒤바뀜) */
export function normalizeCourseLatLng(
  lat?: number,
  lng?: number,
): { lat: number; lng: number } | null {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null

  let la = lat
  let ln = lng

  if (Math.abs(la) > 1000) la = la / 10_000_000
  if (Math.abs(ln) > 1000) ln = ln / 10_000_000

  // lat/lng 뒤바뀜 (한국: lat 33~39, lng 124~132)
  if (la >= 124 && la <= 132 && ln >= 33 && ln <= 39) {
    ;[la, ln] = [ln, la]
  }

  if (la < -90 || la > 90 || ln < -180 || ln > 180) return null

  return { lat: la, lng: ln }
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getNearbyPlaces<T extends WithOptionalCoords>(
  origin: Pick<Event, 'lat' | 'lng'>,
  places: T[],
  options: { radiusKm?: number; limit?: number } = {},
): (T & { distanceKm: number })[] {
  const { radiusKm = 3, limit = 5 } = options

  if (origin.lat == null || origin.lng == null) return []

  return places
    .filter((place): place is T & GeoPoint => place.lat != null && place.lng != null)
    .map((place) => ({
      ...place,
      distanceKm: getDistanceKm(origin.lat!, origin.lng!, place.lat, place.lng),
    }))
    .filter((place) => place.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

export function getNearbyParkingLots(
  event: Pick<Event, 'lat' | 'lng'>,
  parkingLots: ParkingLot[],
  options: { radiusKm?: number; limit?: number } = {},
): ParkingLotWithDistance[] {
  return getNearbyPlaces(event, parkingLots, options)
}

export function getNearbyRestaurants(
  event: Pick<Event, 'lat' | 'lng'>,
  restaurants: Restaurant[],
  options: { radiusKm?: number; limit?: number } = {},
): RestaurantWithDistance[] {
  return getNearbyPlaces(event, restaurants, options)
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}
