/**
 * Book Filters Component for Students
 * Search and filter books
 */

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

interface BookFiltersProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (categoryId: string) => void
  onStatusChange: (status: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  currentSearch?: string
  currentCategory?: string
  currentStatus?: string
}

export function BookFilters({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  currentSearch = '',
  currentCategory = '',
  currentStatus = ''
}: BookFiltersProps) {
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [showFilters, setShowFilters] = useState(false)
  const { data: categoriesData } = useCategories()

  const categories = categoriesData?.categories || []

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    onSearchChange('')
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onSearchChange('')
    onCategoryChange('')
    onStatusChange('')
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, ISBN, or publisher..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="grid gap-4 md:grid-cols-3 p-4 border rounded-lg bg-muted/50">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={currentCategory}
              onValueChange={onCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Availability</label>
            <Select
              value={currentStatus}
              onValueChange={onStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Books</SelectItem>
                <SelectItem value="AVAILABLE">Available Only</SelectItem>
                <SelectItem value="BORROWED">Currently Borrowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              defaultValue="title-asc"
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-')
                onSortChange(sortBy, sortOrder as 'asc' | 'desc')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="author-asc">Author (A-Z)</SelectItem>
                <SelectItem value="author-desc">Author (Z-A)</SelectItem>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="md:col-span-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
