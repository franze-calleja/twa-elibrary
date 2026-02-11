/**
 * Password Management API Route
 * Endpoint for changing user password
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, hashPassword, comparePassword } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validation'
import { z } from 'zod'

/**
 * PUT /api/account/password
 * Change current user's password
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'AUTH_REQUIRED', 
            message: 'Authentication required' 
          } 
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = changePasswordSchema.parse(body)

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true,
        email: true
      }
    })

    if (!userWithPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_NOT_FOUND', 
            message: 'User not found' 
          } 
        },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      validated.currentPassword, 
      userWithPassword.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_PASSWORD', 
            message: 'Current password is incorrect' 
          } 
        },
        { status: 400 }
      )
    }

    // Check if new password is same as current password
    const isSamePassword = await comparePassword(
      validated.newPassword,
      userWithPassword.password
    )

    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'SAME_PASSWORD', 
            message: 'New password must be different from current password' 
          } 
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(validated.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CHANGE_PASSWORD',
        entityType: 'USER',
        entityId: user.id,
        description: 'Password changed successfully'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error: any) {
    console.error('[API] PUT /api/account/password - Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid input data',
            details: error.issues 
          } 
        },
        { status: 400 }
      )
    }

    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'AUTH_REQUIRED', 
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
          message: 'Failed to change password' 
        } 
      },
      { status: 500 }
    )
  }
}
