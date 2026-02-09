/**
 * Logout API Route
 * POST /api/auth/logout
 * Invalidates the user's session (client-side token removal)
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear the httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    )
    
    // Delete the token cookie
    response.cookies.delete('token')
    
    return response
    
  } catch (error) {
    console.error('[API] POST /api/auth/logout - Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'An error occurred during logout'
        }
      },
      { status: 500 }
    )
  }
}
