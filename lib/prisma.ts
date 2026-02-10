/**
 * Prisma Client Singleton
 * Ensures a single Prisma Client instance is used throughout the application
 * Prevents multiple instances in development (hot reload) and production
 * 
 * Note: Prisma 7 requires driver adapter for MySQL/MariaDB
 * Serverless environments need special connection settings (limit=1, no pooling)
 */

import { PrismaClient } from '@prisma/client'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Parse DATABASE_URL: mysql://user:password@host:port/database
const dbUrl = new URL(process.env.DATABASE_URL!)

// Check if we're in Vercel serverless environment
const isVercel = process.env.VERCEL === '1'

// Build SSL/TLS options from DATABASE_URL query params
const params = dbUrl.searchParams
let ssl: any = undefined
if (params.has('sslaccept')) {
  const accept = params.get('sslaccept')
  if (accept === 'strict') ssl = { rejectUnauthorized: true }
  if (accept === 'accept_invalid_certs') ssl = { rejectUnauthorized: false }
}

// Create adapter with serverless-optimized settings
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // Remove leading '/'
  // Serverless: use 1 connection per function, local dev: use pool
  connectionLimit: isVercel ? 1 : 10,
  // Serverless: shorter timeouts to fail fast
  acquireTimeout: isVercel ? 5000 : 10000,
  connectTimeout: isVercel ? 5000 : 10000,
  ...(ssl ? { ssl } : {}),
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
