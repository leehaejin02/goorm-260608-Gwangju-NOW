import { fetchKakaoPlaceImageUrl } from './kakao-place-image-handler'

interface VercelRequest {
  method?: string
  query?: { placeId?: string | string[] }
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
  end: () => void
}

function pickQueryParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const placeId = pickQueryParam(req.query?.placeId)?.trim()
  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required' })
  }

  try {
    const imageUrl = await fetchKakaoPlaceImageUrl(placeId)
    if (!imageUrl) {
      return res.status(404).json({ error: 'Place image not found' })
    }
    return res.status(200).json({ imageUrl })
  } catch {
    return res.status(502).json({ error: 'Failed to fetch place image' })
  }
}
