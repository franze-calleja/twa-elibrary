/**
 * Student Dashboard Recent Borrows API Route
 * GET /api/student/dashboard/recent-borrows
 * Returns recent borrowing transactions for the authenticated student
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
    
    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    
    // 3. Fetch recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            status: true
          }
        }
      },
      orderBy: {
        borrowedAt: 'desc'
      },
      take: limit
    })
    
    // 4. Get total count
    const total = await prisma.transaction.count({
      where: {
        userId: user.id
      }
    })
    
    // 5. Return response
    return NextResponse.json({
      success: true,
      data: {
        transactions: recentTransactions,
        total
      }
    })
    
  } catch (error: any) {
    console.error('[API] GET /api/student/dashboard/recent-borrows - Error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch recent transactions' } },
      { status: 500 }
    )
  }
}
