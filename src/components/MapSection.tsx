import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../types/event'
import type { ParkingLot } from '../types/parking'
import type { Restaurant } from '../types/restaurant'
import { fetchGwangjuParkingLots } from '../api/parkingApi'
import { fetchGwangjuRestaurants } from '../api/restaurantApi'
import KakaoMap from './map/KakaoMap'
import MapEventList from './map/MapEventList'
import LoadingSpinner from './common/LoadingSpinner'

interface MapSectionProps {
  events: Event[]
}

type MapLayer = 'events' | 'parking' | 'restaurants'

const LAYER_OPTIONS: { id: MapLayer; label: string; color: string }[] = [
  { id: 'events', label: '행사', color: 'bg-[#378ADD]' },
  { id: 'parking', label: '주차', color: 'bg-[#F97316]' },
  { id: 'restaurants', label: '맛집', color: 'bg-emerald-500' },
]

export default function MapSection({ events }: MapSectionProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    events: true,
    parking: true,
    restaurants: false,
  })
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const eventsWithCoords = events.filter(
    (event) => event.lat != null && event.lng != null,
  )

  const restaurantsWithCoords = restaurants.filter(
    (restaurant) => restaurant.lat != null && restaurant.lng != null,
  )

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchGwangjuParkingLots(), fetchGwangjuRestaurants()])
      .then(([lots, restaurantList]) => {
        if (!cancelled) {
          setParkingLots(lots)
          setRestaurants(restaurantList.slice(0, 20))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedEventId && !eventsWithCoords.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(null)
    }
  }, [eventsWithCoords, selectedEventId])

  const toggleLayer = (layer: MapLayer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEventId((prev) => (prev === eventId ? null : eventId))
  }, [])

  return (
    <section id="map" className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">행사 지도</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            필터된 행사·주차·맛집을 지도에서 확인하고 길찾기로 이동하세요
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {LAYER_OPTIONS.map(({ id, label, color }) => {
            const active = layers[id]
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleLayer(id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-gray-300 bg-white text-gray-900 shadow-sm'
                    : 'border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${active ? color : 'bg-gray-300'}`} />
                {label}
              </button>
            )
          })}
          <span className="text-xs text-gray-400">
            행사 {eventsWithCoords.length} · 주차 {parkingLots.length} · 맛집{' '}
            {restaurantsWithCoords.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="h-[450px]">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_280px]">
              <KakaoMap
                events={eventsWithCoords}
                parkingLots={parkingLots}
                restaurants={restaurantsWithCoords}
                showEvents={layers.events}
                showParking={layers.parking}
                showRestaurants={layers.restaurants}
                selectedEventId={selectedEventId}
                onEventSelect={handleEventSelect}
              />
              {layers.events && (
                <div className="border-t border-gray-100 lg:border-l lg:border-t-0">
                  <MapEventList
                    events={eventsWithCoords}
                    selectedEventId={selectedEventId}
                    onSelect={handleEventSelect}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
