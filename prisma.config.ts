// Prisma 7 Configuration File
// This file configures Prisma CLI behavior, including schema location,
// migration paths, database URL, and seeding scripts.
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Main schema entry point
  schema: 'prisma/schema.prisma',
  
  // Migration and seeding configuration
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  
  // Database connection
  datasource: {
    url: env('DATABASE_URL'),
  },
})
