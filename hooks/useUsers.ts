/**
 * User Management Hooks using TanStack Query
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/api'
import type { ApiResponse, UserWithStats } from '@/types'
import type { StudentPreRegisterInput, StaffUpdateStudentInput, CreateAdminInput, StaffResetPasswordInput } from '@/lib/validation'

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
 * Get single user details with stats
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<{ user: UserWithStats; stats: any }>>(`/users/${id}`)
      return response.data.data
    },
    enabled: !!id
  })
}

/**
 * Get student details (alias for useUser with better naming for student context)
 */
export function useStudent(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<{ user: UserWithStats; stats: any }>>(`/users/${id}`)
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

/**
 * Update student information (Staff only) - More descriptive naming
 */
export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StaffUpdateStudentInput) => {
      const response = await axios.put<ApiResponse<{ user: UserWithStats }>>(`/users/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // Refresh dashboard if student stats changed
      return data
    }
  })
}

/**
 * Update student status (quick action for activate/suspend/deactivate)
 * 
 * Status Transition Rules:
 * - INACTIVE → ACTIVE: Only through registration (will be rejected)
 * - ACTIVE → SUSPENDED: Allowed (suspend student)
 * - SUSPENDED → ACTIVE: Allowed (reactivate student)
 * - Any → INACTIVE: Blocked (INACTIVE is for pre-registration only)
 * 
 * @param id - Student user ID
 */
export function useUpdateStudentStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
      const response = await axios.put<ApiResponse<{ user: UserWithStats }>>(`/users/${id}`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

/**
 * Update student borrowing limit (quick action)
 */
export function useUpdateBorrowingLimit(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (borrowingLimit: number) => {
      const response = await axios.put<ApiResponse<{ user: UserWithStats }>>(`/users/${id}`, { borrowingLimit })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Reset any user's password (Staff only — no current password required)
 */
export function useResetUserPassword(id: string) {
  return useMutation({
    mutationFn: async (data: StaffResetPasswordInput) => {
      const response = await axios.post<ApiResponse<{ message: string }>>(`/users/${id}/password`, data)
      return response.data
    }
  })
}

/**
 * Create a new admin/staff account (Staff only)
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAdminInput) => {
      const response = await axios.post<ApiResponse<{ admin: UserWithStats }>>('/users/create-admin', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
