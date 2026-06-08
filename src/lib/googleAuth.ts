import type { AuthUser } from '../types/auth'

interface TokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GoogleUserResponse {
  id: string
  name?: string
  picture?: string
}

export const GOOGLE_CALLBACK_PATH = '/callback/google'

export function getGoogleRedirectUri() {
  return `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
}

export function redirectToGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (!clientId || clientId === '발급받은_클라이언트_ID') {
    throw new Error('Google OAuth 클라이언트 ID가 설정되지 않았습니다.')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function getTokenFromCode(code: string): Promise<string> {
  const redirectUri = getGoogleRedirectUri()

  const response = await fetch('/api/google-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  })

  const data = (await response.json()) as TokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || '토큰 발급에 실패했습니다.')
  }

  return data.access_token
}

export async function getUserInfo(token: string): Promise<AuthUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as GoogleUserResponse

  return {
    id: data.id,
    nickname: data.name ?? 'Google 사용자',
    profileImage: data.picture ?? '',
    provider: 'google',
  }
}
