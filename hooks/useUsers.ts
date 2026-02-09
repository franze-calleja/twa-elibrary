/**
 * User Management Hooks using TanStack Query
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { StudentPreRegisterInput } from '@/lib/validation'

/**
 * Get all users (Staff only)
 */
export function useUsers(params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any>>('/users', { params })
      return response.data.data
    }
  })
}

/**
 * Get single user details
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any>>(`/users/${id}`)
      return response.data.data
    },
    enabled: !!id
  })
}

/**
 * Pre-register student (Staff only)
 */
export function usePreRegisterStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StudentPreRegisterInput) => {
      const response = await axios.post<ApiResponse<any>>('/users/pre-register', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Import students via CSV (Staff only)
 */
export function useImportStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { students: StudentPreRegisterInput[] }) => {
      const response = await axios.post<ApiResponse<any>>('/users/import-csv', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Update user
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put<ApiResponse<any>>(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
