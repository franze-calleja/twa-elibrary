/**
 * Transactions API Routes
 * Handles borrowing requests and transaction listing
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { borrowBookSchema } from '@/lib/validation'
import { z } from 'zod'
import { addDays } from 'date-fns'

/**
 * GET /api/transactions
 * List transactions with filters (both staff and students)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId') || ''
    const bookId = searchParams.get('bookId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const sortBy = searchParams.get('sortBy') || 'borrowedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}

    // Students can only see their own transactions
    if (user.role === 'STUDENT') {
      where.userId = user.id
    } else if (userId) {
      // Staff can filter by userId
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    if (bookId) {
      where.bookId = bookId
    }

    if (startDate || endDate) {
      where.borrowedAt = {}
      if (startDate) {
        where.borrowedAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.borrowedAt.lte = new Date(endDate)
      }
    }

    // Fetch with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              barcode: true,
              coverImage: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentId: true
            }
          },
          fine: true
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('[API] GET /api/transactions - Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR',
          message: 'Failed to fetch transactions' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a borrow request (STUDENT only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Only students can create borrow requests
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only students can create borrow requests' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = borrowBookSchema.parse(body)

    // Find book by barcode or bookId
    let book = null
    if (validated.barcode) {
      book = await prisma.book.findUnique({
        where: { barcode: validated.barcode }
      })
    } else if (validated.bookId) {
      book = await prisma.book.findUnique({
        where: { id: validated.bookId }
      })
    }

    if (!book) {
      return NextResponse.json(
        { success: false, error: { code: 'BOOK_NOT_FOUND', message: 'Book not found' } },
        { status: 404 }
      )
    }

    // Check if book is available
    if (book.status !== 'AVAILABLE' || book.availableQuantity < 1) {
      return NextResponse.json(
        { success: false, error: { code: 'BOOK_NOT_AVAILABLE', message: 'Book is not available for borrowing' } },
        { status: 400 }
      )
    }

    // Check if student account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'Your account is not active' } },
        { status: 403 }
      )
    }

    // Check borrowing limit
    const activeTransactions = await prisma.transaction.count({
      where: {
        userId: user.id,
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    })

    if (activeTransactions >= user.borrowingLimit) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'BORROWING_LIMIT_EXCEEDED', 
            message: `You have reached your borrowing limit (${user.borrowingLimit} books)` 
          } 
        },
        { status: 400 }
      )
    }

    // Check for overdue books
    const overdueCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        status: 'OVERDUE'
      }
    })

    if (overdueCount > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'HAS_OVERDUE_BOOKS', message: 'You have overdue books. Please return them first.' } },
        { status: 400 }
      )
    }

    // Check for unpaid fines
    const unpaidFines = await prisma.fine.findFirst({
      where: {
        userId: user.id,
        status: 'UNPAID'
      }
    })

    if (unpaidFines) {
      return NextResponse.json(
        { success: false, error: { code: 'HAS_UNPAID_FINES', message: 'You have unpaid fines. Please clear them first.' } },
        { status: 400 }
      )
    }

    // Check if already borrowed/pending for this book
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        bookId: book.id,
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    })

    if (existingTransaction) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'ALREADY_BORROWED', 
            message: existingTransaction.status === 'PENDING' 
              ? 'You already have a pending request for this book'
              : 'You have already borrowed this book' 
          } 
        },
        { status: 400 }
      )
    }

    // Calculate due date
    const dueDate = addDays(new Date(), validated.requestedDays)

    // Create borrow request with PENDING status
    const transaction = await prisma.transaction.create({
      data: {
        bookId: book.id,
        userId: user.id,
        status: 'PENDING',
        requestedDays: validated.requestedDays,
        dueDate,
        notes: validated.notes,
        type: 'BORROW'
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            barcode: true,
            coverImage: true
          }
        },
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
        action: 'CREATE_BORROW_REQUEST',
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        description: `Student ${user.firstName} ${user.lastName} requested to borrow "${book.title}" for ${validated.requestedDays} days`
      }
    })

    return NextResponse.json({
      success: true,
      data: { transaction },
      message: 'Borrow request submitted successfully. Awaiting staff approval.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }

    console.error('[API] POST /api/transactions - Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create borrow request' } },
      { status: 500 }
    )
  }
}
