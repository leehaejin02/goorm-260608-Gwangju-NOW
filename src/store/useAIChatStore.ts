import { create } from 'zustand'

interface AIChatStore {
  pendingMessage: string | null
  askAI: (message: string) => void
  consumePending: () => string | null
}

export const useAIChatStore = create<AIChatStore>((set, get) => ({
  pendingMessage: null,

  askAI: (message) => {
    set({ pendingMessage: message.trim() })
    requestAnimationFrame(() => {
      document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })
    })
  },

  consumePending: () => {
    const message = get().pendingMessage
    set({ pendingMessage: null })
    return message
  },
}))
