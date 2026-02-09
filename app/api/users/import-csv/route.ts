/**
 * Import Students CSV API Route
 * POST /api/users/import-csv - Bulk import students (Staff only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthWithRole } from '@/lib/auth'
import { studentPreRegisterSchema } from '@/lib/validation'
import { ERROR_CODES } from '@/lib/constants'
import { z } from 'zod'

interface ImportStudent {
  email: string
  firstName: string
  lastName: string
  middleName?: string
  studentId: string
  program: string
  yearLevel: number
  phone?: string
  borrowingLimit?: number
}

export async function POST(request: NextRequest) {
  try {
    // Verify staff authentication
    const user = await verifyAuthWithRole(request, ['STAFF'])
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: ERROR_CODES.FORBIDDEN, 
            message: 'Staff access required' 
          } 
        },
        { status: 403 }
      )
    }

    // Parse body
    const body = await request.json()
    const { students } = body as { students: ImportStudent[] }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid data: students array is required' 
          } 
        },
        { status: 400 }
      )
    }

    const results = {
      success: [] as any[],
      errors: [] as any[]
    }

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i]

      try {
        // Validate student data
        const validated = studentPreRegisterSchema.parse(studentData)

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: validated.email },
              { studentId: validated.studentId }
            ]
          }
        })

        if (existingUser) {
          results.errors.push({
            row: i + 1,
            data: studentData,
            error: 'Email or Student ID already exists'
          })
          continue
        }

        // Create student
        const student = await prisma.user.create({
          data: {
            email: validated.email,
            password: '', // Empty password - will be set during registration
            role: 'STUDENT',
            status: 'INACTIVE',
            firstName: validated.firstName,
            lastName: validated.lastName,
            middleName: validated.middleName || null,
            studentId: validated.studentId,
            program: validated.program,
            yearLevel: validated.yearLevel,
            phone: validated.phone || null,
            borrowingLimit: validated.borrowingLimit || 3
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            studentId: true
          }
        })

        results.success.push({
          row: i + 1,
          student
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push({
            row: i + 1,
            data: studentData,
            error: 'Validation failed',
            details: error.issues
          })
        } else {
          results.errors.push({
            row: i + 1,
            data: studentData,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'BULK_IMPORT_STUDENTS',
        entityType: 'USER',
        entityId: user.id,
        description: `Imported ${results.success.length} students via CSV (${results.errors.length} errors)`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        imported: results.success.length,
        failed: results.errors.length,
        results
      }
    })
  } catch (error) {
    console.error('[API] POST /api/users/import-csv - Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to import students' 
        } 
      },
      { status: 500 }
    )
  }
}
