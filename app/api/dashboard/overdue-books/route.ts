/**
 * Overdue Books API Route
 * GET /api/dashboard/overdue-books - Get list of overdue transactions (Staff only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole } from '@/lib/auth'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Fetch overdue transactions with related data
    const [overdueBooks, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          status: {
            in: ['OVERDUE', 'ACTIVE']
          },
          dueDate: {
            lt: new Date() // Due date is in the past
          }
        },
        skip,
        take: limit,
        orderBy: {
          dueDate: 'asc' // Oldest overdue first
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
              studentId: true,
              phone: true,
              avatar: true
            }
          },
          fine: true
        }
      }),
      
      prisma.transaction.count({
        where: {
          status: {
            in: ['OVERDUE', 'ACTIVE']
          },
          dueDate: {
            lt: new Date()
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        overdueBooks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error: any) {
    console.error('[API] GET /api/dashboard/overdue-books - Error:', error)
    
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
          message: 'Failed to fetch overdue books' 
        } 
      },
      { status: 500 }
    )
  }
}
