import axios from 'axios'
import { getEventImageUrl } from '../lib/eventImageFallback'
import type { Spot, SpotCategory } from '../types/spot'

const TOUR_API_BASE = import.meta.env.DEV
  ? '/tour-api/B551011/KorService2'
  : 'https://apis.data.go.kr/B551011/KorService2'

const GWANGJU_LDONG_CODE = '29'

const CONTENT_TYPES: { contentTypeId: number; category: SpotCategory }[] = [
  { contentTypeId: 12, category: '관광지' },
  { contentTypeId: 14, category: '문화시설' },
  { contentTypeId: 28, category: '레포츠' },
  { contentTypeId: 38, category: '쇼핑' },
]

interface TourApiItem {
  contentid: string
  title: string
  addr1?: string
  addr2?: string
  firstimage?: string
  firstimage2?: string
  overview?: string
  mapx?: string
  mapy?: string
}

interface TourApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items?: {
        item?: TourApiItem | TourApiItem[]
      }
    }
  }
}

interface TourApiFlatError {
  resultCode?: string
  resultMsg?: string
}

function parseCoordinate(value?: string): number | undefined {
  if (!value) return undefined
  const num = parseFloat(value)
  if (Number.isNaN(num)) return undefined
  return Math.abs(num) > 1000 ? num / 10_000_000 : num
}

function mapItemToSpot(item: TourApiItem, category: SpotCategory): Spot {
  return {
    id: item.contentid,
    title: item.title.replace(/<[^>]*>/g, ''),
    address: [item.addr1, item.addr2].filter(Boolean).join(' ') || '광주광역시',
    description: item.overview?.replace(/<[^>]*>/g, '').slice(0, 200) ?? '',
    imageUrl: getEventImageUrl(item),
    category,
    lng: parseCoordinate(item.mapx),
    lat: parseCoordinate(item.mapy),
  }
}

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_PUBLIC_DATA_API_KEY?.trim()
  if (!apiKey || apiKey === '발급받은_키_입력') {
    throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_PUBLIC_DATA_API_KEY를 입력해 주세요.')
  }
  return apiKey
}

function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as TourApiResponse | TourApiFlatError | string | undefined

    if (status === 401) {
      return 'API 인증에 실패했습니다. 마이페이지 > 인증키 발급현황에서 일반 인증키를 확인해 주세요.'
    }
    if (status === 500) {
      return 'TourAPI 서버 오류입니다. 잠시 후 다시 시도해 주세요.'
    }

    if (typeof data === 'object' && data !== null) {
      if ('response' in data && data.response?.header?.resultMsg) {
        return data.response.header.resultMsg
      }
      if ('resultMsg' in data && data.resultMsg) {
        return data.resultMsg
      }
    }
    if (typeof data === 'string' && data.trim()) return data.trim()

    return error.message || '네트워크 오류가 발생했습니다.'
  }
  if (error instanceof Error) return error.message
  return '명소 정보를 불러오는 중 오류가 발생했습니다.'
}

async function fetchSpotsByContentType(
  contentTypeId: number,
  category: SpotCategory,
): Promise<Spot[]> {
  const apiKey = getApiKey()

  const { data } = await axios.get<TourApiResponse | TourApiFlatError>(
    `${TOUR_API_BASE}/areaBasedList2`,
    {
      params: {
        serviceKey: apiKey,
        numOfRows: 50,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'GwangjuNOW',
        _type: 'json',
        lDongRegnCd: GWANGJU_LDONG_CODE,
        contentTypeId,
        arrange: 'C',
      },
    },
  )

  if (!('response' in data) || !data.response?.header) {
    const flat = data as TourApiFlatError
    throw new Error(flat.resultMsg || '명소 정보를 불러오지 못했습니다.')
  }

  const { resultCode, resultMsg } = data.response.header
  if (resultCode !== '0000') {
    throw new Error(resultMsg || '명소 정보를 불러오지 못했습니다.')
  }

  const rawItems = data.response.body.items?.item
  const items: TourApiItem[] = rawItems
    ? Array.isArray(rawItems)
      ? rawItems
      : [rawItems]
    : []

  return items.map((item) => mapItemToSpot(item, category))
}

export async function fetchGwangjuSpots(): Promise<Spot[]> {
  try {
    const results = await Promise.all(
      CONTENT_TYPES.map(({ contentTypeId, category }) =>
        fetchSpotsByContentType(contentTypeId, category),
      ),
    )

    const seen = new Set<string>()
    const spots: Spot[] = []

    for (const group of results) {
      for (const spot of group) {
        if (seen.has(spot.id)) continue
        seen.add(spot.id)
        spots.push(spot)
      }
    }

    return spots.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error
    }
    throw new Error(parseApiError(error))
  }
}
