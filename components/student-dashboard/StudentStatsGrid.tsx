/**
 * Student Stats Grid Component
 * Displays key statistics for student dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import type { StudentDashboardStats } from '@/types'

interface StudentStatsGridProps {
  stats: StudentDashboardStats | undefined
  isLoading: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: 'default' | 'warning' | 'danger' | 'success'
  badge?: string
}

const StatCard = ({ title, value, subtitle, icon: Icon, variant = 'default', badge }: StatCardProps) => {
  const variantStyles = {
    default: 'text-primary',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    success: 'text-green-500'
  }

  const bgStyles = {
    default: 'bg-primary/10',
    warning: 'bg-yellow-500/10',
    danger: 'bg-red-500/10',
    success: 'bg-green-500/10'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgStyles[variant]}`}>
          <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {badge && (
            <Badge variant={variant === 'danger' ? 'destructive' : variant === 'warning' ? 'outline' : 'default'}>
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
)

export function StudentStatsGrid({ stats, isLoading }: StudentStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const hasOverdue = stats.overdueBooks > 0
  const isLimitReached = stats.borrowedBooks >= stats.borrowingLimit

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Borrowed Books"
        value={stats.borrowedBooks}
        subtitle={`${stats.availableBorrowings} of ${stats.borrowingLimit} slots available`}
        icon={BookOpen}
        variant={isLimitReached ? 'warning' : 'default'}
        badge={isLimitReached ? 'Limit reached' : undefined}
      />
      
      <StatCard
        title="Overdue Books"
        value={stats.overdueBooks}
        subtitle={hasOverdue ? 'Return as soon as possible' : 'All books on time'}
        icon={AlertCircle}
        variant={hasOverdue ? 'danger' : 'success'}
        badge={hasOverdue ? 'Action needed' : undefined}
      />
      
      <StatCard
        title="Account Status"
        value={stats.accountStatus || 'ACTIVE'}
        subtitle={stats.accountStatus === 'ACTIVE' ? 'Account in good standing' : 'Please contact library'}
        icon={CheckCircle}
        variant={stats.accountStatus === 'ACTIVE' ? 'success' : 'danger'}
      />
    </div>
  )
}
