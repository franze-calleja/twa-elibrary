/**
 * OverdueTableCard Component
 * Displays overdue books in a table format
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow, differenceInDays, format } from 'date-fns'
import { ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { TransactionWithDetails } from '@/types'

interface OverdueTableCardProps {
  overdueBooks: TransactionWithDetails[]
  isLoading?: boolean
  total?: number
}

export function OverdueTableCard({ overdueBooks, isLoading, total = 0 }: OverdueTableCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overdue Books</CardTitle>
          <CardDescription>Books that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!overdueBooks || overdueBooks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overdue Books</CardTitle>
          <CardDescription>Books that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No overdue books! Everything is on track.
            </p>
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
            <CardTitle className="flex items-center gap-2">
              Overdue Books
              {total > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {total}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Books that need immediate attention</CardDescription>
          </div>
          {total > overdueBooks.length && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff/transactions?filter=overdue">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Overdue By</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueBooks.map((transaction) => {
                const daysOverdue = differenceInDays(new Date(), new Date(transaction.dueDate))
                const fineAmount = transaction.fine?.amount ? Number(transaction.fine.amount) : 0
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.book.title}</div>
                      <div className="text-sm text-muted-foreground">{transaction.book.author}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {transaction.user.firstName} {transaction.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(transaction.dueDate), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.dueDate), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {fineAmount > 0 ? (
                        <div className="font-medium text-red-600 dark:text-red-400">
                          ₱{fineAmount.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/transactions?id=${transaction.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
