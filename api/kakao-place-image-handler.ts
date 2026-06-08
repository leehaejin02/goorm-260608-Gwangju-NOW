const PLACE_PAGE_BASE = 'https://place.map.kakao.com'

export async function fetchKakaoPlaceImageUrl(placeId: string): Promise<string | null> {
  const id = placeId.trim()
  if (!id) return null

  const response = await fetch(`${PLACE_PAGE_BASE}/${id}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) return null

  const html = await response.text()

  const ogMatch =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

  if (!ogMatch?.[1]) return null

  let imageUrl = ogMatch[1].trim()
  if (imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`
  }

  if (!imageUrl.startsWith('http')) return null
  return imageUrl
}
