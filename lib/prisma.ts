/**
 * Prisma Client Singleton
 * Ensures a single Prisma Client instance is used throughout the application
 * Prevents multiple instances in development (hot reload) and production
 * 
 * Note: Prisma 7 requires driver adapter for MySQL/MariaDB when using client engine locally
 * In serverless (Vercel), we use direct connection without adapter
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Check if we're in Vercel serverless environment
const isVercel = process.env.VERCEL === '1'

let prismaInstance: PrismaClient

if (isVercel) {
  // For Vercel serverless: use direct connection (no adapter needed)
  prismaInstance = new PrismaClient({
    log: ['error'],
  })
} else {
  // For local development: use driver adapter
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs')
  
  const dbUrl = new URL(process.env.DATABASE_URL!)
  
  // Build optional SSL/TLS options from DATABASE_URL query params
  const params = dbUrl.searchParams
  let ssl: any = undefined
  if (params.has('sslaccept')) {
    const accept = params.get('sslaccept')
    if (accept === 'strict') ssl = { rejectUnauthorized: true }
    if (accept === 'accept_invalid_certs') ssl = { rejectUnauthorized: false }
  }
  if (params.has('sslrootcert')) {
    const certPath = params.get('sslrootcert')
    try {
      const ca = fs.readFileSync(certPath!, 'utf8')
      ssl = { ...(ssl || {}), ca }
    } catch (e) {
      // ignore - fall back to default Node CAs
    }
  }
  
  // Create adapter for MySQL/MariaDB connection
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // Remove leading '/'
    connectionLimit: 10,
    ...(ssl ? { ssl } : {}),
  })
  
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma || prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
