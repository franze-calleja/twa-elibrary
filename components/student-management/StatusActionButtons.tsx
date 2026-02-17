/**
 * Student Status Action Buttons Component
 * Quick actions for changing student status with validation
 */

'use client'

import { useState } from 'react'
import { useUpdateStudentStatus } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Ban, CheckCircle, Loader2 } from 'lucide-react'

interface StatusActionButtonsProps {
  studentId: string
  currentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  studentName: string
  onSuccess?: () => void
  variant?: 'default' | 'compact'
}

export function StatusActionButtons({ 
  studentId, 
  currentStatus, 
  studentName,
  onSuccess,
  variant = 'default' 
}: StatusActionButtonsProps) {
  const { toast } = useToast()
  const updateStatus = useUpdateStudentStatus(studentId)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  
  const handleSuspend = () => {
    updateStatus.mutate('SUSPENDED', {
      onSuccess: () => {
        toast({
          title: 'Student Suspended',
          description: `${studentName} has been suspended and cannot borrow books.`
        })
        setShowSuspendDialog(false)
        onSuccess?.()
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to suspend student',
          variant: 'destructive'
        })
      }
    })
  }
  
  const handleActivate = () => {
    updateStatus.mutate('ACTIVE', {
      onSuccess: () => {
        toast({
          title: 'Student Reactivated',
          description: `${studentName} has been reactivated and can now borrow books.`
        })
        setShowActivateDialog(false)
        onSuccess?.()
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to reactivate student',
          variant: 'destructive'
        })
      }
    })
  }
  
  const isInactive = currentStatus === 'INACTIVE'
  const isActive = currentStatus === 'ACTIVE'
  const isSuspended = currentStatus === 'SUSPENDED'
  
  const buttonSize = variant === 'compact' ? 'sm' : 'default'
  
  // INACTIVE students cannot have status changed (only through registration)
  if (isInactive) {
    return (
      <div className="text-xs text-muted-foreground">
        {variant === 'default' && 'Awaiting registration'}
      </div>
    )
  }
  
  // ACTIVE students can be suspended
  if (isActive) {
    return (
      <>
        <Button
          size={buttonSize}
          variant="destructive"
          onClick={() => setShowSuspendDialog(true)}
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Ban className="h-4 w-4 mr-2" />
              {variant === 'default' && 'Suspend'}
            </>
          )}
        </Button>
        
        <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend Student Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to suspend <strong>{studentName}</strong>?
                <br /><br />
                Suspended students will not be able to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Borrow new books</li>
                  <li>Access their account features</li>
                </ul>
                <br />
                They can be reactivated at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSuspend}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Suspend Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  // SUSPENDED students can be reactivated
  if (isSuspended) {
    return (
      <>
        <Button
          size={buttonSize}
          variant="default"
          onClick={() => setShowActivateDialog(true)}
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {variant === 'default' && 'Reactivate'}
            </>
          )}
        </Button>
        
        <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reactivate Student Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reactivate <strong>{studentName}</strong>?
                <br /><br />
                The student will regain full access to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Borrow books</li>
                  <li>Access all account features</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivate}>
                Reactivate Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  return null
}
