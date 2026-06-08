import { useEffect, useRef, useState } from 'react'
import type { CourseItem } from '../../types/course'
import { normalizeCourseLatLng } from '../../lib/geoUtils'
import { createCourseMarkers, fitMapToCourseItems } from './CourseMarker'

const DEFAULT_CENTER = { lat: 35.1595, lng: 126.8526 }

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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.onload = () => window.kakao.maps.load(() => resolve())
    script.onerror = () => reject(new Error('카카오맵 SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })
}

function relayoutMap(map: kakao.maps.Map) {
  requestAnimationFrame(() => {
    map.relayout()
  })
}

interface CourseMapProps {
  items: CourseItem[]
  compact?: boolean
}

export default function CourseMap({ items, compact = false }: CourseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  const mappableItems = items.filter((item) => normalizeCourseLatLng(item.lat, item.lng) != null)

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!containerRef.current) return

      try {
        await waitForKakaoMap()
        if (cancelled || !containerRef.current) return

        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          level: 8,
        })
        mapRef.current = map
        setMapError(null)
        setMapReady(true)
        relayoutMap(map)
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
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const map = mapRef.current
    if (!container || !map || !mapReady) return

    const observer = new ResizeObserver(() => relayoutMap(map))
    observer.observe(container)
    return () => observer.disconnect()
  }, [mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const { overlays, polyline } = createCourseMarkers(map, items)
    fitMapToCourseItems(map, items)
    relayoutMap(map)

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null))
      polyline?.setMap(null)
    }
  }, [items, mapReady])

  const mapHeight = compact ? 'h-[120px]' : 'h-[280px]'

  if (mappableItems.length === 0) {
    return (
      <div className={`flex ${mapHeight} items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50`}>
        <p className={`text-gray-500 ${compact ? 'text-xs px-3 text-center' : 'text-sm'}`}>
          {compact ? '위치 정보 없음' : '위치 정보가 있는 장소를 담으면 동선 지도가 표시됩니다.'}
        </p>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className={`flex ${mapHeight} items-center justify-center rounded-xl border border-red-200 bg-red-50`}>
        <p className="text-sm text-red-600">{mapError}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${mapHeight} overflow-hidden rounded-xl border border-gray-200`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도 로딩 중...</p>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      {!compact && (
        <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm">
          {mappableItems.length}곳 · 순서대로 연결
        </div>
      )}
    </div>
  )
}
