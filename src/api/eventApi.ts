import axios from 'axios'
import { getEventImageUrl } from '../lib/eventImageFallback'
import type { Event } from '../types/event'

const TOUR_API_BASE = import.meta.env.DEV
  ? '/tour-api/B551011/KorService2'
  : 'https://apis.data.go.kr/B551011/KorService2'

/** TourAPI v4.4 — 광주광역시 법정동 시도 코드 */
const GWANGJU_LDONG_CODE = '29'

interface TourApiItem {
  contentid: string
  title: string
  addr1?: string
  addr2?: string
  eventstartdate?: string
  eventenddate?: string
  firstimage?: string
  firstimage2?: string
  overview?: string
  mapx?: string
  mapy?: string
  cat1?: string
  cat2?: string
  cat3?: string
  lclsSystm1?: string
  lclsSystm2?: string
  lclsSystm3?: string
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
      totalCount?: number
    }
  }
}

interface TourApiFlatError {
  resultCode?: string
  resultMsg?: string
}

function formatDateFromApi(dateStr: string): string {
  if (!dateStr || dateStr.length < 8) return dateStr
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
}

function getEventStartDateParam(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function mapCategory(item: TourApiItem): Event['category'] {
  const cls = `${item.lclsSystm1 ?? ''}${item.lclsSystm2 ?? ''}${item.lclsSystm3 ?? ''}${item.cat2 ?? ''}`
  const title = item.title ?? ''

  if (/EV01|A0207|축제|페스티벌|마라톤/.test(cls + title)) return '축제'
  if (/EV02|A0208|공연|콘서트|뮤지컬|연극|클래식/.test(cls + title)) return '공연'
  if (/EV03|A0206|전시|박람회|아트|미술/.test(cls + title)) return '전시'
  return '기타'
}

function parseCoordinate(value?: string): number | undefined {
  if (!value) return undefined
  const num = parseFloat(value)
  if (Number.isNaN(num)) return undefined
  // v4.4는 WGS84 소수점, 구버전은 1e7 배수
  return Math.abs(num) > 1000 ? num / 10_000_000 : num
}

function mapItemToEvent(item: TourApiItem): Event {
  const category = mapCategory(item)
  return {
    id: item.contentid,
    title: item.title.replace(/<[^>]*>/g, ''),
    place: [item.addr1, item.addr2].filter(Boolean).join(' ') || '광주광역시',
    startDate: formatDateFromApi(item.eventstartdate ?? ''),
    endDate: formatDateFromApi(item.eventenddate ?? item.eventstartdate ?? ''),
    imageUrl: getEventImageUrl(item),
    category,
    description: item.overview?.replace(/<[^>]*>/g, '') ?? '',
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

async function fetchTourApiItem(
  endpoint: string,
  params: Record<string, string | number>,
): Promise<TourApiItem | null> {
  const apiKey = getApiKey()

  const { data } = await axios.get<TourApiResponse | TourApiFlatError>(
    `${TOUR_API_BASE}/${endpoint}`,
    {
      params: {
        serviceKey: apiKey,
        MobileOS: 'ETC',
        MobileApp: 'GwangjuNOW',
        _type: 'json',
        ...params,
      },
    },
  )

  if (!('response' in data) || !data.response?.header) {
    const flat = data as TourApiFlatError
    throw new Error(flat.resultMsg || '행사 정보를 불러오지 못했습니다.')
  }

  const { resultCode, resultMsg } = data.response.header
  if (resultCode !== '0000') {
    throw new Error(resultMsg || '행사 정보를 불러오지 못했습니다.')
  }

  const rawItems = data.response.body.items?.item
  if (!rawItems) return null

  const items = Array.isArray(rawItems) ? rawItems : [rawItems]
  return items[0] ?? null
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
  return '행사 정보를 불러오는 중 오류가 발생했습니다.'
}

export async function fetchGwangjuEvents(): Promise<Event[]> {
  try {
    const apiKey = getApiKey()
    const { data } = await axios.get<TourApiResponse | TourApiFlatError>(
      `${TOUR_API_BASE}/searchFestival2`,
      {
        params: {
          serviceKey: apiKey,
          numOfRows: 50,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'GwangjuNOW',
          _type: 'json',
          lDongRegnCd: GWANGJU_LDONG_CODE,
          eventStartDate: getEventStartDateParam(),
          arrange: 'C',
        },
      },
    )

    if (!('response' in data) || !data.response?.header) {
      const flat = data as TourApiFlatError
      throw new Error(flat.resultMsg || '행사 정보를 불러오지 못했습니다.')
    }

    const { resultCode, resultMsg } = data.response.header
    if (resultCode !== '0000') {
      throw new Error(resultMsg || '행사 정보를 불러오지 못했습니다.')
    }

    const rawItems = data.response.body.items?.item
    const items: TourApiItem[] = rawItems
      ? Array.isArray(rawItems)
        ? rawItems
        : [rawItems]
      : []

    return items.map(mapItemToEvent)
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error
    }
    throw new Error(parseApiError(error))
  }
}

/** URL 직접 진입 시 단건 행사 조회 */
export async function fetchEventById(contentId: string): Promise<Event | null> {
  try {
    const item = await fetchTourApiItem('detailFestival2', { contentId })
    return item ? mapItemToEvent(item) : null
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) {
      throw error
    }
    throw new Error(parseApiError(error))
  }
}
