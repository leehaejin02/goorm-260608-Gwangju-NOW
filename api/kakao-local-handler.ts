import type { KakaoLocalDocument } from '../src/types/kakaoLocal'

export { GWANGJU_CENTER, type KakaoLocalDocument } from '../src/types/kakaoLocal'

export interface KakaoLocalResponse {
  documents: KakaoLocalDocument[]
  meta?: {
    total_count?: number
    pageable_count?: number
    is_end?: boolean
  }
}

export interface KakaoLocalSearchParams {
  type?: 'keyword' | 'category'
  query?: string
  category_group_code?: string
  x?: string
  y?: string
  radius?: string
  sort?: 'accuracy' | 'distance'
  size?: string
}

export async function fetchKakaoLocalPlaces(
  restApiKey: string,
  params: KakaoLocalSearchParams,
): Promise<KakaoLocalResponse> {
  const type = params.type ?? 'keyword'
  const endpoint =
    type === 'category'
      ? 'https://dapi.kakao.com/v2/local/search/category.json'
      : 'https://dapi.kakao.com/v2/local/search/keyword.json'

  const searchParams = new URLSearchParams()

  if (type === 'keyword') {
    const query = params.query?.trim()
    if (!query) {
      throw new Error('query is required for keyword search')
    }
    searchParams.set('query', query)
  } else {
    const categoryCode = params.category_group_code?.trim() || 'FD6'
    searchParams.set('category_group_code', categoryCode)
  }

  if (params.x) searchParams.set('x', params.x)
  if (params.y) searchParams.set('y', params.y)
  if (params.radius) searchParams.set('radius', params.radius)
  if (params.sort) searchParams.set('sort', params.sort)
  searchParams.set('size', params.size ?? '15')

  if (type === 'keyword' && params.category_group_code) {
    searchParams.set('category_group_code', params.category_group_code)
  }

  const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
    headers: { Authorization: `KakaoAK ${restApiKey}` },
  })

  const data = (await response.json()) as KakaoLocalResponse & {
    message?: string
    code?: string
  }

  if (!response.ok) {
    throw new Error(data.message || 'Kakao Local API request failed')
  }

  return {
    documents: data.documents ?? [],
    meta: data.meta,
  }
}
