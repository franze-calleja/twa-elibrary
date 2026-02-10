/**
 * Books API Routes
 * GET: List books with pagination, search, and filters
 * POST: Create a new book
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { bookSchema } from '@/lib/validation'
import { generateUniqueBarcode, barcodeExists, sanitizeBarcode } from '@/lib/barcode'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// GET /api/books - List books with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: Prisma.BookWhereInput = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
        { barcode: { contains: search } },
        { publisher: { contains: search } }
      ]
    }
    
    // Status filter
    if (status) {
      where.status = status as any
    }
    
    // Category filter
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      }
    }
    
    // Build order by
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // Fetch books with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          categories: {
            include: {
              category: true
            }
          },
          _count: {
            select: {
              transactions: true,
              reservations: true
            }
          }
        }
      }),
      prisma.book.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('[API] GET /api/books - Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch books'
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/books - Create a new book
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
    const validated = bookSchema.parse(body)
    
    // 3. Handle barcode
    let barcode = validated.barcode
    let generatedBarcode = false
    
    if (barcode) {
      // Clean barcode
      barcode = sanitizeBarcode(barcode)
      
      // Check if barcode already exists
      const exists = await barcodeExists(barcode)
      if (exists) {
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
    } else {
      // Generate unique barcode
      barcode = await generateUniqueBarcode()
      generatedBarcode = true
    }
    
    // 4. Create book with categories
    const { categoryIds, ...bookData } = validated
    
    const book = await prisma.book.create({
      data: {
        ...bookData,
        barcode,
        availableQuantity: validated.quantity,
        status: 'AVAILABLE',
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    })
    
    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_BOOK',
        entityType: 'BOOK',
        entityId: book.id,
        description: `Created book: ${book.title} (${book.barcode})`
      }
    })
    
    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          book,
          generatedBarcode: generatedBarcode ? barcode : undefined
        }
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle validation errors
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
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_BARCODE',
              message: 'Barcode already exists'
            }
          },
          { status: 409 }
        )
      }
      
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
    
    console.error('[API] POST /api/books - Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create book'
        }
      },
      { status: 500 }
    )
  }
}
