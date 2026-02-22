/**
 * Create Admin Account API Route
 * POST /api/users/create-admin - Create a new staff/admin account (Staff only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole, hashPassword } from '@/lib/auth'
import { createAdminSchema } from '@/lib/validation'
import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Verify that the requester is an authenticated staff member
    const requester = await verifyAuthWithRole(request, [UserRole.STAFF])

    const body = await request.json()
    const validated = createAdminSchema.parse(body)

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(validated.password)

    const admin = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName || null,
        phone: validated.phone || null,
        role: UserRole.STAFF,
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: requester.id,
        action: 'CREATE_ADMIN',
        entityType: 'USER',
        entityId: admin.id,
        description: `Created admin account: ${admin.email} (${admin.firstName} ${admin.lastName})`
      }
    })

    return NextResponse.json({
      success: true,
      data: { admin }
    }, { status: 201 })

  } catch (error: any) {
    console.error('[API] POST /api/users/create-admin - Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }

    if (error.message?.includes('permissions') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Staff access required' } },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create admin account' } },
      { status: 500 }
    )
  }
}
