/**
 * Book Details Page - Student
 * View complete book information (excluding staff-only data)
 */

'use client'

import { use } from 'react'
import { useBook } from '@/hooks/useBooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertCircle, 
  BookOpen, 
  Users, 
  Building, 
  Calendar, 
  Hash, 
  FileText, 
  Globe, 
  MapPin,
  ArrowLeft,
  Library
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading, error } = useBook(id)
  const book = data?.book

  if (isLoading) {
    return <BookDetailsSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/student/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Book</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load book details. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/student/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Book Not Found</h3>
          <p className="text-muted-foreground">The requested book could not be found.</p>
        </div>
      </div>
    )
  }

  const isAvailable = book.status === 'AVAILABLE' && book.availableQuantity > 0

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default'
      case 'BORROWED':
        return 'secondary'
      case 'RESERVED':
        return 'outline'
      default:
        return 'destructive'
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/student/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </Button>

      {/* Book Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Cover Image */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="relative w-full aspect-2/3 overflow-hidden rounded-md bg-muted">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                  <BookOpen className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Availability Status */}
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Badge variant={getStatusVariant(book.status)} className="w-full justify-center py-2">
                  {book.status}
                </Badge>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {isAvailable ? (
                      <>Available: {book.availableQuantity} of {book.quantity}</>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  disabled={!isAvailable}
                  asChild
                >
                  <Link href="/student/scan">
                    <Library className="mr-2 h-4 w-4" />
                    Borrow This Book
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-3xl">{book.title}</CardTitle>
            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
              <Users className="h-5 w-5" />
              {book.author}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((cat) => (
                  <Badge key={`${book.id}-cat-${cat.category.id}`} variant="outline">
                    {cat.category.name}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {book.publisher && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Publisher</p>
                    <p className="font-semibold">{book.publisher}</p>
                  </div>
                </div>
              )}

              {book.publicationYear && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Publication Year</p>
                    <p className="font-semibold">{book.publicationYear}</p>
                  </div>
                </div>
              )}

              {book.isbn && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ISBN</p>
                    <p className="font-semibold font-mono text-sm">{book.isbn}</p>
                  </div>
                </div>
              )}

              {book.edition && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Edition</p>
                    <p className="font-semibold">{book.edition}</p>
                  </div>
                </div>
              )}

              {book.language && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p className="font-semibold">{book.language}</p>
                  </div>
                </div>
              )}

              {book.pages && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pages</p>
                    <p className="font-semibold">{book.pages}</p>
                  </div>
                </div>
              )}

              {book.location && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-semibold">{book.location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BookDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <Skeleton className="aspect-2/3 w-full" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
