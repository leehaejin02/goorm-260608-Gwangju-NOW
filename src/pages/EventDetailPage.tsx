import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import KakaoMap from '../components/map/KakaoMap'
import AISummaryBadge from '../components/event/AISummaryBadge'
import FavoriteButton from '../components/event/FavoriteButton'
import EventImage from '../components/event/EventImage'
import EventShareActions from '../components/event/EventShareActions'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { fetchEventById } from '../api/eventApi'
import { fetchGwangjuParkingLots } from '../api/parkingApi'
import { fetchNearbyRestaurants } from '../api/restaurantApi'
import { useEventStore } from '../store/useEventStore'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatDistanceKm, getNearbyParkingLots } from '../lib/geoUtils'
import type { Event } from '../types/event'
import type { ParkingLotWithDistance } from '../types/parking'
import type { RestaurantWithDistance } from '../types/restaurant'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import AddToCourseButton from '../components/course/AddToCourseButton'
import FloatingCourseBar from '../components/course/FloatingCourseBar'
import { courseItemFromEvent, courseItemFromParking, courseItemFromRestaurant } from '../lib/courseUtils'

const categoryStyles = {
  축제: 'bg-orange-100 text-orange-700',
  공연: 'bg-purple-100 text-purple-700',
  전시: 'bg-green-100 text-green-700',
  기타: 'bg-gray-100 text-gray-600',
} as const

function formatDateRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const startStr = new Date(start).toLocaleDateString('ko-KR', options)
  const endStr = new Date(end).toLocaleDateString('ko-KR', options)
  return start === end ? startStr : `${startStr} – ${endStr}`
}

