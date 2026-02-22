/**
 * Student Details Page - Staff
 * View comprehensive student information and borrowing history
 */

'use client'

import { use, useState } from 'react'
import { useUser } from '@/hooks/useUsers'
import { useTransactions } from '@/hooks/useTransactions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  StudentInfoCard, 
  StudentStatsCards, 
  ActiveBooksCard, 
  BorrowingHistoryTable 
} from '@/components/student'
import { EditStudentDialog, ResetPasswordDialog } from '@/components/student-management'
import { ArrowLeft, AlertCircle, Loader2, Edit, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  
  // Fetch student data
  const { data: userData, isLoading: userLoading, error: userError, refetch } = useUser(id)
  
  // Fetch all transactions for this student
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    userId: id,
    limit: 1000 // Get all transactions
  })
  
  const handleEditSuccess = () => {
    refetch()
  }

  const isLoading = userLoading || transactionsLoading
  const user = userData?.user
  const stats = userData?.stats
  const allTransactions = transactionsData?.transactions || []
  
  // Filter active books (ACTIVE or OVERDUE status)
  const activeBooks = allTransactions.filter(
    (t) => t.status === 'ACTIVE' || t.status === 'OVERDUE'
  )

  if (userError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
            <p className="text-muted-foreground">Error loading student information</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load student details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
            <p className="text-muted-foreground">Loading student information...</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
            <p className="text-muted-foreground">Student not found</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The requested student could not be found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
          <p className="text-muted-foreground">
            Complete profile and borrowing history for {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => setShowResetPassword(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Password
          </Button>
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StudentStatsCards stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Student Info */}
        <div className="lg:col-span-1">
          <StudentInfoCard user={user} />
        </div>

        {/* Right Column - Active Books */}
        <div className="lg:col-span-2">
          <ActiveBooksCard activeBooks={activeBooks} />
        </div>
      </div>

      {/* Borrowing History - Full Width */}
      <BorrowingHistoryTable 
        transactions={allTransactions} 
        isLoading={transactionsLoading}
      />
      
      {/* Edit Student Dialog */}
      <EditStudentDialog
        studentId={id}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />

      {user && (
        <ResetPasswordDialog
          userId={id}
          userName={`${user.firstName} ${user.lastName}`}
          open={showResetPassword}
          onOpenChange={setShowResetPassword}
        />
      )}
    </div>
  )
}

