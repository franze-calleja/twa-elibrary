/**
 * Books Management Page - Staff
 * Lists all books with search, filters, and CRUD operations in dialogs
 */

'use client'

import { useState, useEffect } from 'react'
import { useBooks, useDeleteBook } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Search, Plus, Loader2, Eye, Edit, Trash2, BookOpen, Filter, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { BookFormDialog } from '@/components/books/BookFormDialog'

export default function BooksPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const limit = 10
  
  // Prevent hydration mismatch with Select components
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { data, isLoading, refetch } = useBooks({ 
    page, 
    limit, 
    search,
    status: statusFilter,
    categoryId: categoryFilter
  })
  
  const { data: categoriesData } = useCategories()
  const deleteBook = useDeleteBook()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingBook, setEditingBook] = useState<any>(null)
  const [deletingBook, setDeletingBook] = useState<any>(null)
  
  const books = data?.books || []
  const pagination = data?.pagination
  const categories = categoriesData?.categories || []
  
  const handleDelete = async () => {
    if (!deletingBook) return
    
    deleteBook.mutate(deletingBook.id, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Book deleted successfully'
        })
        setDeletingBook(null)
        refetch()
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to delete book',
          variant: 'destructive'
        })
      }
    })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default'
      case 'BORROWED':
        return 'secondary'
      case 'RESERVED':
        return 'outline'
      case 'MAINTENANCE':
        return 'outline'
      case 'LOST':
      case 'DAMAGED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }
  
  const clearFilters = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setSearch('')
    setPage(1)
  }
  
  const hasFilters = statusFilter || categoryFilter || search
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">Manage library books inventory</p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>
      
      <Card className="p-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, ISBN, or barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            
            {mounted && (
              <>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Statuses</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="BORROWED">Borrowed</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasFilters ? 'Try adjusting your filters' : 'Add your first book to get started'}
            </p>
            {!hasFilters && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book: any) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-mono text-sm">{book.barcode}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {book.title}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{book.author}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {book.categories.slice(0, 2).map((bc: any) => (
                            <Badge key={bc.categoryId} variant="outline" className="text-xs">
                              {bc.category.name}
                            </Badge>
                          ))}
                          {book.categories.length > 2 && (
                            <Badge key="more-categories" variant="outline" className="text-xs">
                              +{book.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(book.status)}>
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {book.availableQuantity}/{book.quantity}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {book.location || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/staff/books/${book.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingBook(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeletingBook(book)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {books.length} of {pagination.total} books
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Page {page} of {pagination.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Create Book Dialog */}
      <BookFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          refetch()
        }}
      />
      
      {/* Edit Book Dialog */}
      {editingBook && (
        <BookFormDialog
          open={!!editingBook}
          onOpenChange={(open) => !open && setEditingBook(null)}
          book={editingBook}
          onSuccess={() => {
            setEditingBook(null)
            refetch()
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBook} onOpenChange={(open) => !open && setDeletingBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&quot;{deletingBook?.title}&quot;</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBook.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBook.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBook.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
