'use client'

import { create } from 'zustand'

type UIState = {
  username?: string
  setUsername: (username: string) => void
}

export const useUIState = create<UIState>((set) => ({
  username: undefined,
  setUsername: (username) => set({ username }),
}))
