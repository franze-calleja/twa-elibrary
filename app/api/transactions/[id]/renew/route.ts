/**
 * Renew Book API Route
 * PATCH /api/transactions/[id]/renew
 * Student or Staff renews a book
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { renewBookSchema } from '@/lib/validation'
import { z } from 'zod'
import { addDays } from 'date-fns'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = renewBookSchema.parse(body)

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

    // Students can only renew their own books
    if (user.role === 'STUDENT' && transaction.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only renew your own books' } },
        { status: 403 }
      )
    }

    // Can only renew ACTIVE transactions
    if (transaction.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: `Cannot renew ${transaction.status.toLowerCase()} transaction` } },
        { status: 400 }
      )
    }

    // Check max renewals (default: 2)
    const maxRenewalsSetting = await prisma.settings.findUnique({
      where: { key: 'MAX_RENEWALS' }
    })
    const maxRenewals = maxRenewalsSetting ? parseInt(maxRenewalsSetting.value) : 2

    if (transaction.renewalCount >= maxRenewals) {
      return NextResponse.json(
        { success: false, error: { code: 'MAX_RENEWALS_REACHED', message: `Maximum renewals (${maxRenewals}) reached` } },
        { status: 400 }
      )
    }

    // Check if book is reserved by someone else
    const reservation = await prisma.reservation.findFirst({
      where: {
        bookId: transaction.bookId,
        status: 'PENDING',
        userId: { not: transaction.userId }
      }
    })

    if (reservation) {
      return NextResponse.json(
        { success: false, error: { code: 'BOOK_RESERVED', message: 'Book is reserved by another student. Cannot renew.' } },
        { status: 400 }
      )
    }

    // Get default loan period if additionalDays not provided
    const loanPeriodSetting = await prisma.settings.findUnique({
      where: { key: 'DEFAULT_LOAN_PERIOD_DAYS' }
    })
    const additionalDays = validated.additionalDays || (loanPeriodSetting ? parseInt(loanPeriodSetting.value) : 14)

    // Calculate new due date
    const newDueDate = addDays(transaction.dueDate, additionalDays)

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewalCount: { increment: 1 },
        type: 'RENEW',
        notes: validated.notes || transaction.notes
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RENEW_BOOK',
        entityType: 'TRANSACTION',
        entityId: id,
        description: `${user.role === 'STAFF' ? `Staff ${user.firstName} ${user.lastName} renewed` : `${user.firstName} ${user.lastName} renewed`} "${transaction.book.title}" (Renewal ${updatedTransaction.renewalCount}/${maxRenewals})`
      }
    })

    return NextResponse.json({
      success: true,
      data: { 
        transaction: updatedTransaction,
        renewalsRemaining: maxRenewals - updatedTransaction.renewalCount
      },
      message: `Book renewed successfully. New due date: ${newDueDate.toLocaleDateString()}`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }

    console.error('[API] PATCH /api/transactions/[id]/renew - Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'RENEW_ERROR', message: 'Failed to renew book' } },
      { status: 500 }
    )
  }
}
