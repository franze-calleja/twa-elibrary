/**
 * Pending Requests API Route
 * GET /api/dashboard/pending-requests - Get pending borrow requests (Staff only)
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

    // Fetch pending requests with related data
    const [pendingRequests, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          status: 'PENDING'
        },
        skip,
        take: limit,
        orderBy: {
          borrowedAt: 'asc' // Oldest requests first
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              barcode: true,
              coverImage: true,
              status: true,
              availableQuantity: true
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
              avatar: true,
              status: true,
              borrowingLimit: true
            }
          }
        }
      }),
      
      prisma.transaction.count({
        where: {
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        pendingRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error: any) {
    console.error('[API] GET /api/dashboard/pending-requests - Error:', error)
    
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
          message: 'Failed to fetch pending requests' 
        } 
      },
      { status: 500 }
    )
  }
}
