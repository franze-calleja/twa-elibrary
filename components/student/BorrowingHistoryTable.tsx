/**
 * Borrowing History Table Component
 * Displays complete borrowing history of a student
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { TransactionWithDetails } from '@/types'

interface BorrowingHistoryTableProps {
  transactions: TransactionWithDetails[]
  isLoading?: boolean
}

export function BorrowingHistoryTable({ transactions, isLoading }: BorrowingHistoryTableProps) {
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'RETURNED':
        return 'secondary'
      case 'OVERDUE':
        return 'destructive'
      case 'PENDING':
        return 'outline'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BORROW':
        return 'default'
      case 'RETURN':
        return 'secondary'
      case 'RENEW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
          <CardDescription>Loading transaction history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
          <CardDescription>Complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No borrowing history found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrowing History</CardTitle>
        <CardDescription>
          Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Borrowed</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Returned</TableHead>
                <TableHead>Renewals</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {transaction.book.coverImage ? (
                        <Image
                          src={transaction.book.coverImage}
                          alt={transaction.book.title}
                          width={40}
                          height={60}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                      )}
                      <div>
                        <Link 
                          href={`/staff/books/${transaction.book.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {transaction.book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
                        <p className="text-xs text-muted-foreground">{transaction.book.barcode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(transaction.borrowedAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.borrowedAt), 'HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(transaction.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.returnedAt ? (
                      <div>
                        <div className="text-sm">
                          {format(new Date(transaction.returnedAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.returnedAt), 'HH:mm')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{transaction.renewalCount}</span>
                  </TableCell>
                  <TableCell>
                    {transaction.fine ? (
                      <div>
                        <div className="text-sm font-medium">₱{Number(transaction.fine.amount).toFixed(2)}</div>
                        <Badge 
                          variant={transaction.fine.status === 'PAID' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {transaction.fine.status}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/staff/transactions/${transaction.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
