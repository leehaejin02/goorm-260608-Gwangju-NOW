import { fetchAIChatReply, type ChatMessage } from './ai-chat-handler.js'

interface VercelRequest {
  method?: string
  body?: {
    messages?: ChatMessage[]
    eventsContext?: string
    courseContext?: string
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
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' })
  }

  const messages = req.body?.messages
  const eventsContext = req.body?.eventsContext?.trim() ?? ''
  const restaurantsContext = req.body?.restaurantsContext?.trim() ?? ''
  const courseContext = req.body?.courseContext?.trim() ?? ''

  if (!messages?.length) {
    return res.status(400).json({ error: 'messages is required' })
  }

  try {
    const reply = await fetchAIChatReply(
      messages,
      eventsContext,
      restaurantsContext,
      courseContext,
      apiKey,
    )
    return res.status(200).json({ reply })
  } catch {
    return res.status(502).json({ error: 'Failed to get AI reply' })
  }
}
