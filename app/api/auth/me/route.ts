/**
 * Get Current User API Route
 * GET /api/auth/me
 * Returns the authenticated user's profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, sanitizeUser } from '@/lib/auth'
import { ERROR_CODES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication and get user
    const user = await verifyAuth(request)
    
    // 2. Return user profile
    return NextResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(user)
        }
      },
      { status: 200 }
    )
    
  } catch (error: any) {
    // Handle authentication errors
    if (error.message === 'No authentication token provided') {
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
    
    if (error.message === 'Invalid or expired token') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.AUTH_REQUIRED,
            message: 'Invalid or expired token'
          }
        },
        { status: 401 }
      )
    }
    
    if (error.message === 'User not found' || error.message === 'User account is not active') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.USER_NOT_FOUND,
            message: error.message
          }
        },
        { status: 404 }
      )
    }
    
    // Log unexpected errors
    console.error('[API] GET /api/auth/me - Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
}
