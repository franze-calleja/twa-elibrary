/**
 * Student Dashboard Stats API Route
 * GET /api/student/dashboard/stats
 * Returns dashboard statistics for the authenticated student
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const user = await verifyAuth(request)
    
    if (!user || user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Student access required' } },
        { status: 403 }
      )
    }
    
    // 2. Get current date for overdue calculation
    const now = new Date()
    
    // 3. Fetch statistics using parallel queries
    const [
      borrowedBooksCount,
      overdueBooksCount,
      userDetails
    ] = await Promise.all([
      // Currently borrowed books (ACTIVE status)
      prisma.transaction.count({
        where: {
          userId: user.id,
          status: 'ACTIVE'
        }
      }),
      
      // Overdue books (ACTIVE and past due date)
      prisma.transaction.count({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          dueDate: {
            lt: now
          }
        }
      }),
      
      // User borrowing limit and details
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          borrowingLimit: true,
          status: true
        }
      })
    ])
    
    // 4. Calculate available borrowing slots
    const borrowingLimit = userDetails?.borrowingLimit || 3
    const availableBorrowings = Math.max(0, borrowingLimit - borrowedBooksCount)
    
    // 5. Get total borrowing history count
    const totalBorrowingHistory = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: 'BORROW'
      }
    })
    
    // 6. Return statistics
    return NextResponse.json({
      success: true,
      data: {
        borrowedBooks: borrowedBooksCount,
        overdueBooks: overdueBooksCount,
        borrowingLimit,
        availableBorrowings,
        totalBorrowingHistory,
        accountStatus: userDetails?.status || 'ACTIVE'
      }
    })
    
  } catch (error: any) {
    console.error('[API] GET /api/student/dashboard/stats - Error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch dashboard statistics' } },
      { status: 500 }
    )
  }
}
