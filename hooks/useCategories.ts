/**
 * Category Management Hooks
 * Custom hooks for fetching and mutating category data
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import axios from '@/lib/api'

// Types
export interface Category {
  id: string
  name: string
  description: string | null
  parentId: string | null
  parent?: Category
  children?: Category[]
  books?: any[]
  _count?: {
    books: number
    children: number
  }
  createdAt: string
  updatedAt: string
}

export interface CategoryInput {
  name: string
  description?: string
  parentId?: string
}

// ================================
// Query Hooks
// ================================

/**
 * Fetch all categories
 */
export function useCategories(includeHierarchy = false): UseQueryResult<{ categories: Category[] }> {
  return useQuery({
    queryKey: ['categories', { includeHierarchy }],
    queryFn: async () => {
      const res = await axios.get('/categories', {
        params: { includeHierarchy }
      })
      return res.data.data
    },
    staleTime: 10 * 60 * 1000 // 10 minutes (categories don't change often)
  })
}

/**
 * Fetch single category by ID
 */
export function useCategory(id: string | null): UseQueryResult<{ category: Category }> {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const res = await axios.get(`/categories/${id}`)
      return res.data.data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  })
}

// ================================
// Mutation Hooks
// ================================

/**
 * Create a new category
 */
export function useCreateCategory(): UseMutationResult<{ category: Category }, any, CategoryInput> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CategoryInput) => {
      const res = await axios.post('/categories', data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

/**
 * Update an existing category
 */
export function useUpdateCategory(id: string): UseMutationResult<
  { category: Category },
  any,
  Partial<CategoryInput>
> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<CategoryInput>) => {
      const res = await axios.patch(`/categories/${id}`, data)
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['categories', id], data)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

/**
 * Delete a category
 */
export function useDeleteCategory(): UseMutationResult<void, any, string> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}
