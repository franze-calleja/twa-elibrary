/**
 * Book Barcode Image API Route
 * GET: Generate barcode image for a book
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBarcodeImage } from '@/lib/barcode'

// GET /api/books/[id]/barcode-image - Generate barcode image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Find the book
    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        barcode: true,
        title: true
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
    
    // Generate barcode image
    const imageDataUrl = await generateBarcodeImage(book.barcode)
    
    return NextResponse.json({
      success: true,
      data: {
        barcode: book.barcode,
        title: book.title,
        imageDataUrl
      }
    })
  } catch (error) {
    console.error(`[API] GET /api/books/${id}/barcode-image - Error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: 'Failed to generate barcode image'
        }
      },
      { status: 500 }
    )
  }
}
