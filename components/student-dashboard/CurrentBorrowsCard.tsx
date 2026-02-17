/**
 * Current Borrows Card Component
 * Displays currently borrowed books with due dates
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'
import type { TransactionWithDetails } from '@/types'
import Link from 'next/link'

interface CurrentBorrowsCardProps {
  borrows: TransactionWithDetails[]
  isLoading: boolean
}

interface BorrowItemProps {
  transaction: TransactionWithDetails
}

const BorrowItem = ({ transaction }: BorrowItemProps) => {
  const dueDate = new Date(transaction.dueDate)
  const daysUntilDue = differenceInDays(dueDate, new Date())
  const isOverdue = isPast(dueDate) && transaction.status === 'ACTIVE'
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && transaction.status === 'ACTIVE'

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-sm line-clamp-1">
          {transaction.book.title}
        </h4>
        <p className="text-xs text-muted-foreground">
          by {transaction.book.author}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Due: {format(dueDate, 'MMM dd, yyyy')}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue ({Math.abs(daysUntilDue)} days)
            </Badge>
          )}
          {isDueSoon && !isOverdue && (
            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
              Due soon
            </Badge>
          )}
          {!isOverdue && !isDueSoon && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {daysUntilDue} days left
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {transaction.renewalCount < 2 && transaction.status === 'ACTIVE' && !isOverdue && (
          <Button size="sm" variant="outline" className="text-xs">
            Renew
          </Button>
        )}
        {transaction.renewalCount >= 2 && (
          <Badge variant="secondary" className="text-xs">
            Max renewals
          </Badge>
        )}
      </div>
    </div>
  )
}

const BorrowItemSkeleton = () => (
  <div className="flex items-start gap-4 p-4 border rounded-lg">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
    <Skeleton className="h-8 w-16" />
  </div>
)

export function CurrentBorrowsCard({ borrows, isLoading }: CurrentBorrowsCardProps) {
  const activeBorrows = borrows.filter(b => b.status === 'ACTIVE')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed</CardTitle>
          <CardDescription>
            Books you currently have checked out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <BorrowItemSkeleton />
          <BorrowItemSkeleton />
          <BorrowItemSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (activeBorrows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed</CardTitle>
          <CardDescription>
            Books you currently have checked out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No borrowed books</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't borrowed any books yet. Browse our collection to get started!
            </p>
            <Button asChild>
              <Link href="/student/books">Browse Books</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Currently Borrowed</CardTitle>
            <CardDescription>
              You have {activeBorrows.length} book{activeBorrows.length !== 1 ? 's' : ''} checked out
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/my-books">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeBorrows.slice(0, 5).map((transaction) => (
          <BorrowItem key={transaction.id} transaction={transaction} />
        ))}
        {activeBorrows.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="link" size="sm" asChild>
              <Link href="/student/my-books">
                View all {activeBorrows.length} borrowed books →
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
