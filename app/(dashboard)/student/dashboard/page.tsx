/**
 * Student Dashboard Page
 * Main dashboard for library students
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useStudentDashboard } from '@/hooks/useStudentDashboard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react'
import { 
  StudentStatsGrid, 
  CurrentBorrowsCard, 
  StudentQuickActionsCard 
} from '@/components/student-dashboard'

export default function StudentDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { 
    stats, 
    recentBorrows, 
    isLoading, 
    isError, 
    error, 
    refetchAll 
  } = useStudentDashboard()
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-muted-foreground mt-2">
                Explore our collection and manage your borrowed books.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Error Alert */}
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || 'Failed to load dashboard data. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Stats Grid */}
          <StudentStatsGrid stats={stats.data} isLoading={stats.isLoading} />
          
          {/* Quick Actions */}
          <StudentQuickActionsCard />
          
          {/* Currently Borrowed Books */}
          <CurrentBorrowsCard 
            borrows={recentBorrows.data?.transactions || []} 
            isLoading={recentBorrows.isLoading} 
          />
        </div>
      </main>
    </div>
  )
}
