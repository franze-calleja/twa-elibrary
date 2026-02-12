/**
 * Borrow Request Dialog
 * Student scans book and creates borrow request
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateBorrowRequest } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/use-toast'
import { Loader2, BookOpen, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Book } from '@prisma/client'
import Image from 'next/image'

const borrowSchema = z.object({
  requestedDays: z.number().min(1).max(90),
  notes: z.string().optional()
})

type BorrowFormData = z.infer<typeof borrowSchema>

interface BorrowRequestDialogProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
  barcode?: string
}

export function BorrowRequestDialog({ book, open, onOpenChange, barcode }: BorrowRequestDialogProps) {
  const { toast } = useToast()
  const createRequest = useCreateBorrowRequest()
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      requestedDays: 14,
      notes: ''
    }
  })

  const onSubmit = async (data: BorrowFormData) => {
    if (!book) return

    try {
      await createRequest.mutateAsync({
        bookId: book.id,
        barcode: barcode,
        requestedDays: data.requestedDays,
        notes: data.notes
      })

      setShowSuccess(true)
      form.reset()

      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 2000)

      toast({
        title: 'Request Submitted',
        description: 'Your borrow request has been submitted. Awaiting staff approval.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to submit request',
        variant: 'destructive'
      })
    }
  }

  if (!book) return null

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Your borrow request is pending staff approval.
              <br />
              You'll be notified once it's processed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request to Borrow</DialogTitle>
          <DialogDescription>
            Review book details and specify how many days you need this book
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Details */}
          <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md bg-muted">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              {book.location && (
                <p className="text-xs text-muted-foreground mt-1">
                  Location: {book.location}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  Available: {book.availableQuantity}/{book.quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Borrow Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestedDays">Borrow Duration (Days)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="requestedDays"
                  type="number"
                  min="1"
                  max="90"
                  {...form.register('requestedDays', { valueAsNumber: true })}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">
                  days (1-90)
                </span>
              </div>
              {form.formState.errors.requestedDays && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.requestedDays.message}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Due date: {new Date(Date.now() + (form.watch('requestedDays') || 14) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special notes or requests..."
                {...form.register('notes')}
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your request will be reviewed by library staff. You'll be notified once it's approved or rejected.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createRequest.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
