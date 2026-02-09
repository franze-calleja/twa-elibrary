/**
 * Pre-Register Student API Route
 * POST /api/users/pre-register - Pre-register a student (Staff only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole } from '@/lib/auth'
import { studentPreRegisterSchema } from '@/lib/validation'
import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Verify staff authentication
    const user = await verifyAuthWithRole(request, [UserRole.STAFF])
    
    const body = await request.json()
    const validated = studentPreRegisterSchema.parse(body)
    
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        { status: 409 }
      )
    }
    
    // Check if student ID already exists
    const existingStudentId = await prisma.user.findUnique({
      where: { studentId: validated.studentId }
    })
    
    if (existingStudentId) {
      return NextResponse.json(
        { success: false, error: { code: 'STUDENT_ID_EXISTS', message: 'Student ID already registered' } },
        { status: 409 }
      )
    }
    
    // Create pre-registered student
    const student = await prisma.user.create({
      data: {
        email: validated.email,
        password: '', // Will be set during registration
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName || null,
        studentId: validated.studentId,
        program: validated.program,
        yearLevel: validated.yearLevel,
        phone: validated.phone || null,
        borrowingLimit: validated.borrowingLimit,
        role: UserRole.STUDENT,
        status: UserStatus.INACTIVE // Inactive until student completes registration
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        studentId: true,
        program: true,
        yearLevel: true,
        status: true
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PRE_REGISTER_STUDENT',
        entityType: 'USER',
        entityId: student.id,
        description: `Pre-registered student: ${student.email} (${student.studentId})`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { 
        student,
        message: 'Student pre-registered successfully. Student can now complete registration using their personal information.'
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('[API] POST /api/users/pre-register - Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.issues } },
        { status: 400 }
      )
    }
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Staff access required' } },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'REGISTER_ERROR', message: 'Failed to pre-register student' } },
      { status: 500 }
    )
  }
}
