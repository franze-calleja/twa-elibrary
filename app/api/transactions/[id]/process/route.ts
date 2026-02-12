/**
 * Process Borrow Request API Route
 * PATCH /api/transactions/[id]/process
 * Staff approves or rejects a pending borrow request
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { processBorrowSchema } from '@/lib/validation'
import { z } from 'zod'
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

    // Only staff can process borrow requests
    if (user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only staff can process borrow requests' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = processBorrowSchema.parse(body)

    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        book: true,
        user: true
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } },
        { status: 404 }
      )
    }

    // Can only process PENDING requests
    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: `Cannot process ${transaction.status.toLowerCase()} transaction` } },
        { status: 400 }
      )
    }

    if (validated.approved) {
      // APPROVE: Change status to ACTIVE and decrement book availability
      
      // Double-check book is still available
      if (transaction.book.status !== 'AVAILABLE' || transaction.book.availableQuantity < 1) {
        return NextResponse.json(
          { success: false, error: { code: 'BOOK_NOT_AVAILABLE', message: 'Book is no longer available' } },
          { status: 400 }
        )
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update transaction status
        const updatedTransaction = await tx.transaction.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            processedBy: user.id,
            approvedAt: new Date(),
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

        // Decrement book availability
        const updatedBook = await tx.book.update({
          where: { id: transaction.bookId },
          data: {
            availableQuantity: { decrement: 1 },
            status: transaction.book.availableQuantity === 1 ? 'BORROWED' : transaction.book.status
          }
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'APPROVE_BORROW',
            entityType: 'TRANSACTION',
            entityId: id,
            description: `Staff ${user.firstName} ${user.lastName} approved borrow request for "${transaction.book.title}" by ${transaction.user.firstName} ${transaction.user.lastName}`
          }
        })

        return { transaction: updatedTransaction, book: updatedBook }
      })

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Borrow request approved successfully'
      })

    } else {
      // REJECT: Change status to REJECTED
      
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedBy: user.id,
          rejectedAt: new Date(),
          rejectionReason: validated.rejectionReason,
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
          action: 'REJECT_BORROW',
          entityType: 'TRANSACTION',
          entityId: id,
          description: `Staff ${user.firstName} ${user.lastName} rejected borrow request for "${transaction.book.title}" by ${transaction.user.firstName} ${transaction.user.lastName}. Reason: ${validated.rejectionReason}`
        }
      })

      return NextResponse.json({
        success: true,
        data: { transaction: updatedTransaction },
        message: 'Borrow request rejected'
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }

    console.error('[API] PATCH /api/transactions/[id]/process - Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'PROCESS_ERROR', message: 'Failed to process borrow request' } },
      { status: 500 }
    )
  }
}
