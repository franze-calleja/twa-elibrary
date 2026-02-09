/**
 * Register API Route
 * POST /api/auth/register
 * Allows students to complete registration after pre-registration by staff
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, sanitizeUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { ERROR_CODES } from '@/lib/constants'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json()
    const validated = registerSchema.parse(body)
    
    // 2. Find pre-registered student by matching personal information
    const preRegisteredUser = await prisma.user.findFirst({
      where: {
        studentId: validated.studentId,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName || null,
        role: 'STUDENT',
        status: 'INACTIVE' // Pre-registered students are INACTIVE until they complete registration
      },
      select: {
        id: true,
        email: true,
        studentId: true,
        password: true,
        firstName: true,
        lastName: true,
        middleName: true
      }
    })
    
    if (!preRegisteredUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STUDENT_NOT_PRE_REGISTERED',
            message: 'No pre-registration found matching your information. Please verify your details or contact the librarian.'
          }
        },
        { status: 404 }
      )
    }
    
    // 3. Check if account is already activated (has password)
    if (preRegisteredUser.password && preRegisteredUser.password !== '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_ALREADY_ACTIVATED',
            message: 'This account has already been activated. Please login.'
          }
        },
        { status: 409 }
      )
    }
    
    // 4. Hash password
    const hashedPassword = await hashPassword(validated.password)
    
    // 5. Update user with password and activate account
    const updatedUser = await prisma.user.update({
      where: { id: preRegisteredUser.id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE'
      }
    })
    
    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'ACCOUNT_ACTIVATED',
        entityType: 'USER',
        entityId: updatedUser.id,
        description: `Student account activated: ${updatedUser.email}`
      }
    })
    
    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully. You can now login with your credentials.',
        data: {
          user: sanitizeUser(updatedUser)
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    // Handle validation errors
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
    
    // Handle unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.DUPLICATE_EMAIL,
              message: 'An account with this email already exists'
            }
          },
          { status: 409 }
        )
      }
    }
    
    // Log unexpected errors
    console.error('[API] POST /api/auth/register - Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'An unexpected error occurred during registration'
        }
      },
      { status: 500 }
    )
  }
}