function ParkingCard({ lot }: { lot: ParkingLotWithDistance }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{lot.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{lot.address}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#378ADD]">
          {formatDistanceKm(lot.distanceKm)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span>총 {lot.totalSpots.toLocaleString()}면</span>
        {lot.freeSpots != null && (
          <span className="font-medium text-green-600">
            잔여 {lot.freeSpots.toLocaleString()}면
          </span>
        )}
        <AddToCourseButton item={courseItemFromParking(lot)} size="sm" />
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [parkingLots, setParkingLots] = useState<ParkingLotWithDistance[]>([])
  const [parkingLoading, setParkingLoading] = useState(true)
  const [parkingError, setParkingError] = useState<string | null>(null)
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantWithDistance[]>([])
  const [restaurantLoading, setRestaurantLoading] = useState(true)
  const [restaurantError, setRestaurantError] = useState<string | null>(null)

  usePageMeta({
    title: event?.title,
    description: event?.description?.slice(0, 150) || event?.title,
    image: event?.imageUrl || undefined,
  })

  useEffect(() => {
    if (!id) return

    const fromStore = useEventStore.getState().events.find((item) => item.id === id)
    if (fromStore) {
      setEvent(fromStore)
      setDetailLoading(false)
      return
    }

    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)

    fetchEventById(id)
      .then((result) => {
        if (cancelled) return
        if (result) {
          setEvent(result)
        } else {
          setDetailError('not_found')
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setDetailError(err instanceof Error ? err.message : '행사 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    useEventStore.getState().fetchEvents().catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id])

  const loadParkingLots = () => {
    if (!event) return

    setParkingLoading(true)
    setParkingError(null)

    fetchGwangjuParkingLots()
      .then((lots) => {
        setParkingLots(getNearbyParkingLots(event, lots, { radiusKm: 3, limit: 5 }))
      })
      .catch((err: unknown) => {
        setParkingError(
          err instanceof Error ? err.message : '주차장 정보를 불러오지 못했습니다.',
        )
      })
      .finally(() => setParkingLoading(false))
  }

  const loadNearbyRestaurants = () => {
    if (!event || event.lat == null || event.lng == null) {
      setNearbyRestaurants([])
      setRestaurantLoading(false)
      return
    }

    setRestaurantLoading(true)
    setRestaurantError(null)

    fetchNearbyRestaurants(event.lat, event.lng, { radiusM: 3000, limit: 5 })
      .then(setNearbyRestaurants)
      .catch((err: unknown) => {
        setRestaurantError(
          err instanceof Error ? err.message : '맛집 정보를 불러오지 못했습니다.',
        )
      })
      .finally(() => setRestaurantLoading(false))
  }

  const hasCoords = event?.lat != null && event?.lng != null

  useEffect(() => {
    if (!event) return
    loadParkingLots()
    loadNearbyRestaurants()
  }, [event?.id])

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (detailError && detailError !== 'not_found') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 pt-24">
          <ErrorMessage
            message={detailError}
            onRetry={() => id && fetchEventById(id).then((r) => r && setEvent(r))}
          />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 pt-24 text-center">
          <p className="text-sm text-gray-500">행사를 찾을 수 없습니다.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white"
          >
            행사 목록으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          ← 행사 목록
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="relative aspect-[21/9] overflow-hidden bg-gray-100">
            <EventImage event={event} />
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[event.category]}`}
            >
              {event.category}
            </span>
            <div className="absolute right-4 top-4">
              <FavoriteButton event={event} />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{event.title}</h1>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.place}
              </p>
              <p className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDateRange(event.startDate, event.endDate)}
              </p>
            </div>

            {event.description && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">행사 소개</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {event.description}
                </p>
              </div>
            )}

            <div className="mt-6">
              <AISummaryBadge
                eventId={event.id}
                eventTitle={event.title}
                eventDescription={event.description}
              />
            </div>

            <EventShareActions event={event} />

            <div className="mt-4">
              <AddToCourseButton item={courseItemFromEvent(event)} />
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">주변 주차장</h2>
          <p className="mt-1 text-sm text-gray-500">
            {hasCoords
              ? '행사 장소 기준 3km 이내 주차장입니다.'
              : '행사 위치 정보가 없어 주차장 거리를 계산할 수 없습니다.'}
          </p>

          {hasCoords && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <KakaoMap
                events={[event]}
                parkingLots={parkingLots}
                center={{ lat: event.lat!, lng: event.lng! }}
                level={4}
              />
            </div>
          )}

          {parkingLoading && (
            <div className="mt-4">
              <LoadingSpinner />
            </div>
          )}

          {!parkingLoading && parkingError && (
            <div className="mt-4">
              <ErrorMessage message={parkingError} onRetry={loadParkingLots} />
            </div>
          )}

          {!parkingLoading && !parkingError && parkingLots.length > 0 && (
            <div className="mt-4 space-y-3">
              {parkingLots.map((lot) => (
                <ParkingCard key={`${lot.name}-${lot.address}`} lot={lot} />
              ))}
            </div>
          )}

          {!parkingLoading && !parkingError && hasCoords && parkingLots.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
              <p className="text-sm text-gray-500">3km 이내 주차장을 찾지 못했습니다.</p>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">주변 맛집</h2>
          <p className="mt-1 text-sm text-gray-500">
            {hasCoords
              ? '카카오맵 기준 행사 장소에서 가까운 순 음식점입니다.'
              : '행사 위치 정보가 없어 주변 맛집을 검색할 수 없습니다.'}
          </p>

          {restaurantLoading && (
            <div className="mt-4">
              <LoadingSpinner />
            </div>
          )}

          {!restaurantLoading && restaurantError && (
            <div className="mt-4">
              <ErrorMessage message={restaurantError} onRetry={loadNearbyRestaurants} />
            </div>
          )}

          {!restaurantLoading && !restaurantError && nearbyRestaurants.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {nearbyRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="space-y-2">
                  <RestaurantCard restaurant={restaurant} showDistance />
                  <AddToCourseButton
                    item={courseItemFromRestaurant(restaurant)}
                    size="sm"
                    className="w-full justify-center"
                  />
                </div>
              ))}
            </div>
          )}

          {!restaurantLoading && !restaurantError && hasCoords && nearbyRestaurants.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
              <p className="text-sm text-gray-500">3km 이내 맛집을 찾지 못했습니다.</p>
            </div>
          )}
        </section>
      </main>
      <FloatingCourseBar />
    </div>
  )
}
