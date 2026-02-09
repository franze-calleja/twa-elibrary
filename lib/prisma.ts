/**
 * Prisma Client Singleton
 * Ensures a single Prisma Client instance is used throughout the application
 * Prevents multiple instances in development (hot reload) and production
 * 
 * Note: Prisma 7 requires driver adapter for MySQL/MariaDB when using client engine
 */

import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Parse DATABASE_URL: mysql://user:password@host:port/database
const dbUrl = new URL(process.env.DATABASE_URL!)

// Create adapter for MySQL/MariaDB connection
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // Remove leading '/'
  connectionLimit: 10,
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

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
