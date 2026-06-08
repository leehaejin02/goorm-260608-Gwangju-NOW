import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage } from 'node:http'
import { fetchKakaoLocalPlaces, type KakaoLocalSearchParams } from './api/kakao-local-handler'
import { fetchKakaoPlaceImageUrl } from './api/kakao-place-image-handler'
import { fetchAIChatReply, type ChatMessage } from './api/ai-chat-handler'
import { runAgent } from './api/agent-handler'

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function apiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        if (req.url === '/api/kakao-token') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const clientId = env.KAKAO_REST_API_KEY || env.VITE_KAKAO_CLIENT_ID
          const clientSecret = env.KAKAO_CLIENT_SECRET

          if (!clientId || !clientSecret) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Kakao OAuth credentials are not configured' }))
            return
          }

          try {
            const rawBody = await readRequestBody(req)
            const body = JSON.parse(rawBody) as { code?: string; redirect_uri?: string }
            const code = body.code?.trim()
            const redirectUri = body.redirect_uri?.trim() || 'http://localhost:5173/callback'

            if (!code) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'code is required' }))
              return
            }

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
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: data.error_description || data.error || 'Token exchange failed',
                }),
              )
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ access_token: data.access_token }))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
          return
        }

        if (req.url === '/api/google-token') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const googleClientId = env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID
          const googleClientSecret = env.GOOGLE_CLIENT_SECRET

          if (!googleClientId || !googleClientSecret) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Google OAuth credentials are not configured' }))
            return
          }

          try {
            const rawBody = await readRequestBody(req)
            const body = JSON.parse(rawBody) as { code?: string; redirect_uri?: string }
            const code = body.code?.trim()
            const redirectUri = body.redirect_uri?.trim() || 'http://localhost:5173/callback/google'

            if (!code) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'code is required' }))
              return
            }

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: googleClientId,
                client_secret: googleClientSecret,
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
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: data.error_description || data.error || 'Token exchange failed',
                }),
              )
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ access_token: data.access_token }))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
          return
        }

        if (req.url?.startsWith('/api/kakao-local')) {
          const pathname = req.url.split('?')[0]
          if (pathname !== '/api/kakao-local') {
            return next()
          }

          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          if (req.method !== 'GET') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const restApiKey = env.KAKAO_REST_API_KEY || env.VITE_KAKAO_CLIENT_ID

          if (!restApiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Kakao REST API key is not configured' }))
            return
          }

          try {
            const url = new URL(req.url, 'http://localhost')
            const params: KakaoLocalSearchParams = {
              type: (url.searchParams.get('type') as KakaoLocalSearchParams['type']) ?? 'keyword',
              query: url.searchParams.get('query') ?? undefined,
              category_group_code: url.searchParams.get('category_group_code') ?? undefined,
              x: url.searchParams.get('x') ?? undefined,
              y: url.searchParams.get('y') ?? undefined,
              radius: url.searchParams.get('radius') ?? undefined,
              sort: (url.searchParams.get('sort') as KakaoLocalSearchParams['sort']) ?? undefined,
              size: url.searchParams.get('size') ?? undefined,
            }

            const data = await fetchKakaoLocalPlaces(restApiKey, params)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          } catch (error) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : 'Kakao Local API request failed',
              }),
            )
          }
          return
        }

        if (req.url?.startsWith('/api/kakao-place-image')) {
          const pathname = req.url.split('?')[0]
          if (pathname !== '/api/kakao-place-image') {
            return next()
          }

          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          if (req.method !== 'GET') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          try {
            const url = new URL(req.url, 'http://localhost')
            const placeId = url.searchParams.get('placeId')?.trim()

            if (!placeId) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'placeId is required' }))
              return
            }

            const imageUrl = await fetchKakaoPlaceImageUrl(placeId)

            if (!imageUrl) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Place image not found' }))
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ imageUrl }))
          } catch {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to fetch place image' }))
          }
          return
        }

        if (req.url === '/api/agent') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          const openaiApiKey = env.OPENAI_API_KEY
          const kakaoRestApiKey = env.KAKAO_REST_API_KEY

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          if (!openaiApiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'OpenAI API key is not configured' }))
            return
          }

          if (!kakaoRestApiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Kakao REST API key is not configured' }))
            return
          }

          try {
            const rawBody = await readRequestBody(req)
            const body = JSON.parse(rawBody) as {
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

            if (!body.messages?.length) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'messages is required' }))
              return
            }

            const result = await runAgent(
              body.messages,
              {
                eventsContext: body.eventsContext?.trim() ?? '',
                restaurantsContext: body.restaurantsContext?.trim() ?? '',
                spotsContext: body.spotsContext?.trim() ?? '',
                courseContext: body.courseContext?.trim() ?? '',
                poiCatalog: body.poiCatalog ?? [],
              },
              openaiApiKey,
              kakaoRestApiKey,
            )

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          } catch {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to run agent' }))
          }
          return
        }

        if (req.url === '/api/ai-chat') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          const openaiApiKey = env.OPENAI_API_KEY

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          if (!openaiApiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'OpenAI API key is not configured' }))
            return
          }

          try {
            const rawBody = await readRequestBody(req)
            const body = JSON.parse(rawBody) as {
              messages?: ChatMessage[]
              eventsContext?: string
              restaurantsContext?: string
              courseContext?: string
            }

            if (!body.messages?.length) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'messages is required' }))
              return
            }

            const reply = await fetchAIChatReply(
              body.messages,
              body.eventsContext?.trim() ?? '',
              body.restaurantsContext?.trim() ?? '',
              body.courseContext?.trim() ?? '',
              openaiApiKey,
            )

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply }))
          } catch {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to get AI reply' }))
          }
          return
        }

        if (req.url !== '/api/ai-summary') return next()

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.end()
          return
        }

        const openaiApiKey = env.OPENAI_API_KEY

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        if (!openaiApiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'OpenAI API key is not configured' }))
          return
        }

        try {
          const rawBody = await readRequestBody(req)
          const body = JSON.parse(rawBody) as {
            eventTitle?: string
            eventDescription?: string
          }

          const eventTitle = body.eventTitle?.trim()
          const eventDescription = body.eventDescription?.trim()

          if (!eventTitle) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'eventTitle is required' }))
            return
          }

          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiApiKey}`,
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
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'OpenAI request failed' }))
            return
          }

          const data = (await openaiRes.json()) as {
            choices?: Array<{ message?: { content?: string } }>
          }
          const summary = data.choices?.[0]?.message?.content?.trim()

          if (!summary) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Empty summary response' }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ summary }))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), apiDevPlugin(env)],
    server: {
      proxy: {
        '/tour-api': {
          target: 'https://apis.data.go.kr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tour-api/, ''),
        },
      },
    },
  }
})
