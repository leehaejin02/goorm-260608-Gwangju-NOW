interface VercelRequest {
  method?: string
  body?: {
    eventTitle?: string
    eventDescription?: string
  }
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
  end: () => void
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
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

  const eventTitle = req.body?.eventTitle?.trim()
  const eventDescription = req.body?.eventDescription?.trim()

  if (!eventTitle) {
    return res.status(400).json({ error: 'eventTitle is required' })
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content:
              '당신은 광주 관광 행사 소개 전문가입니다. 한국어로 2~3문장, 150자 이내로 간결하고 매력적으로 요약하세요.',
          },
          {
            role: 'user',
            content: `행사명: ${eventTitle}\n설명: ${eventDescription || '설명 없음'}`,
          },
        ],
      }),
    })

    if (!openaiRes.ok) {
      return res.status(502).json({ error: 'OpenAI request failed' })
    }

    const data = (await openaiRes.json()) as OpenAIChatResponse
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      return res.status(502).json({ error: 'Empty summary response' })
    }

    return res.status(200).json({ summary })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
