import { runAgent, type ChatMessage } from './agent-handler.js'

interface VercelRequest {
  method?: string
  body?: {
    messages?: ChatMessage[]
    eventsContext?: string
    restaurantsContext?: string
    spotsContext?: string
    courseContext?: string
    poiCatalog?: Array<{
      item_type: 'event' | 'spot' | 'restaurant'
      ref_id: string
      title: string
      lat?: number
      lng?: number
      link?: string
    }>
  }
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
  end: () => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const kakaoKey = process.env.KAKAO_REST_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' })
  }
  if (!kakaoKey) {
    return res.status(500).json({ error: 'Kakao REST API key is not configured' })
  }

  const messages = req.body?.messages
  if (!messages?.length) {
    return res.status(400).json({ error: 'messages is required' })
  }

  try {
    const result = await runAgent(
      messages,
      {
        eventsContext: req.body?.eventsContext?.trim() ?? '',
        restaurantsContext: req.body?.restaurantsContext?.trim() ?? '',
        spotsContext: req.body?.spotsContext?.trim() ?? '',
        courseContext: req.body?.courseContext?.trim() ?? '',
        poiCatalog: req.body?.poiCatalog ?? [],
      },
      apiKey,
      kakaoKey,
    )
    return res.status(200).json(result)
  } catch {
    return res.status(502).json({ error: 'Failed to run agent' })
  }
}
