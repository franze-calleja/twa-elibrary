/**
 * PendingRequestsCard Component
 * Displays pending borrow requests
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { TransactionWithDetails } from '@/types'

interface PendingRequestsCardProps {
  requests: TransactionWithDetails[]
  isLoading?: boolean
  total?: number
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function PendingRequestsCard({ 
  requests, 
  isLoading, 
  total = 0,
  onApprove,
  onReject 
}: PendingRequestsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Borrow requests waiting for approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Borrow requests waiting for approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No pending requests at the moment
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
              Pending Requests
              {total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {total}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Borrow requests waiting for approval</CardDescription>
          </div>
          {total > requests.length && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff/transactions?filter=pending">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0"
            >
              <Avatar>
                <AvatarImage src={request.user.avatar || undefined} />
                <AvatarFallback>
                  {request.user.firstName[0]}{request.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {request.user.firstName} {request.user.lastName}
                  </p>
                  <Badge variant="outline" className="ml-2">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(new Date(request.borrowedAt), { addSuffix: true })}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  wants to borrow <span className="font-medium">{request.book.title}</span>
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{request.user.email}</span>
                  {request.user.studentId && (
                    <>
                      <span>•</span>
                      <span>ID: {request.user.studentId}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onApprove && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                )}
                {onReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(request.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
