/**
 * Return Book API Route
 * PATCH /api/transactions/[id]/return
 * Staff scans barcode and marks book as returned
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { returnBookSchema } from '@/lib/validation'
import { z } from 'zod'
import { differenceInDays } from 'date-fns'
import { use } from 'react'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = use(params)
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Only staff can process returns
    if (user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only staff can process returns' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = returnBookSchema.parse(body)

    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentId: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } },
        { status: 404 }
      )
    }

    // Can only return ACTIVE or OVERDUE transactions
    if (transaction.status !== 'ACTIVE' && transaction.status !== 'OVERDUE') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: `Cannot return ${transaction.status.toLowerCase()} transaction` } },
        { status: 400 }
      )
    }

    const now = new Date()
    const daysOverdue = differenceInDays(now, transaction.dueDate)
    const isOverdue = daysOverdue > 0

    // Calculate fine if overdue
    let fine = null
    if (isOverdue) {
      // Get fine per day from settings (default: 5.00)
      const fineSetting = await prisma.settings.findUnique({
        where: { key: 'FINE_PER_DAY' }
      })
      const finePerDay = fineSetting ? parseFloat(fineSetting.value) : 5.00
      const fineAmount = daysOverdue * finePerDay

      fine = {
        amount: fineAmount,
        reason: `Book returned ${daysOverdue} day(s) late`,
        daysOverdue
      }
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnedAt: now,
          processedBy: user.id,
          notes: validated.notes || transaction.notes,
          type: 'RETURN'
        },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentId: true
            }
          }
        }
      })

      // Increment book availability
      let bookStatus = transaction.book.status
      if (validated.condition === 'DAMAGED') {
        bookStatus = 'DAMAGED'
      } else if (validated.condition === 'LOST') {
        bookStatus = 'LOST'
      } else if (transaction.book.status === 'BORROWED') {
        // If all copies were borrowed, set back to AVAILABLE
        bookStatus = 'AVAILABLE'
      }

      const updatedBook = await tx.book.update({
        where: { id: transaction.bookId },
        data: {
          availableQuantity: validated.condition === 'GOOD' ? { increment: 1 } : undefined,
          status: bookStatus
        }
      })

      // Create fine record if overdue
      let createdFine = null
      if (fine) {
        createdFine = await tx.fine.create({
          data: {
            transactionId: transaction.id,
            userId: transaction.userId,
            amount: fine.amount,
            reason: fine.reason,
            status: 'UNPAID'
          }
        })
      }

      // Create book history if damaged or lost
      if (validated.condition !== 'GOOD') {
        await tx.bookHistory.create({
          data: {
            bookId: transaction.bookId,
            action: 'STATUS_CHANGED',
            description: `Book returned in ${validated.condition} condition by ${transaction.user.firstName} ${transaction.user.lastName}. Processed by ${user.firstName} ${user.lastName}`,
            performedBy: user.id
          }
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'RETURN_BOOK',
          entityType: 'TRANSACTION',
          entityId: id,
          description: `Staff ${user.firstName} ${user.lastName} processed return of "${transaction.book.title}" by ${transaction.user.firstName} ${transaction.user.lastName}. Condition: ${validated.condition}${fine ? `, Fine: $${fine.amount}` : ''}`
        }
      })

      return {
        transaction: updatedTransaction,
        book: updatedBook,
        fine: createdFine,
        isOverdue,
        daysOverdue: isOverdue ? daysOverdue : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: isOverdue 
        ? `Book returned successfully. A fine of $${result.fine?.amount} has been applied for ${result.daysOverdue} overdue days.`
        : 'Book returned successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }

    console.error('[API] PATCH /api/transactions/[id]/return - Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'RETURN_ERROR', message: 'Failed to process return' } },
      { status: 500 }
    )
  }
}
