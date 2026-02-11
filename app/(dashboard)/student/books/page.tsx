/**
 * Browse Books Page - Student
 * Complete book browsing with search, filters, and pagination
 */

'use client'

import { useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { StudentBookCard } from '@/components/student/StudentBookCard'
import { BookFilters } from '@/components/student/BookFilters'
import { Pagination } from '@/components/student/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, BookOpen } from 'lucide-react'

export default function BrowseBooksPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const limit = 12 // Books per page

  const { data, isLoading, error } = useBooks({
    page,
    limit,
    search,
    categoryId,
    status,
    sortBy,
    sortOrder
  })

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setPage(1) // Reset to first page on search
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategoryId(newCategory)
    setPage(1)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Books</h1>
        <p className="text-muted-foreground">
          Explore our library collection and find your next read
        </p>
      </div>

      {/* Filters */}
      <BookFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
        currentSearch={search}
        currentCategory={categoryId}
        currentStatus={status}
      />

      {/* Results Summary */}
      {data && !isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, data.pagination.total)} of{' '}
            {data.pagination.total} books
          </p>
          <p>
            Page {page} of {data.pagination.totalPages}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg">
              <Skeleton className="w-20 h-28 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Books</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load books. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Books Grid */}
      {data && !isLoading && data.books.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {data.books.map((book) => (
            <StudentBookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {data && !isLoading && data.books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Books Found</h3>
          <p className="text-muted-foreground max-w-md">
            {search || categoryId || status
              ? 'Try adjusting your filters or search query to find more books.'
              : 'There are no books available in the library yet.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
