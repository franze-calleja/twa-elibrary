/**
 * Transaction Hooks (TanStack Query)
 * Custom hooks for borrowing, returning, and managing transactions
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import axios from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useTransactionStore } from '@/store/transactionStore'
import type { 
  TransactionWithDetails, 
  BorrowRequest, 
  ProcessBorrow, 
  ReturnBookRequest,
  RenewBookRequest,
  TransactionQueryParams,
  PaginatedResponse
} from '@/types'
import type { Transaction } from '@prisma/client'

// ================================
// Query Hooks
// ================================

/**
 * Fetch transactions with filters
 */
export function useTransactions(params?: TransactionQueryParams): UseQueryResult<{
  transactions: TransactionWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const res = await axios.get('/transactions', { params })
      return res.data.data
    },
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000 // 1 minute
  })
}

/**
 * Fetch single transaction by ID
 */
export function useTransaction(id: string | null): UseQueryResult<{
  transaction: TransactionWithDetails
}> {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const res = await axios.get(`/transactions/${id}`)
      return res.data.data
    },
    enabled: !!id && isAuthenticated,
    staleTime: 1 * 60 * 1000
  })
}

/**
 * Fetch my active transactions (student)
 */
export function useMyActiveLoans(): UseQueryResult<{
  transactions: TransactionWithDetails[]
  pagination: any
}> {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', 'my-active'],
    queryFn: async () => {
      const res = await axios.get('/transactions', {
        params: {
          userId: user?.id,
          status: 'ACTIVE',
          limit: 100
        }
      })
      return res.data.data
    },
    enabled: !!user && user.role === 'STUDENT' && isAuthenticated,
    staleTime: 30 * 1000 // 30 seconds
  })
}

/**
 * Fetch my pending requests (student)
 */
export function useMyPendingRequests(): UseQueryResult<{
  transactions: TransactionWithDetails[]
  pagination: any
}> {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', 'my-pending'],
    queryFn: async () => {
      const res = await axios.get('/transactions', {
        params: {
          userId: user?.id,
          status: 'PENDING',
          limit: 100
        }
      })
      return res.data.data
    },
    enabled: !!user && user.role === 'STUDENT' && isAuthenticated,
    staleTime: 30 * 1000
  })
}

/**
 * Fetch pending requests for staff
 */
export function usePendingRequests(params?: TransactionQueryParams): UseQueryResult<{
  transactions: TransactionWithDetails[]
  pagination: any
}> {
  const { user, isAuthenticated } = useAuthStore()
  const { setPendingCount } = useTransactionStore()
  
  return useQuery({
    queryKey: ['transactions', 'staff-pending', params],
    queryFn: async () => {
      const res = await axios.get('/transactions', {
        params: {
          ...params,
          status: 'PENDING'
        }
      })
      
      // Update pending count in store for badge
      setPendingCount(res.data.data.pagination.total)
      
      return res.data.data
    },
    enabled: !!user && user.role === 'STAFF' && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
    refetchInterval: 60 * 1000 // Refetch every minute
  })
}

/**
 * Get transaction statistics
 */
export function useTransactionStats(): UseQueryResult<{
  total: number
  pending: number
  active: number
  returned: number
  overdue: number
  rejected: number
}> {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', 'stats'],
    queryFn: async () => {
      // Fetch counts for each status
      const [pending, active, returned, overdue, rejected] = await Promise.all([
        axios.get('/transactions', { params: { status: 'PENDING', limit: 1 } }),
        axios.get('/transactions', { params: { status: 'ACTIVE', limit: 1 } }),
        axios.get('/transactions', { params: { status: 'RETURNED', limit: 1 } }),
        axios.get('/transactions', { params: { status: 'OVERDUE', limit: 1 } }),
        axios.get('/transactions', { params: { status: 'REJECTED', limit: 1 } })
      ])
      
      const stats = {
        pending: pending.data.data.pagination.total,
        active: active.data.data.pagination.total,
        returned: returned.data.data.pagination.total,
        overdue: overdue.data.data.pagination.total,
        rejected: rejected.data.data.pagination.total,
        total: 0
      }
      
      stats.total = stats.pending + stats.active + stats.returned + stats.overdue + stats.rejected
      
      return stats
    },
    enabled: !!user && user.role === 'STAFF' && isAuthenticated,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// ================================
// Mutation Hooks
// ================================

/**
 * Create borrow request (student)
 */
export function useCreateBorrowRequest(): UseMutationResult<any, any, BorrowRequest> {
  const queryClient = useQueryClient()
  const { setScannedBarcode } = useTransactionStore()
  
  return useMutation({
    mutationFn: async (data: BorrowRequest) => {
      const res = await axios.post('/transactions', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['account'] })
      setScannedBarcode(null) // Clear scanned barcode
    }
  })
}

/**
 * Process borrow request (staff approve/reject)
 */
export function useProcessBorrowRequest(transactionId: string): UseMutationResult<any, any, any> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.patch(`/transactions/${transactionId}/process`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Return book (staff)
 */
export function useReturnBook(transactionId: string): UseMutationResult<any, any, ReturnBookRequest> {
  const queryClient = useQueryClient()
  const { setScannedBarcode } = useTransactionStore()
  
  return useMutation({
    mutationFn: async (data: ReturnBookRequest) => {
      const res = await axios.patch(`/transactions/${transactionId}/return`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['fines'] })
      setScannedBarcode(null)
    }
  })
}

/**
 * Renew book (student or staff)
 */
export function useRenewBook(transactionId: string): UseMutationResult<any, any, any> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any = {}) => {
      const res = await axios.patch(`/transactions/${transactionId}/renew`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['account'] })
    }
  })
}

/**
 * Cancel pending request (student)
 */
export function useCancelRequest(transactionId: string): UseMutationResult<any, any, void> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // This would be a DELETE or PATCH endpoint to cancel
      const res = await axios.delete(`/transactions/${transactionId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

// ================================
// Utility Hooks
// ================================

/**
 * Check if user can borrow a specific book
 */
export function useCanBorrowBook(bookId: string | null): UseQueryResult<{
  eligible: boolean
  reason?: string
  details?: any
}> {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['borrow-eligibility', bookId],
    queryFn: async () => {
      const res = await axios.get(`/books/${bookId}/can-borrow`)
      return res.data.data
    },
    enabled: !!user && !!bookId && user.role === 'STUDENT' && isAuthenticated,
    staleTime: 0 // Always fresh check
  })
}
