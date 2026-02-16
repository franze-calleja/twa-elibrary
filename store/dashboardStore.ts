/**
 * Dashboard Store using Zustand
 * Manages staff dashboard state, filters, and preferences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardStats } from '@/types'

// ================================
// Types
// ================================

export type DashboardView = 'overview' | 'pending' | 'overdue' | 'recent'
export type StatsPeriod = 'today' | 'week' | 'month' | 'all'

interface DashboardFilters {
  period: StatsPeriod
  searchQuery: string
  statusFilter: string[]
}

interface DashboardState {
  // Current view
  currentView: DashboardView
  
  // Filters
  filters: DashboardFilters
  
  // Cached stats (optional - TanStack Query also caches)
  cachedStats: DashboardStats | null
  lastFetched: Date | null
  
  // UI preferences
  preferences: {
    autoRefresh: boolean
    refreshInterval: number // in seconds
    showNotifications: boolean
    compactView: boolean
  }
}

interface DashboardActions {
  // View management
  setCurrentView: (view: DashboardView) => void
  
  // Filter management
  setFilters: (filters: Partial<DashboardFilters>) => void
  resetFilters: () => void
  setPeriod: (period: StatsPeriod) => void
  setSearchQuery: (query: string) => void
  setStatusFilter: (statuses: string[]) => void
  
  // Stats management
  setCachedStats: (stats: DashboardStats) => void
  clearCachedStats: () => void
  
  // Preferences management
  setPreferences: (preferences: Partial<DashboardState['preferences']>) => void
  toggleAutoRefresh: () => void
  toggleCompactView: () => void
  setRefreshInterval: (interval: number) => void
}

type DashboardStore = DashboardState & DashboardActions

// ================================
// Default Values
// ================================

const defaultFilters: DashboardFilters = {
  period: 'all',
  searchQuery: '',
  statusFilter: []
}

const defaultPreferences: DashboardState['preferences'] = {
  autoRefresh: true,
  refreshInterval: 60, // 60 seconds
  showNotifications: true,
  compactView: false
}

// ================================
// Store
// ================================

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      // Initial state
      currentView: 'overview',
      filters: defaultFilters,
      cachedStats: null,
      lastFetched: null,
      preferences: defaultPreferences,

      // View management
      setCurrentView: (view) => set({ currentView: view }),

      // Filter management
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters
        }),

      setPeriod: (period) =>
        set((state) => ({
          filters: { ...state.filters, period }
        })),

      setSearchQuery: (searchQuery) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery }
        })),

      setStatusFilter: (statusFilter) =>
        set((state) => ({
          filters: { ...state.filters, statusFilter }
        })),

      // Stats management
      setCachedStats: (stats) =>
        set({
          cachedStats: stats,
          lastFetched: new Date()
        }),

      clearCachedStats: () =>
        set({
          cachedStats: null,
          lastFetched: null
        }),

      // Preferences management
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),

      toggleAutoRefresh: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            autoRefresh: !state.preferences.autoRefresh
          }
        })),

      toggleCompactView: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            compactView: !state.preferences.compactView
          }
        })),

      setRefreshInterval: (refreshInterval) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            refreshInterval
          }
        }))
    }),
    {
      name: 'dashboard-storage', // localStorage key
      partialize: (state) => ({
        // Only persist preferences and filters
        filters: state.filters,
        preferences: state.preferences,
        currentView: state.currentView
        // Don't persist cached stats (use TanStack Query for that)
      })
    }
  )
)

// ================================
// Selectors (for better performance)
// ================================

export const selectCurrentView = (state: DashboardStore) => state.currentView
export const selectFilters = (state: DashboardStore) => state.filters
export const selectPreferences = (state: DashboardStore) => state.preferences
export const selectAutoRefresh = (state: DashboardStore) => state.preferences.autoRefresh
export const selectRefreshInterval = (state: DashboardStore) => state.preferences.refreshInterval
