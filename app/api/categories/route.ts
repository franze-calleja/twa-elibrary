/**
 * Categories API Routes
 * GET: List all categories
 * POST: Create a new category
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Category validation schema
const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  parentId: z.string()
    .uuid('Invalid parent category ID')
    .optional()
    .or(z.literal(''))
})

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true'
    
    if (includeHierarchy) {
      // Get categories with parent-child hierarchy
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              books: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { categories }
      })
    } else {
      // Get flat list of categories
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              books: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { categories }
      })
    }
  } catch (error) {
    console.error('[API] GET /api/categories - Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch categories'
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication (staff only)
    const user = await verifyAuth(request)
    if (!user || user.role !== 'STAFF') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Staff access required'
          }
        },
        { status: 403 }
      )
    }
    
    // 2. Parse and validate request body
    const body = await request.json()
    const validated = categorySchema.parse(body)
    
    // 3. Check if category name already exists
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: validated.name
        }
      }
    })
    
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A category with this name already exists'
          }
        },
        { status: 409 }
      )
    }
    
    // 4. If parentId provided, verify it exists
    if (validated.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validated.parentId }
      })
      
      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PARENT',
              message: 'Parent category does not exist'
            }
          },
          { status: 400 }
        )
      }
    }
    
    // 5. Create category
    const category = await prisma.category.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        parentId: validated.parentId || null
      },
      include: {
        parent: true,
        _count: {
          select: {
            books: true
          }
        }
      }
    })
    
    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        description: `Created category: ${category.name}`
      }
    })
    
    return NextResponse.json(
      {
        success: true,
        data: { category }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.issues
          }
        },
        { status: 400 }
      )
    }
    
    console.error('[API] POST /api/categories - Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create category'
        }
      },
      { status: 500 }
    )
  }
}
