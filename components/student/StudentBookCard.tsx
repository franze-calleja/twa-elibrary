/**
 * Student Book Card Component
 * Displays book information in a card format (no barcode/staff info)
 */

'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Book } from '@/hooks/useBooks'
import { BookOpen, CalendarDays, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface StudentBookCardProps {
  book: Book
  onViewDetails?: (book: Book) => void
}

export function StudentBookCard({ book, onViewDetails }: StudentBookCardProps) {
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

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(book)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="flex gap-3 p-3">
        {/* Book Cover - Compact */}
        <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md bg-muted">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Title & Author */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {book.author}
            </p>
          </div>

          {/* Status & Availability */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusVariant(book.status)} className="text-xs h-5 px-2">
              {book.status}
            </Badge>
            <span className={`text-xs flex items-center gap-1 ${isAvailable ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
              {isAvailable ? `${book.availableQuantity}/${book.quantity}` : 'Unavailable'}
            </span>
          </div>

          {/* Categories */}
          {book.categories && book.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.categories.slice(0, 2).map((cat, index) => (
                <Badge key={`${book.id}-cat-${index}`} variant="outline" className="text-xs h-5 px-2">
                  {cat.category.name}
                </Badge>
              ))}
              {book.categories.length > 2 && (
                <Badge variant="outline" className="text-xs h-5 px-2">
                  +{book.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Additional Info - Compact */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {book.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {book.location}
              </span>
            )}
            {book.publicationYear && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {book.publicationYear}
              </span>
            )}
          </div>

          {/* Action Button - Compact */}
          <Link href={`/student/books/${book.id}`} className="mt-auto">
            <Button 
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={(e) => {
                if (onViewDetails) {
                  e.preventDefault()
                  handleClick()
                }
              }}
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
