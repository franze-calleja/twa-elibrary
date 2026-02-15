/**
 * Active Books Card Component
 * Displays currently borrowed books with due dates
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import type { Transaction, Book, Fine } from '@prisma/client'

interface ActiveBook extends Transaction {
  book: Pick<Book, 'id' | 'title' | 'author' | 'barcode' | 'coverImage'>
  fine?: Pick<Fine, 'amount' | 'status'> | null
}

interface ActiveBooksCardProps {
  activeBooks: ActiveBook[]
}

export function ActiveBooksCard({ activeBooks }: ActiveBooksCardProps) {
  const getDaysRemaining = (dueDate: Date | string) => {
    return differenceInDays(new Date(dueDate), new Date())
  }

  const getDueDateColor = (dueDate: Date | string) => {
    const days = getDaysRemaining(dueDate)
    if (days < 0) return 'text-destructive'
    if (days <= 3) return 'text-yellow-600'
    return 'text-muted-foreground'
  }

  const getDueDateBadge = (dueDate: Date | string, status: string) => {
    const days = getDaysRemaining(dueDate)
    
    if (status === 'OVERDUE' || days < 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} overdue
        </Badge>
      )
    }
    
    if (days <= 3) {
      return (
        <Badge variant="outline" className="ml-2 border-yellow-600 text-yellow-600">
          Due in {days} day{days !== 1 ? 's' : ''}
        </Badge>
      )
    }
    
    return null
  }

  if (activeBooks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed Books</CardTitle>
          <CardDescription>No books currently borrowed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>This student has no active loans</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currently Borrowed Books</CardTitle>
        <CardDescription>{activeBooks.length} book{activeBooks.length !== 1 ? 's' : ''} currently borrowed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeBooks.map((transaction) => {
            const daysRemaining = getDaysRemaining(transaction.dueDate)
            const isOverdue = daysRemaining < 0

            return (
              <div
                key={transaction.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  isOverdue ? 'border-destructive bg-destructive/5' : 'border-border'
                }`}
              >
                {/* Book Cover */}
                {transaction.book.coverImage ? (
                  <Image
                    src={transaction.book.coverImage}
                    alt={transaction.book.title}
                    width={60}
                    height={90}
                    className="rounded object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-15 h-22 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No img</span>
                  </div>
                )}

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/staff/books/${transaction.book.id}`}
                    className="font-semibold hover:underline line-clamp-2"
                  >
                    {transaction.book.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{transaction.book.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Barcode: {transaction.book.barcode}
                  </p>

                  <div className="mt-3 space-y-2">
                    {/* Borrowed Date */}
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Borrowed:</span>
                      <span className="ml-2">{format(new Date(transaction.borrowedAt), 'MMM dd, yyyy')}</span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className={`ml-2 font-medium ${getDueDateColor(transaction.dueDate)}`}>
                        {format(new Date(transaction.dueDate), 'MMM dd, yyyy')}
                      </span>
                      {getDueDateBadge(transaction.dueDate, transaction.status)}
                    </div>

                    {/* Duration */}
                    {transaction.requestedDays && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2">{transaction.requestedDays} days</span>
                      </div>
                    )}

                    {/* Renewals */}
                    {transaction.renewalCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Renewed {transaction.renewalCount} time{transaction.renewalCount !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Fine Info */}
                    {transaction.fine && (
                      <div className="flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                        <span className="text-sm text-destructive font-medium">
                          Fine: ₱{Number(transaction.fine.amount).toFixed(2)}
                        </span>
                        <Badge variant="destructive" className="ml-2">
                          {transaction.fine.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={isOverdue ? 'destructive' : 'default'}>
                    {transaction.status}
                  </Badge>
                  <Link href={`/staff/transactions/${transaction.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
