/**
 * Authentication Hooks using TanStack Query
 * Provides hooks for login, register, logout, and fetching current user
 */

'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginInput, RegisterInput } from '@/lib/validation'
import type { ApiResponse, LoginResponse, RegisterResponse } from '@/types'

/**
 * Login hook
 */
export function useLogin() {
  const router = useRouter()
  const { setAuth, setLoading } = useAuthStore()
  
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await axios.post<ApiResponse<LoginResponse>>('/auth/login', data)
      return response.data
    },
    onMutate: () => {
      setLoading(true)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { user, token } = data.data
        
        // Store auth data
        setAuth(user, token)
        
        // Redirect based on role
        if (user.role === 'STAFF') {
          router.push('/staff/dashboard')
        } else {
          router.push('/student/dashboard')
        }
      }
    },
    onError: (error) => {
      setLoading(false)
      console.error('Login error:', error)
    }
  })
}

/**
 * Register hook
 */
export function useRegister() {
  const router = useRouter()
  const { setLoading } = useAuthStore()
  
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await axios.post<ApiResponse<RegisterResponse>>('/auth/register', data)
      return response.data
    },
    onMutate: () => {
      setLoading(true)
    },
    onSuccess: () => {
      setLoading(false)
      // Redirect to login after successful registration
      router.push('/login')
    },
    onError: () => {
      setLoading(false)
    }
  })
}

/**
 * Logout hook
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  
  return useMutation({
    mutationFn: async () => {
      const response = await axios.post('/auth/logout')
      return response.data
    },
    onSuccess: () => {
      // Clear auth state
      logout()
      
      // Clear all queries
      queryClient.clear()
      
      // Redirect to login
      router.push('/login')
    },
    onError: (error) => {
      // Even if the API call fails, logout locally
      console.error('Logout error:', error)
      logout()
      queryClient.clear()
      router.push('/login')
    }
  })
}

/**
 * Get current user hook
 */
export function useCurrentUser() {
  const { user, token, setAuth, logout } = useAuthStore()
  
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<{ user: any }>>('/auth/me')
      return response.data
    },
    enabled: !!token, // Only run if token exists
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  
  // Handle success/error in an effect to avoid state updates during render
  useEffect(() => {
    if (query.data?.success && query.data.data && token) {
      const userData = query.data.data.user
      if (JSON.stringify(user) !== JSON.stringify(userData)) {
        setAuth(userData, token)
      }
    }

    if (query.isError && token) {
      // Token is invalid, logout
      logout()
    }
    // We intentionally include only these dependencies to respond to auth query changes
  }, [query.data, query.isError, token, user, setAuth, logout])
  
  return query
}

/**
 * Check authentication status hook
 */
export function useAuth() {
  const { user, token, isAuthenticated, isLoading } = useAuthStore()
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser()
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isLoadingUser,
    isStaff: user?.role === 'STAFF',
    isStudent: user?.role === 'STUDENT'
  }
}
