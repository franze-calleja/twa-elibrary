/**
 * Book Form Dialog Component
 * Handles both creating and editing books
 */

'use client'

import { useState, useEffect } from 'react'
import { useCreateBook, useUpdateBook } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Camera, X, FolderPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BarcodeScannerDialog } from '@/components/books/BarcodeScannerDialog'
import { CategoryManagementDialog } from '@/components/categories/CategoryManagementDialog'

interface BookFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book?: any
  onSuccess: () => void
}

export function BookFormDialog({ open, onOpenChange, book, onSuccess }: BookFormDialogProps) {
  const { toast } = useToast()
  const isEditing = !!book
  
  const { data: categoriesData } = useCategories()
  const createBook = useCreateBook()
  const updateBook = useUpdateBook(book?.id || '')
  
  const categories = categoriesData?.categories || []
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    edition: '',
    description: '',
    language: 'English',
    location: '',
    quantity: 1,
    barcode: '',
    categoryIds: [] as string[]
  })
  
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  
  // Populate form when editing
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        edition: book.edition || '',
        description: book.description || '',
        language: book.language || 'English',
        location: book.location || '',
        quantity: book.quantity || 1,
        barcode: book.barcode || '',
        categoryIds: book.categories?.map((bc: any) => bc.categoryId) || []
      })
    } else {
      // Reset form for new book
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        edition: '',
        description: '',
        language: 'English',
        location: '',
        quantity: 1,
        barcode: '',
        categoryIds: []
      })
    }
    setError(null)
  }, [book, open])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }))
  }
  
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }))
  }
  
  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({...prev, barcode }))
    setShowScanner(false)
    toast({
      title: 'Barcode Scanned',
      description: barcode
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!formData.author.trim()) {
      setError('Author is required')
      return
    }
    
    if (formData.categoryIds.length === 0) {
      setError('Select at least one category')
      return
    }
    
    const mutation = isEditing ? updateBook : createBook
    
    mutation.mutate(formData as any, {
      onSuccess: (data: any) => {
        toast({
          title: 'Success',
          description: isEditing 
            ? 'Book updated successfully' 
            : `Book created successfully${data.generatedBarcode ? ` with barcode ${data.generatedBarcode}` : ''}`
        })
        onSuccess()
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} book`
        setError(errorMessage)
      }
    })
  }
  
  const isPending = createBook.isPending || updateBook.isPending
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update book information' 
                : 'Fill in the book details. Barcode will be auto-generated if not provided.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode {!isEditing && '(Optional)'}</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder={isEditing ? book.barcode : 'Leave empty to auto-generate'}
                  disabled={isPending || isEditing}
                  className="flex-1"
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScanner(true)}
                    disabled={isPending}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {!isEditing && !formData.barcode && (
                <p className="text-xs text-muted-foreground">
                  Will be auto-generated in format: LIB-YEAR-XXXXX
                </p>
              )}
            </div>
            
            {/* Title and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                  placeholder="Enter book title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                  placeholder="Enter author name"
                />
              </div>
            </div>
            
            {/* ISBN and Publisher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="10 or 13 digits (e.g., 1234567890)"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if unavailable
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="Enter publisher name"
                />
              </div>
            </div>
            
            {/* Publication Year, Edition, Language */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publicationYear">Publication Year</Label>
                <Input
                  id="publicationYear"
                  name="publicationYear"
                  type="number"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  disabled={isPending}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="e.g., 2nd Edition"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>
            </div>
            
            {/* Quantity and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  disabled={isPending}
                  min="1"
                />
                {isEditing && book.availableQuantity !== book.quantity && (
                  <p className="text-xs text-muted-foreground">
                    Currently {book.quantity - book.availableQuantity} borrowed
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Shelf Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="e.g., A-123"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Enter book description"
                rows={3}
              />
            </div>
            
            {/* Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categories *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCategoryDialog(true)}
                  className="h-7 text-xs"
                >
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                  Manage
                </Button>
              </div>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          disabled={isPending}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formData.categoryIds.length === 0 && (
                <p className="text-xs text-destructive">Select at least one category</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Book' : 'Create Book'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Barcode Scanner Dialog */}
      <BarcodeScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleBarcodeScanned}
      />
      
      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </>
  )
}
