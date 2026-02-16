/**
 * Recent Activities API Route
 * GET /api/dashboard/recent-activities - Get recent transactions/activities (Staff only)
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
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch recent transactions with related data
    const recentActivities = await prisma.transaction.findMany({
      take: limit,
      orderBy: {
        borrowedAt: 'desc'
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
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        activities: recentActivities,
        total: recentActivities.length
      }
    })

  } catch (error: any) {
    console.error('[API] GET /api/dashboard/recent-activities - Error:', error)
    
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
          message: 'Failed to fetch recent activities' 
        } 
      },
      { status: 500 }
    )
  }
}
