/**
 * My Books Page - Student
 * View active loans and pending requests
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useMyActiveLoans, useMyPendingRequests, useRenewBook } from '@/hooks/useTransactions'
import { TransactionStatusBadge } from '@/components/transactions/TransactionStatusBadge'
import { useToast } from '@/hooks/use-toast'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow, differenceInDays } from 'date-fns'

export default function MyBooksPage() {
  const { data: activeData, isLoading: activeLoading } = useMyActiveLoans()
  const { data: pendingData, isLoading: pendingLoading } = useMyPendingRequests()
  const { toast } = useToast()

  const activeLoans = activeData?.transactions || []
  const pendingRequests = pendingData?.transactions || []

  const [renewingId, setRenewingId] = useState<string | null>(null)

  const handleRenew = async (transactionId: string) => {
    setRenewingId(transactionId)
    const renewBook = useRenewBook(transactionId)
    
    try {
      await renewBook.mutateAsync({})
      toast({
        title: 'Book Renewed',
        description: 'Your book has been renewed successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Renewal Failed',
        description: error.response?.data?.error?.message || 'Failed to renew book',
        variant: 'destructive'
      })
    } finally {
      setRenewingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
        <p className="text-muted-foreground">
          Manage your borrowed books and pending requests
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Loans
            {activeLoans.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeLoans.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Loans Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-28 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeLoans.length === 0 ? (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertTitle>No Active Loans</AlertTitle>
              <AlertDescription>
                You don't have any books currently borrowed.
                <br />
                Visit the Browse Books page to find books to borrow.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((transaction) => {
                const daysUntilDue = differenceInDays(new Date(transaction.dueDate), new Date())
                const isOverdue = daysUntilDue < 0
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Book Cover */}
                        <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md bg-muted">
                          {transaction.book.coverImage ? (
                            <Image
                              src={transaction.book.coverImage}
                              alt={transaction.book.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold line-clamp-2">{transaction.book.title}</h3>
                            <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Borrowed {formatDistanceToNow(new Date(transaction.borrowedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className={`text-sm font-medium ${
                              isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {isOverdue ? (
                                <>Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}</>
                              ) : (
                                <>Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}</>
                              )}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({new Date(transaction.dueDate).toLocaleDateString()})
                            </span>
                          </div>

                          {transaction.renewalCount > 0 && (
                            <Badge variant="outline">
                              Renewed {transaction.renewalCount} time{transaction.renewalCount !== 1 ? 's' : ''}
                            </Badge>
                          )}

                          {!isOverdue && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRenew(transaction.id)}
                              disabled={renewingId === transaction.id}
                            >
                              {renewingId === transaction.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Renewing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Renew Book
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-28 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>No Pending Requests</AlertTitle>
              <AlertDescription>
                You don't have any pending borrow requests.
                <br />
                Scan a book to create a new borrow request.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Book Cover */}
                      <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md bg-muted">
                        {transaction.book.coverImage ? (
                          <Image
                            src={transaction.book.coverImage}
                            alt={transaction.book.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{transaction.book.title}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
                        </div>

                        <TransactionStatusBadge status={transaction.status} />

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Requested {formatDistanceToNow(new Date(transaction.borrowedAt), { addSuffix: true })}</p>
                          {transaction.requestedDays && (
                            <p>Duration: {transaction.requestedDays} days</p>
                          )}
                          {transaction.notes && (
                            <p className="italic">Note: {transaction.notes}</p>
                          )}
                        </div>

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Your request is being reviewed by library staff. You'll be notified once it's processed.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

