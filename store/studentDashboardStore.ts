/**
 * Student Dashboard Store
 * Zustand store for student dashboard UI state and preferences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ================================
// Types
// ================================

interface StudentDashboardState {
  // UI State
  currentView: 'overview' | 'borrowed' | 'history'
  
  // Filters
  filters: {
    historyPeriod: 'all' | 'month' | 'semester' | 'year'
    statusFilter: 'all' | 'active' | 'returned' | 'overdue'
  }
  
  // Preferences
  preferences: {
    showGuide: boolean
    compactView: boolean
  }
  
  // Actions
  setCurrentView: (view: 'overview' | 'borrowed' | 'history') => void
  setFilters: (filters: Partial<StudentDashboardState['filters']>) => void
  toggleGuide: () => void
  toggleCompactView: () => void
  resetFilters: () => void
}

// ================================
// Store
// ================================

const initialFilters = {
  historyPeriod: 'all' as const,
  statusFilter: 'all' as const
}

const initialPreferences = {
  showGuide: true,
  compactView: false
}

export const useStudentDashboardStore = create<StudentDashboardState>()(
  persist(
    (set) => ({
      // Initial state
      currentView: 'overview',
      filters: initialFilters,
      preferences: initialPreferences,
      
      // Actions
      setCurrentView: (view) => set({ currentView: view }),
      
      setFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters } 
        })),
      
      toggleGuide: () => 
        set((state) => ({ 
          preferences: { ...state.preferences, showGuide: !state.preferences.showGuide } 
        })),
      
      toggleCompactView: () => 
        set((state) => ({ 
          preferences: { ...state.preferences, compactView: !state.preferences.compactView } 
        })),
      
      resetFilters: () => set({ filters: initialFilters })
    }),
    {
      name: 'student-dashboard-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        filters: state.filters,
        preferences: state.preferences
      })
    }
  )
)

// ================================
// Selectors
// ================================

export const selectCurrentView = (state: StudentDashboardState) => state.currentView
export const selectFilters = (state: StudentDashboardState) => state.filters
export const selectPreferences = (state: StudentDashboardState) => state.preferences
