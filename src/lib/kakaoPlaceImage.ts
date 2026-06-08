const CACHE_PREFIX = 'kakao-place-img:'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface CachedImage {
  savedAt: number
  imageUrl: string | null
}

function getCached(placeId: string): string | null | undefined {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${placeId}`)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as CachedImage
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return undefined
    return parsed.imageUrl
  } catch {
    return undefined
  }
}

function setCached(placeId: string, imageUrl: string | null): void {
  try {
    const payload: CachedImage = { savedAt: Date.now(), imageUrl }
    sessionStorage.setItem(`${CACHE_PREFIX}${placeId}`, JSON.stringify(payload))
  } catch {
    // sessionStorage unavailable
  }
}

/** 카카오맵 장소 페이지 og:image (대표 사진) */
export async function fetchKakaoPlaceImage(placeId: string): Promise<string | null> {
  const cached = getCached(placeId)
  if (cached !== undefined) return cached

  try {
    const response = await fetch(
      `/api/kakao-place-image?placeId=${encodeURIComponent(placeId)}`,
    )

    if (response.status === 404) {
      setCached(placeId, null)
      return null
    }

    if (!response.ok) return null

    const data = (await response.json()) as { imageUrl?: string }
    const imageUrl = data.imageUrl?.trim() || null
    setCached(placeId, imageUrl)
    return imageUrl
  } catch {
    return null
  }
}

export async function enrichRestaurantsWithKakaoImages<
  T extends { id: string; imageUrl?: string },
>(restaurants: T[]): Promise<T[]> {
  const results = await Promise.all(
    restaurants.map(async (restaurant) => {
      const imageUrl = await fetchKakaoPlaceImage(restaurant.id)
      return { ...restaurant, imageUrl: imageUrl ?? '' }
    }),
  )
  return results
}
