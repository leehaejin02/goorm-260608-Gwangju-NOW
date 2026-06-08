import type { AuthUser } from '../types/auth'

interface TokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface KakaoUserResponse {
  id: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
  }
}

export function redirectToKakaoLogin() {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim()
  if (!clientId || clientId === '발급받은_REST_API_키') {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다.')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/callback`,
    response_type: 'code',
  })

  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}

export async function getTokenFromCode(code: string): Promise<string> {
  const redirectUri = `${window.location.origin}/callback`

  const response = await fetch('/api/kakao-token', {
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
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as KakaoUserResponse
  const profile = data.kakao_account?.profile

  return {
    id: String(data.id),
    nickname: profile?.nickname ?? '카카오 사용자',
    profileImage: profile?.profile_image_url ?? '',
    provider: 'kakao',
  }
}
