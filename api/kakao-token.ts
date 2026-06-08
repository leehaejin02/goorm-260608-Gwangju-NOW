interface VercelRequest {
  method?: string
  body?: {
    code?: string
    redirect_uri?: string
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

  const clientId = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_CLIENT_ID
  const clientSecret = process.env.KAKAO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Kakao OAuth credentials are not configured' })
  }

  const code = req.body?.code?.trim()
  if (!code) {
    return res.status(400).json({ error: 'code is required' })
  }

  const redirectUri = req.body?.redirect_uri?.trim() || process.env.KAKAO_REDIRECT_URI || 'http://localhost:5173/callback'

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    })

    const data = (await tokenRes.json()) as {
      access_token?: string
      error?: string
      error_description?: string
    }

    if (!tokenRes.ok || !data.access_token) {
      return res.status(502).json({
        error: data.error_description || data.error || 'Token exchange failed',
      })
    }

    return res.status(200).json({ access_token: data.access_token })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
