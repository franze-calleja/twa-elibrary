/**
 * Dashboard Hooks
 * Custom hooks for fetching staff dashboard data
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/api'
import type { ApiResponse, DashboardStats, TransactionWithDetails, PaginationMeta } from '@/types'

// ================================
// Dashboard Statistics
// ================================

/**
 * Fetch overall dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<DashboardStats>>('/dashboard/stats')
      return response.data.data!
    },
    staleTime: 60 * 1000, // 1 minute - stats can be slightly stale
    refetchInterval: 5 * 60 * 1000 // Auto-refetch every 5 minutes
  })
}

// ================================
// Recent Activities
// ================================

interface RecentActivitiesParams {
  limit?: number
}

interface RecentActivitiesResponse {
  activities: TransactionWithDetails[]
  total: number
}

/**
 * Fetch recent activities/transactions
 */
export function useRecentActivities(params?: RecentActivitiesParams) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<RecentActivitiesResponse>>('/dashboard/recent-activities', {
        params
      })
      return response.data.data!
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000 // Auto-refetch every 2 minutes
  })
}

// ================================
// Overdue Books
// ================================

interface OverdueBooksParams {
  page?: number
  limit?: number
}

interface OverdueBooksResponse {
  overdueBooks: TransactionWithDetails[]
  pagination: PaginationMeta
}

/**
 * Fetch overdue books/transactions
 */
export function useOverdueBooks(params?: OverdueBooksParams) {
  return useQuery({
    queryKey: ['dashboard', 'overdue-books', params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<OverdueBooksResponse>>('/dashboard/overdue-books', {
        params
      })
      return response.data.data!
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000 // Auto-refetch every 2 minutes
  })
}

// ================================
// Pending Requests
// ================================

interface PendingRequestsParams {
  page?: number
  limit?: number
}

interface PendingRequestsResponse {
  pendingRequests: TransactionWithDetails[]
  pagination: PaginationMeta
}

/**
 * Fetch pending borrow requests
 */
export function usePendingRequests(params?: PendingRequestsParams) {
  return useQuery({
    queryKey: ['dashboard', 'pending-requests', params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PendingRequestsResponse>>('/dashboard/pending-requests', {
        params
      })
      return response.data.data!
    },
    staleTime: 15 * 1000, // 15 seconds - pending requests need fresher data
    refetchInterval: 60 * 1000 // Auto-refetch every 1 minute
  })
}

// ================================
// Combined Dashboard Hook
// ================================

/**
 * Fetch all dashboard data at once
 * Useful for dashboard overview page
 */
export function useDashboard() {
  const stats = useDashboardStats()
  const recentActivities = useRecentActivities({ limit: 5 })
  const overdueBooks = useOverdueBooks({ limit: 5 })
  const pendingRequests = usePendingRequests({ limit: 5 })

  return {
    stats: {
      data: stats.data,
      isLoading: stats.isLoading,
      error: stats.error,
      refetch: stats.refetch
    },
    recentActivities: {
      data: recentActivities.data,
      isLoading: recentActivities.isLoading,
      error: recentActivities.error,
      refetch: recentActivities.refetch
    },
    overdueBooks: {
      data: overdueBooks.data,
      isLoading: overdueBooks.isLoading,
      error: overdueBooks.error,
      refetch: overdueBooks.refetch
    },
    pendingRequests: {
      data: pendingRequests.data,
      isLoading: pendingRequests.isLoading,
      error: pendingRequests.error,
      refetch: pendingRequests.refetch
    },
    isLoading: stats.isLoading || recentActivities.isLoading || overdueBooks.isLoading || pendingRequests.isLoading,
    isError: stats.isError || recentActivities.isError || overdueBooks.isError || pendingRequests.isError,
    error: stats.error || recentActivities.error || overdueBooks.error || pendingRequests.error,
    refetchAll: () => {
      stats.refetch()
      recentActivities.refetch()
      overdueBooks.refetch()
      pendingRequests.refetch()
    }
  }
}
