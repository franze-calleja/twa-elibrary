/**
 * Student Dashboard Hooks
 * Custom hooks for fetching student dashboard data
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/api'
import type { ApiResponse, StudentDashboardStats, TransactionWithDetails } from '@/types'

// ================================
// Student Dashboard Statistics
// ================================

/**
 * Fetch student dashboard statistics
 */
export function useStudentDashboardStats() {
  return useQuery({
    queryKey: ['student-dashboard', 'stats'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<StudentDashboardStats>>('/student/dashboard/stats')
      return response.data.data!
    },
    staleTime: 30 * 1000, // 30 seconds - student stats can be slightly stale
    refetchInterval: 2 * 60 * 1000 // Auto-refetch every 2 minutes
  })
}

// ================================
// Recent Borrows
// ================================

interface RecentBorrowsParams {
  limit?: number
}

interface RecentBorrowsResponse {
  transactions: TransactionWithDetails[]
  total: number
}

/**
 * Fetch recent borrowing transactions
 */
export function useRecentBorrows(params?: RecentBorrowsParams) {
  return useQuery({
    queryKey: ['student-dashboard', 'recent-borrows', params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<RecentBorrowsResponse>>('/student/dashboard/recent-borrows', {
        params
      })
      return response.data.data!
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000 // Auto-refetch every 2 minutes
  })
}

// ================================
// Combined Student Dashboard Hook
// ================================

/**
 * Fetch all student dashboard data at once
 * Useful for dashboard overview page
 */
export function useStudentDashboard() {
  const stats = useStudentDashboardStats()
  const recentBorrows = useRecentBorrows({ limit: 5 })

  return {
    stats: {
      data: stats.data,
      isLoading: stats.isLoading,
      error: stats.error,
      refetch: stats.refetch
    },
    recentBorrows: {
      data: recentBorrows.data,
      isLoading: recentBorrows.isLoading,
      error: recentBorrows.error,
      refetch: recentBorrows.refetch
    },
    isLoading: stats.isLoading || recentBorrows.isLoading,
    isError: stats.isError || recentBorrows.isError,
    error: stats.error || recentBorrows.error,
    refetchAll: () => {
      stats.refetch()
      recentBorrows.refetch()
    }
  }
}
