/**
 * Transaction Detail Page - Staff
 * View and manage individual transaction
 */

'use client'

import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useTransaction, useProcessBorrowRequest, useReturnBook } from '@/hooks/useTransactions'
import { TransactionStatusBadge } from '@/components/transactions/TransactionStatusBadge'
import { ProcessRequestDialog } from '@/components/transactions/ProcessRequestDialog'
import { ReturnBookDialog } from '@/components/transactions/ReturnBookDialog'
import { useToast } from '@/hooks/use-toast'
import { 
  BookOpen,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RotateCcw
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const { data, isLoading, error } = useTransaction(resolvedParams.id)
  const { toast } = useToast()
  const router = useRouter()

  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  const transaction = data?.transaction

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load transaction details. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  const daysUntilDue = differenceInDays(new Date(transaction.dueDate), new Date())
  const isOverdue = daysUntilDue < 0
  const isPending = transaction.status === 'PENDING'
  const isActive = transaction.status === 'ACTIVE'
  const isReturned = transaction.status === 'RETURNED'
  const isRejected = transaction.status === 'REJECTED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/staff/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <p className="text-muted-foreground">
            Transaction ID: {transaction.id.slice(0, 8)}...
          </p>
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Book Information */}
        <Card>
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-36 shrink-0 overflow-hidden rounded-md bg-muted">
                {transaction.book.coverImage ? (
                  <Image
                    src={transaction.book.coverImage}
                    alt={transaction.book.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{transaction.book.title}</h3>
                <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
                
                {transaction.book.isbn && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">ISBN:</span>
                    <span>{transaction.book.isbn}</span>
                  </div>
                )}

                {transaction.book.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{transaction.book.location}</span>
                  </div>
                )}

                <Badge variant="outline">{transaction.book.barcode}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {transaction.user.firstName} {transaction.user.lastName}
              </span>
            </div>

            {transaction.user.studentId && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student ID:</span>
                <span className="text-sm font-medium">{transaction.user.studentId}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{transaction.user.email}</span>
            </div>

            {transaction.user.program && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Program:</span>
                <span className="text-sm">{transaction.user.program}</span>
              </div>
            )}

            {transaction.user.yearLevel && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Year Level:</span>
                <span className="text-sm">Year {transaction.user.yearLevel}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Account Status:</span>
              <Badge variant={transaction.user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {transaction.user.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Request Date:</span>
              <span className="text-sm font-medium">
                {format(new Date(transaction.borrowedAt), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>

            {isPending && transaction.requestedDays && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Requested Duration:</span>
                <Badge variant="outline">{transaction.requestedDays} days</Badge>
              </div>
            )}

            {(isActive || isReturned) && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className={`text-sm font-medium ${
                    isOverdue ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {format(new Date(transaction.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                {isActive && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Remaining:</span>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isOverdue ? (
                        <>Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}</>
                      ) : (
                        <>{daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} left</>
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            {transaction.renewalCount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renewals:</span>
                <Badge variant="outline">{transaction.renewalCount}</Badge>
              </div>
            )}

            {transaction.approvedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Approved:</span>
                <span className="text-sm">
                  {format(new Date(transaction.approvedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            )}

            {transaction.returnedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Returned:</span>
                <span className="text-sm">
                  {format(new Date(transaction.returnedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            )}

            {transaction.rejectedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rejected:</span>
                <span className="text-sm">
                  {format(new Date(transaction.rejectedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            )}

            {transaction.notes && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Student Notes:</span>
                  </div>
                  <p className="text-sm italic pl-6">{transaction.notes}</p>
                </div>
              </>
            )}

            {transaction.rejectionReason && (
              <>
                <Separator />
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Rejection Reason</AlertTitle>
                  <AlertDescription>{transaction.rejectionReason}</AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fine Information (if exists) */}
        {transaction.fine && (
          <Card>
            <CardHeader>
              <CardTitle>Fine Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-lg font-semibold text-red-600">
                  ₱{Number(transaction.fine.amount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <span className="text-sm">{transaction.fine.reason}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={transaction.fine.status === 'PAID' ? 'default' : 'destructive'}>
                  {transaction.fine.status}
                </Badge>
              </div>

              {transaction.fine.paidAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Paid On:</span>
                  <span className="text-sm">
                    {format(new Date(transaction.fine.paidAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {isPending && (
              <>
                <Button onClick={() => setProcessDialogOpen(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process Request
                </Button>
                <ProcessRequestDialog
                  transaction={transaction}
                  open={processDialogOpen}
                  onOpenChange={setProcessDialogOpen}
                />
              </>
            )}

            {isActive && (
              <>
                <Button onClick={() => setReturnDialogOpen(true)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Process Return
                </Button>
                <ReturnBookDialog
                  transaction={transaction}
                  open={returnDialogOpen}
                  onOpenChange={setReturnDialogOpen}
                />
              </>
            )}

            {isReturned && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This book has been returned and the transaction is complete.
                </AlertDescription>
              </Alert>
            )}

            {isRejected && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  This borrow request was rejected.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
