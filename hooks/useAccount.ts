/**
 * Account Management Hooks
 * Custom hooks for student account/profile management with TanStack Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import axios from '@/lib/api'
import { useAccountStore, type UserProfile } from '@/store/accountStore'
import { useAuthStore } from '@/store/authStore'
import type { UpdateProfileInput, ChangePasswordInput } from '@/lib/validation'

// ================================
// Types
// ================================

interface ProfileResponse {
  success: boolean
  data: {
    profile: UserProfile
  }
  message?: string
}

interface UpdateProfileResponse {
  success: boolean
  data: {
    profile: UserProfile
  }
  message: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// ================================
// API Service Functions
// ================================

/**
 * Fetch current user's profile
 */
async function fetchProfile(): Promise<UserProfile> {
  console.log('[useAccount] Fetching profile...')
  const response = await axios.get<ProfileResponse>('/account')
  console.log('[useAccount] Profile fetched:', response.data)
  return response.data.data.profile
}

/**
 * Update current user's profile
 */
async function updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
  const response = await axios.patch<UpdateProfileResponse>('/account', data)
  return response.data.data.profile
}

/**
 * Change current user's password
 */
async function changePassword(data: ChangePasswordInput): Promise<string> {
  const response = await axios.put<ChangePasswordResponse>('/account/password', data)
  return response.data.message
}

// ================================
// React Query Hooks
// ================================

/**
 * Hook to fetch current user's profile
 * @returns Query result with profile data
 * 
 * @example
 * const { data: profile, isLoading, error } = useProfile()
 */
export function useProfile(): UseQueryResult<UserProfile, Error> {
  const { user, isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!user || isAuthenticated, // Enable if user exists or isAuthenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })
}

/**
 * Hook to update current user's profile
 * @returns Mutation result
 * 
 * @example
 * const updateProfileMutation = useUpdateProfile()
 * updateProfileMutation.mutate({ phone: '+1234567890' })
 */
export function useUpdateProfile(): UseMutationResult<
  UserProfile,
  Error,
  UpdateProfileInput,
  unknown
> {
  const queryClient = useQueryClient()
  const { updateProfile: updateProfileStore } = useAccountStore()
  const { updateUser } = useAuthStore()

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] })

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile'])

      // Optimistically update to the new value
      if (previousProfile) {
        const optimisticProfile = { 
          ...previousProfile, 
          ...newData 
        }
        queryClient.setQueryData(['profile'], optimisticProfile)
        updateProfileStore(newData)
      }

      return { previousProfile }
    },
    onSuccess: (data) => {
      // Update the profile in cache
      queryClient.setQueryData(['profile'], data)
      
      // Update Zustand store
      updateProfileStore(data)
      
      // Also update auth store to keep in sync (only compatible fields)
      const authUpdate = {
        phone: data.phone,
        avatar: data.avatar
      }
      updateUser(authUpdate)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error, variables, context: any) => {
      // Rollback to previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile)
        updateProfileStore(context.previousProfile)
      }
    }
  })
}

/**
 * Hook to change current user's password
 * @returns Mutation result
 * 
 * @example
 * const changePasswordMutation = useChangePassword()
 * changePasswordMutation.mutate({
 *   currentPassword: 'oldpass',
 *   newPassword: 'newpass',
 *   confirmNewPassword: 'newpass'
 * })
 */
export function useChangePassword(): UseMutationResult<
  string,
  Error,
  ChangePasswordInput,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      // Create audit log entry (handled on backend)
      // Optionally invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

/**
 * Hook to get profile statistics
 * Extracts useful stats from profile data
 * 
 * @example
 * const stats = useProfileStats()
 * console.log(stats.activeLoans, stats.unpaidFines)
 */
export function useProfileStats() {
  const { data: profile } = useProfile()

  if (!profile) {
    return {
      activeLoans: 0,
      unpaidFines: 0,
      borrowingLimit: 0,
      availableSlots: 0,
      canBorrow: false
    }
  }

  const activeLoans = profile._count?.transactions || 0
  const unpaidFines = profile._count?.fines || 0
  const borrowingLimit = profile.borrowingLimit
  const availableSlots = borrowingLimit - activeLoans

  return {
    activeLoans,
    unpaidFines,
    borrowingLimit,
    availableSlots,
    canBorrow: availableSlots > 0 && unpaidFines === 0 && profile.status === 'ACTIVE'
  }
}

/**
 * Hook to check if user can borrow books
 * @returns boolean indicating if user is eligible to borrow
 * 
 * @example
 * const canBorrow = useCanBorrow()
 * if (canBorrow) { ... }
 */
export function useCanBorrow(): boolean {
  const { data: profile } = useProfile()

  if (!profile) return false

  const activeLoans = profile._count?.transactions || 0
  const unpaidFines = profile._count?.fines || 0
  const hasOverdueFines = unpaidFines > 0

  return (
    profile.status === 'ACTIVE' &&
    activeLoans < profile.borrowingLimit &&
    !hasOverdueFines
  )
}

/**
 * Helper hook to get full name
 * @returns formatted full name
 * 
 * @example
 * const fullName = useFullName()
 */
export function useFullName(): string {
  const { data: profile } = useProfile()

  if (!profile) return ''

  const parts = [
    profile.firstName,
    profile.middleName,
    profile.lastName
  ].filter(Boolean)

  return parts.join(' ')
}
