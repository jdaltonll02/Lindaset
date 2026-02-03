import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

interface User {
  id: number
  username: string
  email: string
  role: 'contributor' | 'reviewer' | 'language_lead' | 'admin' | 'superuser'
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
  login: (credentials: { username: string; password: string }) => Promise<void>
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

      login: async (credentials: { username: string; password: string }) => {
        set({ isLoading: true })
        try {
          // Clear any existing tokens before login
          localStorage.removeItem('auth-token')
          
          const response = await authApi.login(credentials)
          const { user, token } = response.data
          
          localStorage.setItem('auth-token', token)
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          console.log('Login successful:', user)
        } catch (error) {
          // Clear any stale data on login failure
          localStorage.removeItem('auth-token')
          localStorage.removeItem('auth-storage')
          set({ 
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false 
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          // Mock successful registration
          const mockUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            role: 'contributor' as const,
            reputation_score: 0,
            is_verified: false
          }
          
          set({
            user: mockUser,
            token: 'mock-token-' + Date.now(),
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token')
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        // Clear localStorage
        localStorage.removeItem('auth-storage')
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('auth-token', state.token)
        }
      }
    }
  )
)