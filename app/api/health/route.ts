/**
 * Health Check API Endpoint
 * 
 * Tests database connectivity and returns system status
 * Useful for:
 * - Vercel deployment verification
 * - Monitoring
 * - Load balancer health checks
 * 
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic stats (optional - remove if you want faster response)
    const [userCount, bookCount] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
    ])
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
      },
      stats: {
        users: userCount,
        books: bookCount,
      },
      environment: process.env.NODE_ENV,
    })
  } catch (error: any) {
    console.error('[Health Check] Database connection failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message || 'Database connection failed',
        },
        environment: process.env.NODE_ENV,
      },
      { status: 503 }
    )
  }
}
