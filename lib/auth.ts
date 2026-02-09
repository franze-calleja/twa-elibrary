/**
 * Authentication Utilities
 * Handles JWT token generation, verification, and password hashing
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string
  email: string
  role: 'STAFF' | 'STUDENT'
  iat?: number
  exp?: number
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extract token from request (cookie or Authorization header)
 */
export function extractToken(request: NextRequest): string | null {
  // First try to get from cookie (for web app)
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) {
    return cookieToken
  }
  
  // Fallback to Authorization header (for API clients/mobile)
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }
  
  // Check for "Bearer <token>" format
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  
  return null
}

/**
 * Verify authentication and get current user
 * Throws error if authentication fails
 */
export async function verifyAuth(request: NextRequest): Promise<User> {
  const token = extractToken(request)
  
  if (!token) {
    throw new Error('No authentication token provided')
  }
  
  const decoded = verifyToken(token)
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  if (user.status !== 'ACTIVE') {
    throw new Error('User account is not active')
  }
  
  return user
}

/**
 * Verify authentication and check role
 */
export async function verifyAuthWithRole(
  request: NextRequest,
  allowedRoles: ('STAFF' | 'STUDENT')[]
): Promise<User> {
  const user = await verifyAuth(request)
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

/**
 * Sanitize user object (remove sensitive data)
 */
export function sanitizeUser(user: User) {
  const { password, ...sanitized } = user
  return sanitized
}
