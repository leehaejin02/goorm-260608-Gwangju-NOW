import type { Event } from '../types/event'
import type { ParkingLotWithDistance } from '../types/parking'
import type { Restaurant, RestaurantWithDistance } from '../types/restaurant'
import type { Spot } from '../types/spot'
import type { CourseItem, CourseItemType, SavedCourse } from '../types/course'
import { getKakaoDirectionsUrl } from './kakaoMapLinks'
import { normalizeCourseLatLng } from './geoUtils'

const COURSE_SHARE_LABELS: Record<CourseItemType, string> = {
  event: '행사',
  restaurant: '맛집',
  parking: '주차',
  spot: '명소',
}

export function courseItemFromEvent(event: Event): CourseItem {
  return {
    id: `event-${event.id}`,
    type: 'event',
    title: event.title,
    subtitle: event.place,
    refId: event.id,
    link: `/events/${event.id}`,
    lat: event.lat,
    lng: event.lng,
  }
}

export function courseItemFromRestaurant(
  restaurant: Restaurant | RestaurantWithDistance,
): CourseItem {
  return {
    id: `restaurant-${restaurant.id}`,
    type: 'restaurant',
    title: restaurant.name,
    subtitle: restaurant.address,
    refId: restaurant.id,
    link: restaurant.placeUrl,
    lat: restaurant.lat,
    lng: restaurant.lng,
  }
}

export function courseItemFromParking(lot: ParkingLotWithDistance): CourseItem {
  return {
    id: `parking-${lot.name}-${lot.address}`,
    type: 'parking',
    title: lot.name,
    subtitle: lot.address,
    refId: `${lot.name}-${lot.address}`,
    lat: lot.lat,
    lng: lot.lng,
  }
}

export function courseItemFromSpot(spot: Spot): CourseItem {
  const link =
    spot.lat != null && spot.lng != null
      ? getKakaoDirectionsUrl(spot.title, spot.lat, spot.lng)
      : undefined

  return {
    id: `spot-${spot.id}`,
    type: 'spot',
    title: spot.title,
    subtitle: spot.address,
    refId: spot.id,
    link,
    lat: spot.lat,
    lng: spot.lng,
  }
}

export function formatCourseForShare(
  course: SavedCourse | { title: string; items: CourseItem[] },
  origin?: string,
): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const lines = course.items.map((item, i) => {
    const time = item.timeSlot ? `${item.timeSlot} ` : ''
    return `${i + 1}. ${time}[${COURSE_SHARE_LABELS[item.type]}] ${item.title} — ${item.subtitle}`
  })
  return `[Gwangju NOW] ${course.title}\n\n${lines.join('\n')}${base ? `\n\n${base}/#my-course` : ''}`
}

export function buildCourseContext(items: CourseItem[]): string {
  if (items.length === 0) return ''

  return items
    .map((item, i) => {
      const time = item.timeSlot ? `${item.timeSlot} ` : ''
      const label = COURSE_SHARE_LABELS[item.type]
      return `${i + 1}. [item_id:${item.id}] ${time}[${label}] ${item.title} | ${item.subtitle}`
    })
    .join('\n')
}

export function generateCourseTitle(items: CourseItem[]): string {
  const event = items.find((i) => i.type === 'event')
  if (event) return `${event.title} 나들이 코스`
  const spot = items.find((i) => i.type === 'spot')
  if (spot) return `${spot.title} 주변 코스`
  if (items.length > 0) return `광주 나들이 코스 (${items.length}곳)`
  return '나의 광주 코스'
}

const TYPE_CHIP_LABELS: Record<CourseItemType, string> = {
  event: '🎭',
  spot: '🏞️',
  restaurant: '🍽️',
  parking: '🅿️',
}

export function countCourseItemTypes(items: CourseItem[]): Partial<Record<CourseItemType, number>> {
  const counts: Partial<Record<CourseItemType, number>> = {}
  for (const item of items) {
    counts[item.type] = (counts[item.type] ?? 0) + 1
  }
  return counts
}

export function formatCourseTypeChips(items: CourseItem[]): string {
  const counts = countCourseItemTypes(items)
  return (Object.entries(counts) as [CourseItemType, number][])
    .filter(([, n]) => n > 0)
    .map(([type, n]) => `${TYPE_CHIP_LABELS[type]}${n}`)
    .join(' · ')
}

export interface CourseItemLookup {
  events: Event[]
  spots: Spot[]
  restaurants: Restaurant[]
}

function findSpot(lookup: CourseItemLookup, item: CourseItem): Spot | undefined {
  return (
    lookup.spots.find((s) => s.id === item.refId) ??
    lookup.spots.find((s) => s.title === item.title)
  )
}

function findEvent(lookup: CourseItemLookup, item: CourseItem): Event | undefined {
  return (
    lookup.events.find((e) => e.id === item.refId) ??
    lookup.events.find((e) => e.title === item.title)
  )
}

function findRestaurant(lookup: CourseItemLookup, item: CourseItem): Restaurant | undefined {
  return (
    lookup.restaurants.find((r) => r.id === item.refId) ??
    lookup.restaurants.find((r) => r.name === item.title)
  )
}

/** 에이전트 add_to_course — 좌표·링크 보강 */
export function enrichCourseItem(item: CourseItem, lookup: CourseItemLookup): CourseItem {
  let enriched = item

  if (item.lat == null || item.lng == null) {
    switch (item.type) {
      case 'spot': {
        const spot = findSpot(lookup, item)
        if (spot?.lat != null && spot?.lng != null) {
          enriched = {
            ...item,
            lat: spot.lat,
            lng: spot.lng,
            link:
              item.link ??
              getKakaoDirectionsUrl(spot.title, spot.lat, spot.lng),
          }
        }
        break
      }
      case 'event': {
        const event = findEvent(lookup, item)
        if (event) {
          enriched = {
            ...item,
            lat: event.lat,
            lng: event.lng,
            link: item.link ?? `/events/${event.id}`,
          }
        }
        break
      }
      case 'restaurant': {
        const restaurant = findRestaurant(lookup, item)
        if (restaurant?.lat != null && restaurant?.lng != null) {
          enriched = {
            ...item,
            lat: restaurant.lat,
            lng: restaurant.lng,
            link: item.link ?? restaurant.placeUrl,
          }
        }
        break
      }
    }
  }

  const normalized = normalizeCourseLatLng(enriched.lat, enriched.lng)
  if (normalized) {
    return { ...enriched, lat: normalized.lat, lng: normalized.lng }
  }

  if (enriched.lat != null || enriched.lng != null) {
    return { ...enriched, lat: undefined, lng: undefined }
  }

  return enriched
}

export function enrichCourseItems(
  items: CourseItem[],
  lookup: CourseItemLookup,
): CourseItem[] {
  return items.map((item) => enrichCourseItem(item, lookup))
}
