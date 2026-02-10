/**
 * Prisma Client Singleton - Alternative for Serverless
 * 
 * This version disables the driver adapter in serverless environments
 * and uses direct connection string instead
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Check if we're in a serverless/production environment
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME

let prismaInstance: PrismaClient

if (isServerless) {
  // For serverless: use direct connection (no adapter)
  // Vercel requires connection pooling - use connection limit in URL
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
} else {
  // For local development: use driver adapter
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
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
  
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
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
