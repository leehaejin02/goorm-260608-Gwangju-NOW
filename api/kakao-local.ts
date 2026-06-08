import {
  fetchKakaoLocalPlaces,
  type KakaoLocalSearchParams,
} from './kakao-local-handler'

interface VercelRequest {
  method?: string
  query?: Partial<Record<keyof KakaoLocalSearchParams, string | string[]>>
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

  const restApiKey = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_CLIENT_ID

  if (!restApiKey) {
    return res.status(500).json({ error: 'Kakao REST API key is not configured' })
  }

  const query = req.query ?? {}

  try {
    const params: KakaoLocalSearchParams = {
      type: pickQueryParam(query.type) as KakaoLocalSearchParams['type'],
      query: pickQueryParam(query.query),
      category_group_code: pickQueryParam(query.category_group_code),
      x: pickQueryParam(query.x),
      y: pickQueryParam(query.y),
      radius: pickQueryParam(query.radius),
      sort: pickQueryParam(query.sort) as KakaoLocalSearchParams['sort'],
      size: pickQueryParam(query.size),
    }

    const data = await fetchKakaoLocalPlaces(restApiKey, params)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Kakao Local API request failed',
    })
  }
}
