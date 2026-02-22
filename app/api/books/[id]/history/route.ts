/**
 * Book History API Route
 * GET: Get paginated audit history for a specific book
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET /api/books/[id]/history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!book) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Book not found' } },
        { status: 404 }
      )
    }

    // Fetch history with pagination
    const [history, total] = await Promise.all([
      prisma.bookHistory.findMany({
        where: { bookId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.bookHistory.count({ where: { bookId: id } })
    ])

    // Fetch performer names for each history entry (if performedBy is set)
    const performerIds = [...new Set(history.map((h) => h.performedBy).filter(Boolean))] as string[]

    const performers =
      performerIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: performerIds } },
            select: { id: true, firstName: true, lastName: true, role: true }
          })
        : []

    const performerMap = Object.fromEntries(performers.map((p) => [p.id, p]))

    // Merge performer info into history entries
    const enrichedHistory = history.map((entry) => ({
      ...entry,
      performer: entry.performedBy ? (performerMap[entry.performedBy] ?? null) : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        history: enrichedHistory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error(`[API] GET /api/books/${id}/history - Error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch book history' } },
      { status: 500 }
    )
  }
}
