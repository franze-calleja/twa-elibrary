/**
 * Staff Reset User Password API Route
 * POST /api/users/[id]/password - Reset any user's password (Staff only)
 * No current password required — staff override.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole, hashPassword } from '@/lib/auth'
import { staffResetPasswordSchema } from '@/lib/validation'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify the requester is an authenticated staff member
    const requester = await verifyAuthWithRole(request, [UserRole.STAFF])

    const { id } = await params

    // Fetch target user to make sure they exist
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validated = staffResetPasswordSchema.parse(body)

    // Hash and update
    const hashedPassword = await hashPassword(validated.newPassword)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: requester.id,
        action: 'RESET_USER_PASSWORD',
        entityType: 'USER',
        entityId: id,
        description: `Staff (${requester.email}) reset password for ${targetUser.email} (${targetUser.firstName} ${targetUser.lastName})`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Password for ${targetUser.firstName} ${targetUser.lastName} has been reset successfully.`
    })
  } catch (error: any) {
    console.error('[API] POST /api/users/[id]/password - Error:', error)

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
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to reset password' } },
      { status: 500 }
    )
  }
}
