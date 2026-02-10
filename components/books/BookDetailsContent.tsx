/**
 * Book Details Content - Client Component
 * Displays complete book information with interactive elements
 */

'use client'

import { useState } from 'react'
import { useBook, useBarcodeImage, useUpdateBookStatus } from '@/hooks/useBooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, Edit, Download, User, Clock, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookFormDialog } from '@/components/books/BookFormDialog'
import { format } from 'date-fns'
import Image from 'next/image'

interface BookDetailsContentProps {
  bookId: string
}

export function BookDetailsContent({ bookId }: BookDetailsContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data, isLoading, refetch } = useBook(bookId)
  const { data: barcodeData, isLoading: barcodeLoading } = useBarcodeImage(bookId)
  const updateStatus = useUpdateBookStatus(bookId)
  
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  const book = data?.book
  
  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ status }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Book status updated'
        })
        refetch()
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to update status',
          variant: 'destructive'
        })
      }
    })
  }
  
  const downloadBarcode = () => {
    if (!barcodeData?.imageDataUrl) return
    
    const link = document.createElement('a')
    link.href = barcodeData.imageDataUrl
    link.download = `barcode-${book?.barcode}.png`
    link.click()
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Book not found</h2>
        <Button asChild>
          <Link href="/staff/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    )
  }
  
  const activeBorrows = book.transactions?.length || 0
  const hasReservations = book.reservations && book.reservations.length > 0
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/staff/books">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-muted-foreground">by {book.author}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Book Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISBN</p>
                  <p className="text-sm">{book.isbn || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                  <p className="text-sm font-mono">{book.barcode}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Publisher</p>
                  <p className="text-sm">{book.publisher || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Publication Year</p>
                  <p className="text-sm">{book.publicationYear || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Edition</p>
                  <p className="text-sm">{book.edition || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Language</p>
                  <p className="text-sm">{book.language}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{book.location || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Select value={book.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="BORROWED">Borrowed</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {book.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{book.description}</p>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((bc: any) => (
                    <Badge key={bc.categoryId} variant="secondary">
                      {bc.category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs - Active Borrows & Reservations */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="borrows">
                <TabsList className="w-full">
                  <TabsTrigger value="borrows" className="flex-1">
                    Active Borrows ({activeBorrows})
                  </TabsTrigger>
                  <TabsTrigger value="reservations" className="flex-1">
                    Reservations ({book.reservations?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="borrows" className="mt-4">
                  {activeBorrows > 0 ? (
                    <div className="space-y-4">
                      {book.transactions?.map((transaction: any) => (
                        <Card key={transaction.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {transaction.user.firstName} {transaction.user.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {transaction.user.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  Due: {format(new Date(transaction.dueDate), 'MMM dd, yyyy')}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Borrowed: {format(new Date(transaction.borrowedAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="mx-auto h-8 w-8 mb-2" />
                      <p>No active borrows</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reservations" className="mt-4">
                  {hasReservations ? (
                    <div className="space-y-4">
                      {book.reservations?.map((reservation: any) => (
                        <Card key={reservation.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {reservation.user.firstName} {reservation.user.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {reservation.user.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <Badge variant="outline">{reservation.status}</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reserved: {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="mx-auto h-8 w-8 mb-2" />
                      <p>No reservations</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2" />
                    <p>Transaction history coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Barcode Card */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode</CardTitle>
              <CardDescription>Scan or download barcode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {barcodeLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : barcodeData?.imageDataUrl ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <Image
                      src={barcodeData.imageDataUrl}
                      alt={`Barcode ${book.barcode}`}
                      width={200}
                      height={80}
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={downloadBarcode}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Barcode
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No barcode available
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Total Copies</span>
                  <span className="text-2xl font-bold">{book.quantity}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-2xl font-bold text-green-600">
                    {book.availableQuantity}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Borrowed</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {book.quantity - book.availableQuantity}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Stats</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Active Borrows:</span>
                    <span className="font-medium">{activeBorrows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reservations:</span>
                    <span className="font-medium">{book.reservations?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <BookFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        book={book}
        onSuccess={() => {
          setShowEditDialog(false)
          refetch()
        }}
      />
    </div>
  )
}
