/**
 * Staff Dashboard Page
 * Main dashboard for library staff members
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { useDashboardStore } from '@/store/dashboardStore'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  StatsGrid, 
  RecentActivitiesCard, 
  OverdueTableCard, 
  PendingRequestsCard,
  QuickActionsCard 
} from '@/components/dashboard'
import type { QuickStat, DashboardActivity } from '@/types'

export default function StaffDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { 
    stats, 
    recentActivities, 
    overdueBooks, 
    pendingRequests,
    isLoading,
    isError,
    error,
    refetchAll 
  } = useDashboard()
  
  const { preferences } = useDashboardStore()
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  // Transform stats data to QuickStat format
  const quickStats: QuickStat[] = stats.data ? [
    {
      label: 'Total Books',
      value: stats.data.totalBooks,
      subtitle: `${stats.data.availableBooks} available`,
      icon: 'BookOpen'
    },
    {
      label: 'Available Books',
      value: stats.data.availableBooks,
      subtitle: `${stats.data.borrowedBooks} borrowed`,
      icon: 'BookCheck'
    },
    {
      label: 'Borrowed Books',
      value: stats.data.borrowedBooks,
      subtitle: `${stats.data.activeTransactions} active loans`,
      icon: 'BookX'
    },
    {
      label: 'Total Users',
      value: stats.data.totalUsers,
      subtitle: `${stats.data.activeStudents} active students`,
      icon: 'Users'
    },
    {
      label: 'Active Students',
      value: stats.data.activeStudents,
      subtitle: 'Currently enrolled',
      icon: 'UserCheck'
    },
    {
      label: 'Active Transactions',
      value: stats.data.activeTransactions,
      subtitle: 'Currently borrowed',
      icon: 'FileText'
    },
    {
      label: 'Overdue Books',
      value: stats.data.overdueTransactions,
      subtitle: 'Need attention',
      icon: 'AlarmClock'
    },
    {
      label: 'Total Fines',
      value: Number(stats.data.totalFines || 0),
      subtitle: `₱${Number(stats.data.unpaidFines || 0).toFixed(2)} unpaid`,
      icon: 'DollarSign'
    }
  ] : []
  
  // Transform activities data
  const dashboardActivities: DashboardActivity[] = recentActivities.data?.activities?.map(activity => ({
    id: activity.id,
    type: activity.type as 'BORROW' | 'RETURN' | 'RENEW' | 'OVERDUE',
    title: `${activity.user.firstName} ${activity.user.lastName}`,
    description: `${activity.type === 'BORROW' ? 'Borrowed' : activity.type === 'RETURN' ? 'Returned' : 'Renewed'} "${activity.book.title}"`,
    timestamp: activity.borrowedAt,
    userId: activity.userId,
    userName: `${activity.user.firstName} ${activity.user.lastName}`
  })) || []
  
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Section with Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-muted-foreground mt-2">
                Here's what's happening in your library today.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAll()}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Error Alert */}
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {error?.message || 'Failed to load dashboard data. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Quick Stats */}
          <StatsGrid stats={quickStats} isLoading={stats.isLoading} />
          
          {/* Quick Actions */}
          <QuickActionsCard />
          
          {/* Two Column Layout for Activities and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <RecentActivitiesCard 
              activities={dashboardActivities}
              isLoading={recentActivities.isLoading}
            />
            
            {/* Pending Requests */}
            <PendingRequestsCard 
              requests={pendingRequests.data?.pendingRequests || []}
              total={pendingRequests.data?.pagination?.total || 0}
              isLoading={pendingRequests.isLoading}
            />
          </div>
          
          {/* Overdue Books Table */}
          <OverdueTableCard 
            overdueBooks={overdueBooks.data?.overdueBooks || []}
            total={overdueBooks.data?.pagination?.total || 0}
            isLoading={overdueBooks.isLoading}
          />
        </div>
      </main>
    </div>
  )
}
