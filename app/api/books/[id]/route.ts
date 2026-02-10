/**
 * Book Detail API Routes
 * GET: Get single book by ID
 * PATCH: Update book
 * DELETE: Delete book
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { bookSchema } from '@/lib/validation'
import { barcodeExists, sanitizeBarcode } from '@/lib/barcode'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// GET /api/books/[id] - Get single book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        transactions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
                email: true
              }
            }
          }
        },
        reservations: {
          where: {
            status: 'PENDING'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true
              }
            }
          },
          orderBy: {
            reservedAt: 'asc'
          }
        },
        _count: {
          select: {
            transactions: true,
            reservations: true
          }
        }
      }
    })
    
    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found'
          }
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { book }
    })
  } catch (error) {
    console.error(`[API] GET /api/books/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch book'
        }
      },
      { status: 500 }
    )
  }
}

// PATCH /api/books/[id] - Update book
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
    
    // 2. Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })
    
    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found'
          }
        },
        { status: 404 }
      )
    }
    
    // 3. Parse and validate request body (partial update)
    const body = await request.json()
    const updateSchema = bookSchema.partial()
    const validated = updateSchema.parse(body)
    
    // 4. Validate quantity if being updated
    if (validated.quantity !== undefined) {
      const activeBorrows = existingBook._count.transactions
      if (validated.quantity < activeBorrows) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_QUANTITY',
              message: `Cannot reduce quantity below ${activeBorrows} (number of active borrows)`
            }
          },
          { status: 400 }
        )
      }
    }
    
    // 5. Handle barcode if being updated
    let barcode = validated.barcode
    if (barcode) {
      barcode = sanitizeBarcode(barcode)
      
      // Check if barcode already exists (excluding current book)
      const barcodeBook = await prisma.book.findFirst({
        where: {
          barcode,
          NOT: { id }
        }
      })
      
      if (barcodeBook) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_BARCODE',
              message: 'A book with this barcode already exists'
            }
          },
          { status: 409 }
        )
      }
    }
    
    // 6. Update book
    const { categoryIds, quantity, ...updateData } = validated
    
    // Calculate new available quantity if total quantity changed
    let availableQuantity = existingBook.availableQuantity
    if (quantity !== undefined && quantity !== existingBook.quantity) {
      const difference = quantity - existingBook.quantity
      availableQuantity = existingBook.availableQuantity + difference
    }
    
    const book = await prisma.$transaction(async (tx) => {
      // Update categories if provided
      if (categoryIds) {
        // Remove existing categories
        await tx.bookCategory.deleteMany({
          where: { bookId: id }
        })
        
        // Add new categories
        await tx.bookCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            bookId: id,
            categoryId
          }))
        })
      }
      
      // Update book
      const updatedBook = await tx.book.update({
        where: { id },
        data: {
          ...updateData,
          ...(barcode && { barcode }),
          ...(quantity !== undefined && { 
            quantity,
            availableQuantity 
          })
        },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      })
      
      return updatedBook
    })
    
    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_BOOK',
        entityType: 'BOOK',
        entityId: book.id,
        description: `Updated book: ${book.title}`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { book }
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
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CATEGORY',
              message: 'One or more categories do not exist'
            }
          },
          { status: 400 }
        )
      }
    }
    
    console.error(`[API] PATCH /api/books/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update book'
        }
      },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Delete book
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
    
    // 2. Check if book exists and has active transactions
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: {
              where: { status: 'ACTIVE' }
            },
            reservations: {
              where: { status: 'PENDING' }
            }
          }
        }
      }
    })
    
    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found'
          }
        },
        { status: 404 }
      )
    }
    
    // 3. Check for active transactions or reservations
    if (book._count.transactions > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_ACTIVE_TRANSACTIONS',
            message: 'Cannot delete book with active borrows'
          }
        },
        { status: 409 }
      )
    }
    
    if (book._count.reservations > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_RESERVATIONS',
            message: 'Cannot delete book with pending reservations'
          }
        },
        { status: 409 }
      )
    }
    
    // 4. Delete book (cascade will handle categories)
    await prisma.book.delete({
      where: { id }
    })
    
    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_BOOK',
        entityType: 'BOOK',
        entityId: id,
        description: `Deleted book: ${book.title} (${book.barcode})`
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Book deleted successfully'
      }
    })
  } catch (error) {
    console.error(`[API] DELETE /api/books/${id} - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete book'
        }
      },
      { status: 500 }
    )
  }
}
