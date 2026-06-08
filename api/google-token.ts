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

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Google OAuth credentials are not configured' })
  }

  const code = req.body?.code?.trim()
  if (!code) {
    return res.status(400).json({ error: 'code is required' })
  }

  const redirectUri =
    req.body?.redirect_uri?.trim() ||
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:5173/callback/google'

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
