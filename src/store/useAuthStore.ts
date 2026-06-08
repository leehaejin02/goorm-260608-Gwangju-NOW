import { create } from 'zustand'
import type { AuthState, AuthUser } from '../types/auth'

const TOKEN_KEY = 'gwangju_now_token'
const USER_KEY = 'gwangju_now_user'

interface AuthStore extends AuthState {
  isLoginModalOpen: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  initFromStorage: () => void
  openLoginModal: () => void
  closeLoginModal: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isLoginModalOpen: false,

  login: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({
      accessToken: token,
      user,
      isLoggedIn: true,
      isLoginModalOpen: false,
    })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      isLoginModalOpen: false,
    })
  },

  initFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userRaw = localStorage.getItem(USER_KEY)
    if (!token || !userRaw) return

    try {
      const parsed = JSON.parse(userRaw) as AuthUser & { id?: string | number }
      const user: AuthUser = {
        ...parsed,
        id: String(parsed.id),
        provider: parsed.provider ?? 'kakao',
      }
      set({ accessToken: token, user, isLoggedIn: true })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}))
