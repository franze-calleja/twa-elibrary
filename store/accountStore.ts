/**
 * Account Store using Zustand
 * Manages student account/profile state
 */

import { create } from 'zustand'

export interface UserProfile {
  id: string
  email: string
  role: 'STAFF' | 'STUDENT'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  firstName: string
  lastName: string
  middleName: string | null
  phone: string | null
  avatar: string | null
  studentId: string | null
  program: string | null
  yearLevel: number | null
  borrowingLimit: number
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  _count?: {
    transactions: number
    fines: number
  }
}

interface AccountState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

interface AccountActions {
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  clearProfile: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

type AccountStore = AccountState & AccountActions

export const useAccountStore = create<AccountStore>((set) => ({
  // Initial state
  profile: null,
  isLoading: false,
  error: null,

  // Actions
  setProfile: (profile) => {
    set({ 
      profile, 
      isLoading: false, 
      error: null 
    })
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: state.profile 
        ? { ...state.profile, ...updates } 
        : null,
      error: null
    }))
  },

  clearProfile: () => {
    set({ 
      profile: null, 
      isLoading: false, 
      error: null 
    })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setError: (error) => {
    set({ error, isLoading: false })
  }
}))
