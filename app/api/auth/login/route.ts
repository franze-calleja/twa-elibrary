/**
 * Login API Route
 * POST /api/auth/login
 * Authenticates staff or student users
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken, sanitizeUser } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { ERROR_CODES } from '@/lib/constants'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json()
    const validated = loginSchema.parse(body)
    
    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: 'Invalid email or password'
          }
        },
        { status: 401 }
      )
    }
    
    // 3. Verify password
    const isPasswordValid = await comparePassword(validated.password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: 'Invalid email or password'
          }
        },
        { status: 401 }
      )
    }
    
    // 4. Check account status
    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ACCOUNT_INACTIVE,
            message: 'Your account is inactive. Please contact the administrator.'
          }
        },
        { status: 403 }
      )
    }
    
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.ACCOUNT_SUSPENDED,
            message: 'Your account has been suspended. Please contact the administrator.'
          }
        },
        { status: 403 }
      )
    }
    
    // 5. Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // 6. Generate JWT token
    const token = generateToken(user)
    
    // 7. Calculate token expiration (7 days)
    const expiresIn = 7 * 24 * 60 * 60 // 7 days in seconds
    
    // 8. Create response with httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(user),
          token, // Also return for mobile/API clients
          expiresIn
        }
      },
      { status: 200 }
    )
    
    // Set httpOnly cookie for web clients
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/'
    })
    
    return response
    
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
    
    // Log unexpected errors
    console.error('[API] POST /api/auth/login - Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'An unexpected error occurred during login'
        }
      },
      { status: 500 }
    )
  }
}
