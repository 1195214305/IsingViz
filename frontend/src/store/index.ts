import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  qwenApiKey: string
  theme: 'dark' | 'light'
  animationSpeed: number
}

interface AppState {
  settings: Settings
  currentPage: string
  isLoading: boolean
  setSettings: (settings: Partial<Settings>) => void
  updateSettings: (settings: Partial<Settings>) => void
  setCurrentPage: (page: string) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        qwenApiKey: '',
        theme: 'dark',
        animationSpeed: 1,
      },
      currentPage: 'home',
      isLoading: false,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setCurrentPage: (page) => set({ currentPage: page }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ising-viz-storage',
    }
  )
)
