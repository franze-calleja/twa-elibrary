/**
 * Book Barcode API Routes
 * GET: Find book by barcode (for scanning)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeBarcode } from '@/lib/barcode'

// GET /api/books/barcode/[barcode] - Find book by barcode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode: rawBarcode } = await params
  try {
    const barcode = sanitizeBarcode(rawBarcode)
    
    const book = await prisma.book.findUnique({
      where: { barcode },
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
                studentId: true
              }
            }
          }
        },
        _count: {
          select: {
            transactions: true
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
            message: 'Book not found with this barcode'
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
    console.error(`[API] GET /api/books/barcode/${rawBarcode} - Error:`, error)
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
