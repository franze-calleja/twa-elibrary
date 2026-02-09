import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, verifyAuthWithRole } from '@/lib/auth'
import { ERROR_CODES } from '@/lib/constants'
import { z } from 'zod'

// Validation schema for updating user
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  program: z.string().optional(),
  yearLevel: z.number().int().min(1).max(10).optional(),
  borrowingLimit: z.number().int().min(0).max(20).optional(),
  avatar: z.string().optional(),
})

/**
 * GET /api/users/[id]
 * Fetch a single user by ID with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const currentUser = await verifyAuth(request)

    const { id } = await params

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        studentId: true,
        program: true,
        yearLevel: true,
        borrowingLimit: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        // Related data
        transactions: {
          where: {
            status: {
              in: ['ACTIVE', 'OVERDUE']
            }
          },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                barcode: true,
                coverImage: true,
              }
            }
          },
          orderBy: {
            borrowedAt: 'desc'
          }
        },
        fines: {
          where: {
            status: 'UNPAID'
          },
          include: {
            transaction: {
              include: {
                book: {
                  select: {
                    title: true,
                    barcode: true,
                  }
                }
              }
            }
          },
          orderBy: {
            issuedAt: 'desc'
          }
        },
        _count: {
          select: {
            transactions: true,
            fines: true,
            reservations: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'User not found'
          }
        },
        { status: 404 }
      )
    }

    // Permission check: Staff can view any user, students can only view themselves
    if (currentUser.role !== 'STAFF' && currentUser.id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'You do not have permission to view this user'
          }
        },
        { status: 403 }
      )
    }

    // Calculate statistics
    const stats = {
      activeLoans: user.transactions.length,
      unpaidFines: user.fines.reduce((sum, fine) => sum + Number(fine.amount), 0),
      totalTransactions: user._count.transactions,
      totalFines: user._count.fines,
      totalReservations: user._count.reservations,
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats
      }
    })

  } catch (error) {
    console.error('[API] GET /api/users/[id] - Error:', error)
    
    if (error instanceof Error && error.message === 'Invalid token') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required'
          }
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch user'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]
 * Update a user's information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const currentUser = await verifyAuth(request)

    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'User not found'
          }
        },
        { status: 404 }
      )
    }

    // Permission check: Staff can update any user, students can only update themselves
    // Students cannot change their own status or borrowing limit
    if (currentUser.role !== 'STAFF' && currentUser.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'You do not have permission to update this user'
          }
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = updateUserSchema.parse(body)

    // If updating as student (not staff), restrict certain fields
    const updateData: any = {}
    
    if (currentUser.role !== 'STAFF') {
      // Students can only update their own basic info
      const allowedFields = ['firstName', 'lastName', 'phone', 'avatar']
      for (const field of allowedFields) {
        if (validated[field as keyof typeof validated] !== undefined) {
          updateData[field] = validated[field as keyof typeof validated]
        }
      }
    } else {
      // Staff can update all fields
      Object.assign(updateData, validated)
    }

    // Check for email uniqueness if email is being changed
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_EMAIL',
              message: 'Email already exists'
            }
          },
          { status: 409 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        studentId: true,
        program: true,
        yearLevel: true,
        borrowingLimit: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      }
    })

    // Create audit log for staff updates
    if (currentUser.role === 'STAFF') {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'UPDATE_USER',
          entityType: 'USER',
          entityId: updatedUser.id,
          description: `Updated user: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}) - Fields: ${Object.keys(updateData).join(', ')}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: { user: updatedUser }
    })

  } catch (error) {
    console.error('[API] PUT /api/users/[id] - Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: error.issues
          }
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Invalid token') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Authentication required'
          }
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update user'
        }
      },
      { status: 500 }
    )
  }
}
