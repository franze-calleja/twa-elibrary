/**
 * Authentication Store using Zustand
 * Manages authentication state globally
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@prisma/client'

interface AuthState {
  user: Omit<User, 'password'> | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setAuth: (user: Omit<User, 'password'>, token: string) => void
  updateUser: (user: Partial<Omit<User, 'password'>>) => void
  logout: () => void
  setLoading: (isLoading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      setAuth: (user, token) => {
        // Save token to localStorage for axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },
      
      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },
      
      setLoading: (isLoading) => {
        set({ isLoading })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Selectors for easier state access
export const selectUser = (state: AuthStore) => state.user
export const selectToken = (state: AuthStore) => state.token
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsLoading = (state: AuthStore) => state.isLoading
export const selectIsStaff = (state: AuthStore) => state.user?.role === 'STAFF'
export const selectIsStudent = (state: AuthStore) => state.user?.role === 'STUDENT'
