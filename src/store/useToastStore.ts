import { create } from 'zustand'

export interface ToastItem {
  id: string
  message: string
  link?: { label: string; href: string }
}

interface ToastStore {
  toasts: ToastItem[]
  showToast: (message: string, options?: { link?: { label: string; href: string } }) => void
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (message, options) => {
    const id = `toast-${Date.now()}`
    set({ toasts: [...get().toasts, { id, message, link: options?.link }] })
    window.setTimeout(() => get().dismissToast(id), 3500)
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))
