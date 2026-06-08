import type { Restaurant, RestaurantWithDistance } from '../types/restaurant'
import { GWANGJU_CENTER, type KakaoLocalDocument } from '../types/kakaoLocal'
import { enrichRestaurantsWithKakaoImages } from '../lib/kakaoPlaceImage'

const FOOD_CATEGORY_CODE = 'FD6'

const GWANGJU_RESTAURANT_FALLBACK: Restaurant[] = [
  {
    id: 'fallback-1',
    name: '송정 떡갈비',
    address: '광주광역시 광산구 송정동',
    category: '한식',
    imageUrl: '',
    description: '광주를 대표하는 송정 떡갈비 거리',
    lat: 35.1398,
    lng: 126.7935,
  },
  {
    id: 'fallback-2',
    name: '양동 시장',
    address: '광주광역시 서구 양동',
    category: '시장·먹거리',
    imageUrl: '',
    description: '광주 대표 전통시장',
    lat: 35.1542,
    lng: 126.8896,
  },
  {
    id: 'fallback-3',
    name: '1913 송정역시장',
    address: '광주광역시 광산구 송정동',
    category: '시장·먹거리',
    imageUrl: '',
    description: '레트로 감성 로컬 푸드 시장',
    lat: 35.1395,
    lng: 126.7942,
  },
  {
    id: 'fallback-4',
    name: '충장로 카페거리',
    address: '광주광역시 동구 충장로',
    category: '카페',
    imageUrl: '',
    description: '광주 도심 카페·디저트 명소',
    lat: 35.1488,
    lng: 126.9157,
  },
  {
    id: 'fallback-5',
    name: '상무지구 맛집거리',
    address: '광주광역시 서구 치평동',
    category: '맛집거리',
    imageUrl: '',
    description: '다양한 외식 맛집이 모인 상무지구',
    lat: 35.152,
    lng: 126.851,
  },
  {
    id: 'fallback-6',
    name: '무등산 보리밥',
    address: '광주광역시 동구 산수동',
    category: '한식',
    imageUrl: '',
    description: '무등산 자락 광주식 보리밥',
    lat: 35.1345,
    lng: 126.9235,
  },
]

interface KakaoLocalApiResponse {
  documents?: KakaoLocalDocument[]
  error?: string
}

function extractCategory(categoryName: string): string {
  const parts = categoryName.split('>').map((part) => part.trim())
  return parts[parts.length - 1] || '음식점'
}

function mapDocumentToRestaurant(doc: KakaoLocalDocument): Restaurant {
  const lat = parseFloat(doc.y)
  const lng = parseFloat(doc.x)
  const category = extractCategory(doc.category_name)

  return {
    id: doc.id,
    name: doc.place_name,
    address: doc.road_address_name || doc.address_name || '광주광역시',
    category,
    imageUrl: '',
    description: doc.category_name?.replace(/>/g, ' · ') ?? '',
    lat: Number.isNaN(lat) ? undefined : lat,
    lng: Number.isNaN(lng) ? undefined : lng,
    tel: doc.phone?.trim() || undefined,
    placeUrl: doc.place_url || undefined,
  }
}

function mapDocumentWithDistance(doc: KakaoLocalDocument): RestaurantWithDistance {
  const restaurant = mapDocumentToRestaurant(doc)
  const distanceM = doc.distance ? parseInt(doc.distance, 10) : NaN

  return {
    ...restaurant,
    distanceKm: Number.isNaN(distanceM) ? 0 : distanceM / 1000,
  }
}

async function searchKakaoLocal(
  params: Record<string, string>,
): Promise<KakaoLocalDocument[]> {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/kakao-local?${searchParams.toString()}`)

  const data = (await response.json()) as KakaoLocalApiResponse

  if (!response.ok) {
    throw new Error(data.error || '맛집 정보를 불러오지 못했습니다.')
  }

  return data.documents ?? []
}

/** 홈 — 카카오맵 키워드 검색 (광주 맛집) */
export async function fetchGwangjuRestaurants(): Promise<Restaurant[]> {
  try {
    const documents = await searchKakaoLocal({
      type: 'keyword',
      query: '광주 맛집',
      x: String(GWANGJU_CENTER.lng),
      y: String(GWANGJU_CENTER.lat),
      radius: '20000',
      sort: 'accuracy',
      size: '15',
      category_group_code: FOOD_CATEGORY_CODE,
    })

    const restaurants = documents.map(mapDocumentToRestaurant)
    if (restaurants.length > 0) {
      return enrichRestaurantsWithKakaoImages(restaurants)
    }

    return GWANGJU_RESTAURANT_FALLBACK
  } catch (error) {
    console.warn('[restaurantApi]', error)
    return GWANGJU_RESTAURANT_FALLBACK
  }
}

/** 맛집 직접 검색 — 키워드 + 광주 중심 반경 */
export async function searchGwangjuRestaurants(query: string): Promise<Restaurant[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const documents = await searchKakaoLocal({
    type: 'keyword',
    query: trimmed,
    x: String(GWANGJU_CENTER.lng),
    y: String(GWANGJU_CENTER.lat),
    radius: '20000',
    sort: 'accuracy',
    size: '15',
    category_group_code: FOOD_CATEGORY_CODE,
  })

  const restaurants = documents.map(mapDocumentToRestaurant)
  if (restaurants.length === 0) return []

  return enrichRestaurantsWithKakaoImages(restaurants)
}

/** 행사 상세 — 카카오맵 거리순 주변 음식점 */
export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  options: { radiusM?: number; limit?: number } = {},
): Promise<RestaurantWithDistance[]> {
  const { radiusM = 3000, limit = 5 } = options

  const documents = await searchKakaoLocal({
    type: 'category',
    category_group_code: FOOD_CATEGORY_CODE,
    x: String(lng),
    y: String(lat),
    radius: String(radiusM),
    sort: 'distance',
    size: String(Math.max(limit, 10)),
  })

  const nearby = documents
    .map(mapDocumentWithDistance)
    .filter((item) => item.distanceKm * 1000 <= radiusM)
    .slice(0, limit)

  return enrichRestaurantsWithKakaoImages(nearby)
}
