/**
 * Next.js Proxy handler to replace deprecated middleware
 * Handles authentication and role-based access control using cookies
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // Protected route prefixes
  const protectedPrefixes = ['/staff', '/student', '/dashboard']
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value

  if (!token) {
    // No token - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify token
    const decoded = verifyToken(token)

    // Role-based access control
    if (pathname.startsWith('/staff') && decoded.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    if (pathname.startsWith('/student') && decoded.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url))
    }

    // Token valid, allow access
    return NextResponse.next()
  } catch (error) {
    // Invalid token - clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: [
    '/staff/:path*',
    '/student/:path*',
    '/dashboard/:path*'
  ]
}
