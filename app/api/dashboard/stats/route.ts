/**
 * Dashboard Statistics API Route
 * GET /api/dashboard/stats - Get overall dashboard statistics (Staff only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole } from '@/lib/auth'
import type { DashboardStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Verify staff authentication
    const user = await verifyAuthWithRole(request, ['STAFF'])
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'FORBIDDEN', 
            message: 'Staff access required' 
          } 
        },
        { status: 403 }
      )
    }

    // Fetch all statistics in parallel for better performance
    const [
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalUsers,
      activeStudents,
      activeTransactions,
      overdueTransactions
    ] = await Promise.all([
      // Total books (sum of all quantities)
      prisma.book.aggregate({
        _sum: {
          quantity: true
        }
      }),
      
      // Available books (sum of available quantities)
      prisma.book.aggregate({
        _sum: {
          availableQuantity: true
        }
      }),
      
      // Borrowed books (currently active transactions)
      prisma.transaction.count({
        where: {
          status: {
            in: ['ACTIVE', 'OVERDUE']
          }
        }
      }),
      
      // Total users (all students and staff)
      prisma.user.count(),
      
      // Active students (students with ACTIVE status)
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      }),
      
      // Active transactions (currently borrowed)
      prisma.transaction.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Overdue transactions
      prisma.transaction.count({
        where: {
          status: 'OVERDUE'
        }
      })
    ])

    const stats: DashboardStats = {
      totalBooks: totalBooks._sum.quantity || 0,
      availableBooks: availableBooks._sum.availableQuantity || 0,
      borrowedBooks,
      totalUsers,
      activeStudents,
      activeTransactions,
      overdueTransactions
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('[API] GET /api/dashboard/stats - Error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'FORBIDDEN', 
            message: 'Staff access required' 
          } 
        },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: 'Failed to fetch dashboard statistics' 
        } 
      },
      { status: 500 }
    )
  }
}
