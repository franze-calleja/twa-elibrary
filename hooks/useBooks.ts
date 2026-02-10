/**
 * Book Management Hooks
 * Custom hooks for fetching and mutating book data
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import axios from '@/lib/api'
import type { BookInput } from '@/lib/validation'

// Types
export interface Book {
  id: string
  barcode: string
  isbn: string | null
  title: string
  author: string
  publisher: string | null
  publicationYear: number | null
  edition: string | null
  pages: number | null
  description: string | null
  language: string
  location: string | null
  status: string
  coverImage: string | null
  quantity: number
  availableQuantity: number
  categories: {
    id: string
    bookId: string
    categoryId: string
    category: {
      id: string
      name: string
      description: string | null
    }
  }[]
  transactions?: any[]
  reservations?: any[]
  _count?: {
    transactions: number
    reservations: number
  }
  createdAt: string
  updatedAt: string
}

export interface BooksResponse {
  books: Book[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BooksParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoryId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateBookResponse {
  book: Book
  generatedBarcode?: string
}

// ================================
// Query Hooks
// ================================

/**
 * Fetch paginated books list with filters
 */
export function useBooks(params?: BooksParams): UseQueryResult<BooksResponse> {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const res = await axios.get('/books', { params })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Fetch single book by ID
 */
export function useBook(id: string | null): UseQueryResult<{ book: Book }> {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async () => {
      const res = await axios.get(`/books/${id}`)
      return res.data.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Fetch book by barcode (for scanning)
 */
export function useBookByBarcode(barcode: string | null): UseQueryResult<{ book: Book }> {
  return useQuery({
    queryKey: ['books', 'barcode', barcode],
    queryFn: async () => {
      const res = await axios.get(`/books/barcode/${barcode}`)
      return res.data.data
    },
    enabled: !!barcode,
    retry: false // Don't retry on barcode not found
  })
}

/**
 * Fetch barcode image for a book
 */
export function useBarcodeImage(bookId: string | null): UseQueryResult<{
  barcode: string
  title: string
  imageDataUrl: string
}> {
  return useQuery({
    queryKey: ['books', bookId, 'barcode-image'],
    queryFn: async () => {
      const res = await axios.get(`/books/${bookId}/barcode-image`)
      return res.data.data
    },
    enabled: !!bookId,
    staleTime: Infinity // Barcode image doesn't change
  })
}

// ================================
// Mutation Hooks
// ================================

/**
 * Create a new book
 */
export function useCreateBook(): UseMutationResult<CreateBookResponse, any, BookInput> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BookInput) => {
      const res = await axios.post('/books', data)
      return res.data.data
    },
    onSuccess: () => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

/**
 * Update an existing book
 */
export function useUpdateBook(id: string): UseMutationResult<{ book: Book }, any, Partial<BookInput>> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<BookInput>) => {
      const res = await axios.patch(`/books/${id}`, data)
      return res.data.data
    },
    onSuccess: (data) => {
      // Update specific book in cache
      queryClient.setQueryData(['books', id], data)
      
      // Invalidate books list
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

/**
 * Delete a book
 */
export function useDeleteBook(): UseMutationResult<void, any, string> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/books/${id}`)
    },
    onSuccess: () => {
      // Invalidate books list
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

/**
 * Update book status (AVAILABLE, MAINTENANCE, etc.)
 */
export function useUpdateBookStatus(id: string): UseMutationResult<
  { book: Book },
  any,
  { status: string }
> {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const res = await axios.patch(`/books/${id}`, { status })
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['books', id], data)
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}
