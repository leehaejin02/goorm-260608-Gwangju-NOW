import axios from 'axios'
import type { YoutubeVideo } from '../types/youtube'
import type { EventCategory } from '../types/event'

/** 광주광역시 중심 좌표 (YouTube 지역 검색용) */
const GWANGJU_LOCATION = '35.1595,126.8526'
const LOCATION_RADIUS = '40km'
const CACHE_PREFIX = 'youtube-gwangju:'
const CACHE_TTL_MS = 60 * 60 * 1000

export class YoutubeQuotaError extends Error {
  constructor() {
    super('YouTube API 일일 검색 한도를 초과했습니다.')
    this.name = 'YoutubeQuotaError'
  }
}

interface YouTubeSearchItem {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    channelTitle?: string
    description?: string
    thumbnails?: {
      medium?: { url?: string }
      high?: { url?: string }
      default?: { url?: string }
    }
  }
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[]
  error?: {
    message?: string
    errors?: Array<{ reason?: string }>
  }
}

interface CachedYoutubePayload {
  savedAt: number
  videos: YoutubeVideo[]
}

const GWANGJU_KEYWORDS = [
  '광주',
  'gwangju',
  '빛고을',
  '무등산',
  '비엔날레',
  '아시아문화',
  'ACC',
  '518',
  '문화전당',
]

const IRRELEVANT_PATTERNS = [
  /대학축제/i,
  /대학교\s*축제/i,
  /전국\s*.*순위/i,
  /행사비\s*순위/i,
  /서울\s*(축제|공연|여행)/,
  /부산\s*(축제|공연|여행)/,
  /제주\s*(축제|공연|여행)/,
]

function buildSearchQuery(category: EventCategory, eventTitles: string[]): string {
  const queryCategory = category === '전체' ? '축제' : category
  const topEvent = eventTitles.find(Boolean)

  if (topEvent) {
    const shortTitle = topEvent.replace(/<[^>]*>/g, '').slice(0, 30)
    return `"광주광역시" ${shortTitle}`
  }

  return `"광주광역시" ${queryCategory}`
}

function getCacheKey(category: EventCategory, eventTitles: string[]): string {
  const eventKey = eventTitles.slice(0, 3).join('|')
  return `${CACHE_PREFIX}${category}:${eventKey}`
}

function getCachedVideos(key: string): YoutubeVideo[] | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedYoutubePayload
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return parsed.videos
  } catch {
    return null
  }
}

function setCachedVideos(key: string, videos: YoutubeVideo[]): void {
  try {
    const payload: CachedYoutubePayload = { savedAt: Date.now(), videos }
    sessionStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // sessionStorage unavailable
  }
}

function getSearchText(item: YouTubeSearchItem): string {
  const snippet = item.snippet
  return [snippet?.title, snippet?.channelTitle, snippet?.description]
    .filter(Boolean)
    .join(' ')
}

function isGwangjuRelevant(text: string): boolean {
  const normalized = text.toLowerCase()
  const hasGwangjuKeyword = GWANGJU_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase()),
  )

  if (!hasGwangjuKeyword) return false

  const isIrrelevant = IRRELEVANT_PATTERNS.some((pattern) => pattern.test(text))
  return !isIrrelevant
}

function mapItemToVideo(item: YouTubeSearchItem): YoutubeVideo | null {
  const videoId = item.id?.videoId
  const snippet = item.snippet
  if (!videoId || !snippet?.title) return null

  const thumbnailUrl =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.default?.url ||
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`

  return {
    videoId,
    title: snippet.title,
    channelTitle: snippet.channelTitle ?? 'YouTube',
    thumbnailUrl,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

function isQuotaExceededMessage(message: string): boolean {
  return /quota exceeded|quotaExceeded|dailyLimitExceeded/i.test(message)
}

function parseYoutubeError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as YouTubeSearchResponse | undefined
    const message = data?.error?.message || error.message

    if (isQuotaExceededMessage(message)) {
      throw new YoutubeQuotaError()
    }

    throw new Error(message || 'YouTube 영상을 불러오지 못했습니다.')
  }

  if (error instanceof Error) throw error
  throw new Error('YouTube 영상을 불러오지 못했습니다.')
}

async function searchYoutube(apiKey: string, params: Record<string, string | number>) {
  const { data } = await axios.get<YouTubeSearchResponse>(
    'https://www.googleapis.com/youtube/v3/search',
    {
      params: {
        part: 'snippet',
        type: 'video',
        relevanceLanguage: 'ko',
        regionCode: 'KR',
        key: apiKey,
        ...params,
      },
    },
  )

  if (data.error?.message) {
    if (isQuotaExceededMessage(data.error.message)) {
      throw new YoutubeQuotaError()
    }
    throw new Error(data.error.message)
  }

  return data.items ?? []
}

export async function fetchGwangjuYoutubeVideos(
  category: EventCategory = '축제',
  eventTitles: string[] = [],
): Promise<YoutubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY?.trim()

  if (!apiKey || apiKey === '발급받은_유튜브_API_키') {
    throw new Error(
      'YouTube API 키가 설정되지 않았습니다. .env 파일에 VITE_YOUTUBE_API_KEY를 입력해 주세요.',
    )
  }

  const cacheKey = getCacheKey(category, eventTitles)
  const cached = getCachedVideos(cacheKey)
  if (cached) return cached

  const searchQuery = buildSearchQuery(category, eventTitles)

  try {
    const items = await searchYoutube(apiKey, {
      q: searchQuery,
      maxResults: 15,
      location: GWANGJU_LOCATION,
      locationRadius: LOCATION_RADIUS,
    })

    const relevantVideos = items
      .filter((item) => isGwangjuRelevant(getSearchText(item)))
      .map(mapItemToVideo)
      .filter((video): video is YoutubeVideo => video !== null)
      .slice(0, 3)

    if (relevantVideos.length > 0) {
      setCachedVideos(cacheKey, relevantVideos)
      return relevantVideos
    }

    const fallbackItems = await searchYoutube(apiKey, {
      q: `"광주광역시" ${category === '전체' ? '축제' : category}`,
      maxResults: 15,
    })

    const fallbackVideos = fallbackItems
      .filter((item) => isGwangjuRelevant(getSearchText(item)))
      .map(mapItemToVideo)
      .filter((video): video is YoutubeVideo => video !== null)
      .slice(0, 3)

    if (fallbackVideos.length === 0) {
      throw new Error('광주 관련 영상을 찾지 못했습니다.')
    }

    setCachedVideos(cacheKey, fallbackVideos)
    return fallbackVideos
  } catch (error) {
    parseYoutubeError(error)
  }
}

export function getYoutubeSearchUrl(category: EventCategory): string {
  const query = encodeURIComponent(`광주광역시 ${category === '전체' ? '축제' : category}`)
  return `https://www.youtube.com/results?search_query=${query}`
}
