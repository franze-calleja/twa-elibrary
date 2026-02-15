/*
 * Borrowing History Page - Student
 */

"use client"

import { useMemo } from 'react'
import { useMyActiveLoans, useTransactions } from '@/hooks/useTransactions'
import { useProfile } from '@/hooks/useAccount'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'

export default function HistoryPage() {
  const { data: profile } = useProfile()

  const { data: activeData, isLoading: loadingActive } = useMyActiveLoans()

  const { data: returnedData, isLoading: loadingReturned } = useTransactions({
    userId: profile?.id,
    status: 'RETURNED',
    limit: 100,
  })

  const active = activeData?.transactions || []
  const returned = returnedData?.transactions || []

  const hasActive = active.length > 0
  const hasHistory = returned.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Borrowing History</h1>
        <p className="text-muted-foreground">View your complete borrowing history</p>
      </div>

      {/* Currently Borrowed / Pending Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed</CardTitle>
          <CardDescription>Books you currently have checked out (pending return)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !hasActive ? (
            <p className="text-sm text-muted-foreground">You have no active borrows.</p>
          ) : (
            <div className="space-y-4">
              {active.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-semibold">{tx.book.title}</div>
                    <div className="text-sm text-muted-foreground">Due: {format(new Date(tx.dueDate), 'PPP')}</div>
                    <div className="text-sm text-muted-foreground">Borrowed: {format(new Date(tx.borrowedAt), 'PPP')}</div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="font-medium text-amber-600">Status: {tx.status}</div>
                    {tx.renewalCount > 0 && <div className="text-xs text-muted-foreground">Renewals: {tx.renewalCount}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Returned / Past History */}
      <Card>
        <CardHeader>
          <CardTitle>Past Borrowing History</CardTitle>
          <CardDescription>Completed transactions (returned / archived)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReturned ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !hasHistory ? (
            <p className="text-sm text-muted-foreground">No past transactions found.</p>
          ) : (
            <div className="divide-y">
              {returned.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold">{tx.book.title}</div>
                    <div className="text-sm text-muted-foreground">Borrowed: {format(new Date(tx.borrowedAt), 'PPP')} • Returned: {tx.returnedAt ? format(new Date(tx.returnedAt), 'PPP') : '—'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">Status: {tx.status}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
