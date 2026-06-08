export type AuthProvider = 'kakao' | 'google'

export interface AuthUser {
  id: string
  nickname: string
  profileImage: string
  provider: AuthProvider
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoggedIn: boolean
}
