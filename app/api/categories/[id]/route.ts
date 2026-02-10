/**
 * Category Detail API Routes
 * GET: Get single category
 * PATCH: Update category
 * DELETE: Delete category
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  parentId: z.string()
    .uuid('Invalid parent category ID')
    .optional()
    .or(z.literal(''))
    .nullable()
})

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                barcode: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            books: true,
            children: true
          }
        }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { category }
    })
  } catch (error) {
    console.error(`[API] GET /api/categories/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch category'
        }
      },
      { status: 500 }
    )
  }
}

// PATCH /api/categories/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    
    // 2. Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id }
    })
    
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      )
    }
    
    // 3. Parse and validate request body
    const body = await request.json()
    const validated = updateCategorySchema.parse(body)
    
    // 4. Check for duplicate name (if changing name)
    if (validated.name && validated.name !== existing.name) {
      const duplicate = await prisma.category.findFirst({
        where: {
          name: validated.name,
          NOT: { id }
        }
      })
      
      if (duplicate) {
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
    }
    
    // 5. Validate parent ID (if changing)
    if (validated.parentId !== undefined) {
      if (validated.parentId && validated.parentId === id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PARENT',
              message: 'Category cannot be its own parent'
            }
          },
          { status: 400 }
        )
      }
      
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
    }
    
    // 6. Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { 
          description: validated.description || null 
        }),
        ...(validated.parentId !== undefined && { 
          parentId: validated.parentId || null 
        })
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
    
    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        description: `Updated category: ${category.name}`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { category }
    })
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
    
    console.error(`[API] PATCH /api/categories/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update category'
        }
      },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    
    // 2. Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            books: true,
            children: true
          }
        }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      )
    }
    
    // 3. Check if category has books assigned
    if (category._count.books > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_BOOKS',
            message: 'Cannot delete category with assigned books'
          }
        },
        { status: 409 }
      )
    }
    
    // 4. Check if category has child categories
    if (category._count.children > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_CHILDREN',
            message: 'Cannot delete category with subcategories'
          }
        },
        { status: 409 }
      )
    }
    
    // 5. Delete category
    await prisma.category.delete({
      where: { id }
    })
    
    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: id,
        description: `Deleted category: ${category.name}`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Category deleted successfully'
      }
    })
  } catch (error) {
    console.error(`[API] DELETE /api/categories/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete category'
        }
      },
      { status: 500 }
    )
  }
}
