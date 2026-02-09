/**
 * Users API Routes
 * GET /api/users - Get all users with filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole } from '@/lib/auth'
import { UserRole, UserStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Verify staff authentication
    const user = await verifyAuthWithRole(request, [UserRole.STAFF])
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') as UserRole | null
    const status = searchParams.get('status') as UserStatus | null
    const program = searchParams.get('program') || ''
    const yearLevel = searchParams.get('yearLevel') ? parseInt(searchParams.get('yearLevel')!) : null
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentId: { contains: search } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }
    
    if (program) {
      where.program = { contains: program }
    }
    
    if (yearLevel) {
      where.yearLevel = yearLevel
    }
    
    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          studentId: true,
          program: true,
          yearLevel: true,
          phone: true,
          borrowingLimit: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              transactions: {
                where: { status: 'ACTIVE' }
              },
              fines: {
                where: { status: 'UNPAID' }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VIEW_USERS',
        entityType: 'USER',
        description: `Viewed users list (page ${page})`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error: any) {
    console.error('[API] GET /api/users - Error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Staff access required' } },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    )
  }
}
