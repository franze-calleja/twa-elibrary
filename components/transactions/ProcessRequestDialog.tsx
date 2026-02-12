/**
 * Process Request Dialog - Staff
 * Approve or reject pending borrow requests
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useProcessBorrowRequest } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react'
import { Alert as AlertComponent } from '@/components/ui/alert'
import { addDays, format } from 'date-fns'
import type { TransactionWithDetails, ProcessBorrowAction } from '@/types'

interface ProcessRequestDialogProps {
  transaction: TransactionWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProcessRequestDialog({
  transaction,
  open,
  onOpenChange
}: ProcessRequestDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { toast } = useToast()

  const processRequest = useProcessBorrowRequest(transaction.id)

  const handleProcess = async () => {
    if (!action) return

    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this request',
        variant: 'destructive'
      })
      return
    }

    try {
      const requestData: ProcessBorrowAction = {
        action,
        ...(action === 'reject' && { rejectionReason })
      }
      
      await processRequest.mutateAsync(requestData)

      toast({
        title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
        description: action === 'approve' 
          ? 'The borrow request has been approved successfully'
          : 'The borrow request has been rejected',
        variant: action === 'approve' ? 'default' : 'destructive'
      })

      onOpenChange(false)
      setAction(null)
      setRejectionReason('')
    } catch (error: any) {
      toast({
        title: 'Processing Failed',
        description: error.response?.data?.error?.message || 'Failed to process request',
        variant: 'destructive'
      })
    }
  }

  const calculatedDueDate = transaction.requestedDays 
    ? addDays(new Date(), transaction.requestedDays)
    : addDays(new Date(), 14)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Borrow Request</DialogTitle>
          <DialogDescription>
            Review and approve or reject this borrow request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Summary */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-semibold">{transaction.book.title}</h4>
              <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Student:</span>
                <p className="font-medium">
                  {transaction.user.firstName} {transaction.user.lastName}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{transaction.requestedDays || 14} days</p>
              </div>
            </div>

            {transaction.notes && (
              <div className="pt-2 border-t">
                <span className="text-sm text-muted-foreground">Note:</span>
                <p className="text-sm italic mt-1">{transaction.notes}</p>
              </div>
            )}
          </div>

          {/* Due Date Calculation */}
          {action === 'approve' && (
            <AlertComponent>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Due Date:</span>{' '}
                {format(calculatedDueDate, 'MMMM dd, yyyy')}
                <br />
                <span className="text-xs text-muted-foreground">
                  Book will be due in {transaction.requestedDays || 14} days
                </span>
              </AlertDescription>
            </AlertComponent>
          )}

          {/* Action Selection */}
          {!action ? (
            <div className="space-y-3">
              <Label>Choose Action</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => setAction('approve')}
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Approve</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => setAction('reject')}
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span>Reject</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Action: {action === 'approve' ? 'Approve' : 'Reject'}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAction(null)
                    setRejectionReason('')
                  }}
                >
                  Change
                </Button>
              </div>

              {action === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">
                    Rejection Reason <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    The student will see this reason
                  </p>
                </div>
              )}

              {action === 'approve' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This will mark the book as borrowed and decrease available copies.
                    The student will be able to pick up the book.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setAction(null)
              setRejectionReason('')
            }}
            disabled={processRequest.isPending}
          >
            Cancel
          </Button>

          {action && (
            <Button
              onClick={handleProcess}
              disabled={processRequest.isPending}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {processRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === 'approve' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Request
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Request
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
