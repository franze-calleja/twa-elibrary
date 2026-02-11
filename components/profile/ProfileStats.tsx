/**
 * Profile Statistics Component
 * Displays borrowing statistics and account status
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProfileStats } from '@/hooks/useAccount'
import { getBorrowingCapacity, getBorrowingCapacityColor } from '@/lib/account'
import { Book, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileStats() {
  const stats = useProfileStats()

  const capacityPercentage = getBorrowingCapacity(stats.activeLoans, stats.borrowingLimit)
  const capacityColor = getBorrowingCapacityColor(capacityPercentage)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Active Loans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeLoans} / {stats.borrowingLimit}
          </div>
          <Progress value={capacityPercentage} className="mt-3" />
          <p className={`text-xs mt-2 ${capacityColor}`}>
            {stats.availableSlots} {stats.availableSlots === 1 ? 'slot' : 'slots'} available
          </p>
        </CardContent>
      </Card>

      {/* Unpaid Fines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unpaid Fines</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unpaidFines}</div>
          <p className="text-xs text-muted-foreground mt-3">
            {stats.unpaidFines > 0 ? (
              <span className="text-destructive font-medium">Action required</span>
            ) : (
              <span className="text-green-600 font-medium">All clear!</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Borrowing Limit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Borrowing Limit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.borrowingLimit}</div>
          <p className="text-xs text-muted-foreground mt-3">Maximum books at once</p>
        </CardContent>
      </Card>

      {/* Can Borrow */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eligibility</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.canBorrow ? (
              <span className="text-green-600">Eligible</span>
            ) : (
              <span className="text-destructive">Restricted</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {stats.canBorrow ? 'Ready to borrow books' : 'Check requirements'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
