/**
 * Account Management API Routes
 * Endpoints for student account profile management
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { updateProfileSchema } from '@/lib/validation'
import { z } from 'zod'

/**
 * GET /api/account
 * Get current user's complete profile
 */
export async function GET(request: NextRequest) {
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

    // Fetch complete user profile excluding password
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        avatar: true,
        studentId: true,
        program: true,
        yearLevel: true,
        borrowingLimit: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            transactions: {
              where: {
                status: 'ACTIVE'
              }
            },
            fines: {
              where: {
                status: 'UNPAID'
              }
            }
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_NOT_FOUND', 
            message: 'User profile not found' 
          } 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { profile }
    })

  } catch (error: any) {
    console.error('[API] GET /api/account - Error:', error)
    
    // Handle authentication errors
    if (
      error.message?.includes('No authentication token') ||
      error.message?.includes('Invalid token') ||
      error.message?.includes('User not found') ||
      error.message?.includes('not active')
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'AUTH_REQUIRED', 
            message: error.message || 'Authentication required' 
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
          message: 'Failed to fetch profile',
          details: error.message
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/account
 * Update current user's profile (limited fields for students)
 */
export async function PATCH(request: NextRequest) {
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
    const validated = updateProfileSchema.parse(body)

    // Prepare update data - only allow phone and avatar for students
    const updateData: any = {}
    
    if (validated.phone !== undefined) {
      updateData.phone = validated.phone || null
    }
    
    if (validated.avatar !== undefined) {
      updateData.avatar = validated.avatar || null
    }

    // Update user profile
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        avatar: true,
        studentId: true,
        program: true,
        yearLevel: true,
        borrowingLimit: true,
        updatedAt: true
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_PROFILE',
        entityType: 'USER',
        entityId: user.id,
        description: `Updated profile: ${Object.keys(updateData).join(', ')}`
      }
    })

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('[API] PATCH /api/account - Error:', error)

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
          message: 'Failed to update profile' 
        } 
      },
      { status: 500 }
    )
  }
}
