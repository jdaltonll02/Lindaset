import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

interface User {
  id: number
  username: string
  email: string
  role: 'contributor' | 'reviewer' | 'language_lead' | 'admin'
  reputation_score?: number
  is_verified?: boolean
  firstName?: string
  lastName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  preferred_languages: number[]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User) => {
        console.log('Auth store login called with:', user)
        set({
          user,
          token: 'demo-token',
          isAuthenticated: true,
          isLoading: false
        })
        console.log('Auth state updated, isAuthenticated:', true)
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          set({
            user: { id: 1, username: userData.username, email: userData.email, role: 'contributor', reputation_score: 0.0, is_verified: false },
            token: 'demo-token',
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      updateUser: (user: User) => {
        set({ user })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)