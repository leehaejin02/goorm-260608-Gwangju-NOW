import { useCallback, useEffect, useRef, useState } from 'react'
import type { Event } from '../../types/event'
import type { ParkingLot } from '../../types/parking'
import type { Restaurant } from '../../types/restaurant'
import { createEventMarkers } from './EventMarker'
import { createParkingMarkers } from './ParkingMarker'
import { createRestaurantMarkers } from './RestaurantMarker'
import MyLocationButton from './MyLocationButton'

const DEFAULT_CENTER = { lat: 35.1595, lng: 126.8526 }

export interface KakaoMapProps {
  events: Event[]
  parkingLots: ParkingLot[]
  restaurants?: Restaurant[]
  showEvents?: boolean
  showParking?: boolean
  showRestaurants?: boolean
  selectedEventId?: string | null
  onEventSelect?: (eventId: string) => void
  center?: { lat: number; lng: number }
  level?: number
}

function waitForKakaoMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve())
      return
    }

    const existing = document.querySelector('script[data-kakao-map]')
    if (existing) {
      existing.addEventListener('load', () => {
        window.kakao.maps.load(() => resolve())
      })
      return
    }

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!appKey) {
      reject(new Error('Kakao Map API 키가 설정되지 않았습니다.'))
      return
    }

    const script = document.createElement('script')
    script.dataset.kakaoMap = 'true'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.onload = () => window.kakao.maps.load(() => resolve())
    script.onerror = () => reject(new Error('카카오맵 SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })
}

function createMyLocationOverlay(
  map: kakao.maps.Map,
  lat: number,
  lng: number,
): kakao.maps.CustomOverlay {
  const container = document.createElement('div')
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;'

  const dot = document.createElement('div')
  dot.style.cssText =
    'width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25)'

  const label = document.createElement('span')
  label.textContent = '내 위치'
  label.style.cssText =
    'margin-top:4px;font-size:11px;font-weight:600;color:#2563eb;background:white;padding:2px 8px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.15);white-space:nowrap'

  container.appendChild(dot)
  container.appendChild(label)

  return new kakao.maps.CustomOverlay({
    map,
    position: new kakao.maps.LatLng(lat, lng),
    content: container,
    yAnchor: 1,
  })
}

export default function KakaoMap({
  events,
  parkingLots,
  restaurants = [],
  showEvents = true,
  showParking = true,
  showRestaurants = false,
  selectedEventId = null,
  onEventSelect,
  center = DEFAULT_CENTER,
  level = 12,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const myLocationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null)
  const onEventSelectRef = useRef(onEventSelect)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)

  onEventSelectRef.current = onEventSelect

  const handleLocate = useCallback((lat: number, lng: number) => {
    const map = mapRef.current
    if (!map) return

    setMyLocation({ lat, lng })
    map.setCenter(new kakao.maps.LatLng(lat, lng))
    map.setLevel(4)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!containerRef.current) return

      try {
        await waitForKakaoMap()
        if (cancelled || !containerRef.current) return

        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng)
        const map = new kakao.maps.Map(containerRef.current, {
          center: mapCenter,
          level,
        })
        mapRef.current = map
        setMapError(null)
        setMapReady(true)
      } catch (error) {
        setMapError(
          error instanceof Error ? error.message : '지도를 불러오지 못했습니다.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    initMap()

    return () => {
      cancelled = true
      overlaysRef.current.forEach((overlay) => overlay.setMap(null))
      overlaysRef.current = []
      myLocationOverlayRef.current?.setMap(null)
      myLocationOverlayRef.current = null
      mapRef.current = null
      setMapReady(false)
    }
  }, [center.lat, center.lng, level])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    overlaysRef.current.forEach((overlay) => overlay.setMap(null))

    const overlays: kakao.maps.CustomOverlay[] = []
    const selectHandler = (eventId: string) => onEventSelectRef.current?.(eventId)

    if (showEvents) {
      overlays.push(
        ...createEventMarkers(map, events, {
          selectedEventId,
          onEventSelect: selectHandler,
        }),
      )
    }
    if (showParking) {
      overlays.push(...createParkingMarkers(map, parkingLots))
    }
    if (showRestaurants) {
      overlays.push(...createRestaurantMarkers(map, restaurants))
    }

    overlaysRef.current = overlays
  }, [
    mapReady,
    events,
    parkingLots,
    restaurants,
    showEvents,
    showParking,
    showRestaurants,
    selectedEventId,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !selectedEventId) return

    const event = events.find((item) => item.id === selectedEventId)
    if (event?.lat == null || event?.lng == null) return

    map.setCenter(new kakao.maps.LatLng(event.lat, event.lng))
    map.setLevel(5)
  }, [selectedEventId, events, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !myLocation) return

    myLocationOverlayRef.current?.setMap(null)
    myLocationOverlayRef.current = createMyLocationOverlay(
      map,
      myLocation.lat,
      myLocation.lng,
    )

    return () => {
      myLocationOverlayRef.current?.setMap(null)
      myLocationOverlayRef.current = null
    }
  }, [myLocation])

  if (mapError) {
    return (
      <div className="flex h-full min-h-[450px] items-center justify-center rounded-xl border border-red-200 bg-red-50">
        <p className="text-sm text-red-600">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[450px] overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도 로딩 중...</p>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      {!isLoading && (
        <div className="absolute bottom-4 right-4 z-10">
          <MyLocationButton onLocate={handleLocate} />
        </div>
      )}
    </div>
  )
}
