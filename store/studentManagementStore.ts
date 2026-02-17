/**
 * Student Management Store
 * Zustand store for managing student-related UI state (Staff use)
 * 
 * Student Status Rules:
 * - INACTIVE: Pre-registered, awaiting student registration (cannot be manually activated)
 * - ACTIVE: Fully registered, can use system (can be suspended)
 * - SUSPENDED: Suspended by staff (can be reactivated)
 * 
 * Status Transitions:
 * - INACTIVE → ACTIVE: Only through student registration process
 * - ACTIVE ↔ SUSPENDED: Allowed by staff
 * - Any → INACTIVE: Blocked (INACTIVE is for pre-registration only)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudentFilters {
  search: string
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  program: string
  yearLevel: number | null
  hasOverdue: boolean
  hasFines: boolean
}

interface StudentSortConfig {
  field: 'firstName' | 'lastName' | 'studentId' | 'program' | 'yearLevel' | 'createdAt' | 'borrowingLimit'
  direction: 'asc' | 'desc'
}

interface StudentManagementState {
  // View state
  currentView: 'list' | 'grid' | 'detail'
  selectedStudentId: string | null
  
  // Filters
  filters: StudentFilters
  
  // Sorting
  sortConfig: StudentSortConfig
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // UI preferences
  preferences: {
    showInactiveStudents: boolean
    compactMode: boolean
    showStatistics: boolean
    columnsVisible: {
      studentId: boolean
      email: boolean
      program: boolean
      yearLevel: boolean
      borrowingLimit: boolean
      status: boolean
      activeLoans: boolean
      overdueBooks: boolean
      fines: boolean
    }
  }
  
  // Dialog/Modal states
  dialogs: {
    editStudent: boolean
    viewStudent: boolean
    suspendStudent: boolean
    adjustLimit: boolean
    preRegister: boolean
    importCSV: boolean
  }
  
  // Actions - View
  setCurrentView: (view: 'list' | 'grid' | 'detail') => void
  setSelectedStudent: (id: string | null) => void
  
  // Actions - Filters
  setFilters: (filters: Partial<StudentFilters>) => void
  resetFilters: () => void
  
  // Actions - Sorting
  setSortConfig: (config: StudentSortConfig) => void
  toggleSortDirection: () => void
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  nextPage: () => void
  previousPage: () => void
  
  // Actions - Preferences
  setPreferences: (preferences: Partial<StudentManagementState['preferences']>) => void
  toggleColumn: (column: keyof StudentManagementState['preferences']['columnsVisible']) => void
  
  // Actions - Dialogs
  openDialog: (dialog: keyof StudentManagementState['dialogs']) => void
  closeDialog: (dialog: keyof StudentManagementState['dialogs']) => void
  closeAllDialogs: () => void
  
  // Actions - Reset
  reset: () => void
}

const defaultFilters: StudentFilters = {
  search: '',
  status: 'ALL',
  program: '',
  yearLevel: null,
  hasOverdue: false,
  hasFines: false
}

const defaultSortConfig: StudentSortConfig = {
  field: 'lastName',
  direction: 'asc'
}

const defaultPreferences = {
  showInactiveStudents: false,
  compactMode: false,
  showStatistics: true,
  columnsVisible: {
    studentId: true,
    email: true,
    program: true,
    yearLevel: true,
    borrowingLimit: true,
    status: true,
    activeLoans: true,
    overdueBooks: true,
    fines: true
  }
}

const defaultDialogs = {
  editStudent: false,
  viewStudent: false,
  suspendStudent: false,
  adjustLimit: false,
  preRegister: false,
  importCSV: false
}

export const useStudentManagementStore = create<StudentManagementState>()(
  persist(
    (set) => ({
      // Initial state
      currentView: 'list',
      selectedStudentId: null,
      filters: defaultFilters,
      sortConfig: defaultSortConfig,
      currentPage: 1,
      itemsPerPage: 20,
      preferences: defaultPreferences,
      dialogs: defaultDialogs,
      
      // View actions
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedStudent: (id) => set({ selectedStudentId: id }),
      
      // Filter actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1 // Reset to first page when filters change
        })),
      resetFilters: () =>
        set({
          filters: defaultFilters,
          currentPage: 1
        }),
      
      // Sort actions
      setSortConfig: (config) => set({ sortConfig: config }),
      toggleSortDirection: () =>
        set((state) => ({
          sortConfig: {
            ...state.sortConfig,
            direction: state.sortConfig.direction === 'asc' ? 'desc' : 'asc'
          }
        })),
      
      // Pagination actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
      nextPage: () =>
        set((state) => ({
          currentPage: state.currentPage + 1
        })),
      previousPage: () =>
        set((state) => ({
          currentPage: Math.max(1, state.currentPage - 1)
        })),
      
      // Preference actions
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        })),
      toggleColumn: (column) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            columnsVisible: {
              ...state.preferences.columnsVisible,
              [column]: !state.preferences.columnsVisible[column]
            }
          }
        })),
      
      // Dialog actions
      openDialog: (dialog) =>
        set((state) => ({
          dialogs: { ...state.dialogs, [dialog]: true }
        })),
      closeDialog: (dialog) =>
        set((state) => ({
          dialogs: { ...state.dialogs, [dialog]: false }
        })),
      closeAllDialogs: () => set({ dialogs: defaultDialogs }),
      
      // Reset action
      reset: () =>
        set({
          currentView: 'list',
          selectedStudentId: null,
          filters: defaultFilters,
          sortConfig: defaultSortConfig,
          currentPage: 1,
          dialogs: defaultDialogs
        })
    }),
    {
      name: 'student-management-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        filters: state.filters,
        sortConfig: state.sortConfig,
        itemsPerPage: state.itemsPerPage,
        preferences: state.preferences
      })
    }
  )
)
