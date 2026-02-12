/**
 * Return Book Dialog - Staff
 * Process book returns with condition assessment
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useReturnBook } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  Calendar
} from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import type { TransactionWithDetails, BookCondition } from '@/types'

interface ReturnBookDialogProps {
  transaction: TransactionWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReturnBookDialog({
  transaction,
  open,
  onOpenChange
}: ReturnBookDialogProps) {
  const [condition, setCondition] = useState<BookCondition>('GOOD')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const returnBook = useReturnBook(transaction.id)

  // Calculate overdue fine
  const daysOverdue = Math.max(0, differenceInDays(new Date(), new Date(transaction.dueDate)))
  const finePerDay = 5 // Should be fetched from settings
  const calculatedFine = daysOverdue * finePerDay

  const handleReturn = async () => {
    try {
      await returnBook.mutateAsync({
        condition,
        ...(notes.trim() && { notes })
      })

      toast({
        title: 'Book Returned',
        description: 'The book has been returned successfully',
      })

      onOpenChange(false)
      setCondition('GOOD')
      setNotes('')
    } catch (error: any) {
      toast({
        title: 'Return Failed',
        description: error.response?.data?.error?.message || 'Failed to process return',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Book Return</DialogTitle>
          <DialogDescription>
            Inspect the book condition and process the return
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Summary */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-semibold">{transaction.book.title}</h4>
              <p className="text-sm text-muted-foreground">{transaction.book.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Barcode:</span>
                <p className="font-medium">{transaction.book.barcode}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Student:</span>
                <p className="font-medium">
                  {transaction.user.firstName} {transaction.user.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Overdue Alert */}
          {daysOverdue > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Overdue Return</AlertTitle>
              <AlertDescription>
                <div className="space-y-1">
                  <p>Due date was: {format(new Date(transaction.dueDate), 'MMMM dd, yyyy')}</p>
                  <p>Days overdue: <strong>{daysOverdue} day{daysOverdue !== 1 ? 's' : ''}</strong></p>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">Fine: ₱{calculatedFine.toFixed(2)}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Due Date Info (Not Overdue) */}
          {daysOverdue === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Returned on time! No fine will be charged.
              </AlertDescription>
            </Alert>
          )}

          {/* Book Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">
              Book Condition <span className="text-red-600">*</span>
            </Label>
            <Select value={condition} onValueChange={(value) => setCondition(value as BookCondition)}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select book condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Good Condition</p>
                      <p className="text-xs text-muted-foreground">No visible damage</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="DAMAGED">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Damaged</p>
                      <p className="text-xs text-muted-foreground">Minor damage (torn pages, marks)</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="LOST">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">Lost</p>
                      <p className="text-xs text-muted-foreground">Book not returned</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {condition !== 'GOOD' && (
              <Alert variant={condition === 'LOST' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {condition === 'DAMAGED' ? (
                    <>Additional fees may apply for damaged books. Please document the damage in notes.</>
                  ) : (
                    <>Student will be charged for the full replacement cost of the book.</>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes {condition !== 'GOOD' && <span className="text-red-600">*</span>}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                condition === 'GOOD'
                  ? 'Add any notes about the return (optional)'
                  : 'Describe the damage or circumstances (required)'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Return Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">{condition}</span>
              </div>
              {daysOverdue > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days Overdue:</span>
                    <span className="font-medium text-red-600">{daysOverdue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue Fine:</span>
                    <span className="font-semibold text-red-600">₱{calculatedFine.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setCondition('GOOD')
              setNotes('')
            }}
            disabled={returnBook.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleReturn}
            disabled={returnBook.isPending || (condition !== 'GOOD' && !notes.trim())}
          >
            {returnBook.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Return
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
