/**
 * Category Management Dialog Component
 * For adding and managing book categories
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2, FolderPlus, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface CategoryManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManagementDialog({ open, onOpenChange }: CategoryManagementDialogProps) {
  const { toast } = useToast()
  const { data: categoriesData, isLoading, error } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const categories = categoriesData?.categories || []
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      })
      return
    }
    
    createCategory.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Category created successfully'
          })
          setName('')
          setDescription('')
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.response?.data?.error?.message || 'Failed to create category',
            variant: 'destructive'
          })
        }
      }
    )
  }
  
  const handleDelete = () => {
    if (!deleteId) return
    
    deleteCategory.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        })
        setDeleteId(null)
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to delete category',
          variant: 'destructive'
        })
        setDeleteId(null)
      }
    })
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Create and manage book categories for organizing your library collection
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Category Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Add New Category
              </h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Category Name *
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Computer Science"
                    disabled={createCategory.isPending}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-1 block">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this category..."
                    rows={3}
                    disabled={createCategory.isPending}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCategory.isPending || !name.trim()}
                >
                  {createCategory.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            {/* Existing Categories List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                Existing Categories ({categories.length})
              </h3>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load categories. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? null : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No categories yet. Create your first category!
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {categories.map((category: any) => (
                    <Card key={category.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {category.name}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {category._count?.books || 0}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(category.id)}
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. You can only delete categories that have no books assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
