/**
 * Student Dashboard Page
 * Main dashboard for library students
 */

'use client'

import { useAuth, useLogout } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Search, History, LogOut, Loader2, User } from 'lucide-react'

export default function StudentDashboardPage() {
  const { user, isLoading } = useAuth()
  const logout = useLogout()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">TWA E-Library</h1>
              <p className="text-sm text-muted-foreground">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.studentId}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              {logout.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-muted-foreground mt-2">
              Explore our collection and manage your borrowed books.
            </p>
          </div>
          
          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Borrowed Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  {user?.borrowingLimit} books available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  All books returned on time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱0.00</div>
                <p className="text-xs text-muted-foreground">
                  No pending fines
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Browse and manage your library account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto flex-col py-6" variant="outline">
                <Search className="h-8 w-8 mb-2" />
                <span>Browse Books</span>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline">
                <BookOpen className="h-8 w-8 mb-2" />
                <span>My Books</span>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline">
                <History className="h-8 w-8 mb-2" />
                <span>Borrowing History</span>
              </Button>
            </CardContent>
          </Card>
          
          {/* Currently Borrowed Books */}
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed</CardTitle>
              <CardDescription>
                Books you currently have checked out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No borrowed books</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't borrowed any books yet. Browse our collection to get started!
                </p>
                <Button>Browse Books</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
