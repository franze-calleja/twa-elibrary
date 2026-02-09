/**
 * TWA E-Library - Database Seed Script
 * 
 * This script initializes the database with:
 * - Default admin staff account
 * - System settings
 * - Default book categories
 * - Sample data (optional)
 * 
 * Run with: npm run prisma:seed
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as bcrypt from 'bcryptjs'

// Prisma 7 requires driver adapter for MySQL/MariaDB
// Parse DATABASE_URL: mysql://user:password@host:port/database
const dbUrl = new URL(process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // Remove leading '/'
  connectionLimit: 10,
})

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function main() {
  console.log('🌱 Starting database seeding...')

  // ========================================
  // 1. Create Default Admin Account
  // ========================================
  console.log('\n📝 Creating default admin account...')
  
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.edu' },
    update: {},
    create: {
      email: 'admin@library.edu',
      password: adminPassword,
      role: 'STAFF',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
    },
  })
  
  console.log(`✅ Admin created: ${admin.email}`)
  console.log(`   Default password: Admin@123`)
  console.log(`   ⚠️  IMPORTANT: Change this password after first login!`)

  // ========================================
  // 2. Create System Settings
  // ========================================
  console.log('\n⚙️  Creating system settings...')
  
  const defaultSettings = [
    {
      key: 'DEFAULT_LOAN_PERIOD_DAYS',
      value: '14',
      description: 'Default book loan period in days',
    },
    {
      key: 'MAX_RENEWALS',
      value: '2',
      description: 'Maximum number of renewals per book',
    },
    {
      key: 'FINE_PER_DAY',
      value: '5.00',
      description: 'Fine amount per day for overdue books (in currency)',
    },
    {
      key: 'MAX_BORROWING_LIMIT_STUDENT',
      value: '3',
      description: 'Maximum books a student can borrow simultaneously',
    },
    {
      key: 'RESERVATION_EXPIRY_HOURS',
      value: '24',
      description: 'Hours before a reservation expires',
    },
    {
      key: 'SYSTEM_EMAIL',
      value: 'library@university.edu',
      description: 'System email address for notifications',
    },
    {
      key: 'LIBRARY_NAME',
      value: 'TWA University Library',
      description: 'Name of the library',
    },
    {
      key: 'MAX_FINE_THRESHOLD',
      value: '100.00',
      description: 'Maximum fine amount before borrowing is blocked',
    },
    {
      key: 'GRACE_PERIOD_DAYS',
      value: '1',
      description: 'Grace period in days before fines start accruing',
    },
  ]

  for (const setting of defaultSettings) {
    const created = await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
    console.log(`   ✓ ${setting.key}: ${setting.value}`)
  }

  // ========================================
  // 3. Create Default Categories
  // ========================================
  console.log('\n📚 Creating book categories...')
  
  const categories = [
    { name: 'Computer Science', description: 'Programming, algorithms, data structures' },
    { name: 'Mathematics', description: 'Pure and applied mathematics' },
    { name: 'Physics', description: 'Classical and modern physics' },
    { name: 'Engineering', description: 'Various engineering disciplines' },
    { name: 'Literature', description: 'Novels, poetry, drama' },
    { name: 'History', description: 'Historical texts and references' },
    { name: 'Science', description: 'General science and nature' },
    { name: 'Business', description: 'Business, economics, and management' },
    { name: 'Art', description: 'Visual arts, design, and architecture' },
    { name: 'Philosophy', description: 'Philosophical texts and theories' },
    { name: 'Psychology', description: 'Psychology and behavioral sciences' },
    { name: 'Medicine', description: 'Medical and health sciences' },
  ]

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    console.log(`   ✓ ${category.name}`)
  }

  // ========================================
  // 4. Create Sample Student (Optional)
  // ========================================
  console.log('\n👨‍🎓 Creating sample student account...')
  
  const studentPassword = await bcrypt.hash('Student@123', 10)
  
  const sampleStudent = await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'John',
      lastName: 'Doe',
      studentId: '2026-00001',
      program: 'Computer Science',
      yearLevel: 1,
      borrowingLimit: 3,
    },
  })
  
  console.log(`✅ Sample student created: ${sampleStudent.email}`)
  console.log(`   Student ID: ${sampleStudent.studentId}`)
  console.log(`   Password: Student@123`)

  // ========================================
  // 5. Create Sample Books (Optional)
  // ========================================
  console.log('\n📖 Creating sample books...')
  
  const computerScienceCategory = await prisma.category.findUnique({
    where: { name: 'Computer Science' },
  })

  const mathematicsCategory = await prisma.category.findUnique({
    where: { name: 'Mathematics' },
  })

  if (computerScienceCategory) {
    const sampleBooks = [
      {
        barcode: 'LIB-2026-00001',
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        publisher: 'MIT Press',
        publicationYear: 2009,
        edition: '3rd Edition',
        isbn: '9780262033848',
        description: 'A comprehensive textbook on algorithms and data structures',
        language: 'English',
        location: 'CS-A-001',
        quantity: 5,
        availableQuantity: 5,
        categories: {
          create: [
            { categoryId: computerScienceCategory.id },
          ],
        },
      },
      {
        barcode: 'LIB-2026-00002',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        edition: '1st Edition',
        isbn: '9780132350884',
        description: 'Best practices for writing clean, maintainable code',
        language: 'English',
        location: 'CS-A-002',
        quantity: 3,
        availableQuantity: 3,
        categories: {
          create: [
            { categoryId: computerScienceCategory.id },
          ],
        },
      },
    ]

    if (mathematicsCategory) {
      sampleBooks.push({
        barcode: 'LIB-2026-00003',
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        publisher: 'Cengage Learning',
        publicationYear: 2015,
        edition: '8th Edition',
        isbn: '9781285741550',
        description: 'Comprehensive calculus textbook with applications',
        language: 'English',
        location: 'MATH-A-001',
        quantity: 4,
        availableQuantity: 4,
        categories: {
          create: [
            { categoryId: mathematicsCategory.id },
          ],
        },
      })
    }

    for (const bookData of sampleBooks) {
      const book = await prisma.book.upsert({
        where: { barcode: bookData.barcode },
        update: {},
        create: bookData,
      })
      console.log(`   ✓ ${book.title} (${book.barcode})`)
    }
  }

  // ========================================
  // 6. Create Audit Log Entry
  // ========================================
  console.log('\n📋 Creating initial audit log...')
  
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      entityType: 'SYSTEM',
      description: 'Database seeded with initial data',
      ipAddress: '127.0.0.1',
    },
  })
  
  console.log('   ✓ Audit log created')

  // ========================================
  // Summary
  // ========================================
  console.log('\n' + '='.repeat(60))
  console.log('✨ Database seeding completed successfully!')
  console.log('='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`   • Admin account: admin@library.edu`)
  console.log(`   • Student account: student@university.edu`)
  console.log(`   • System settings: ${defaultSettings.length} entries`)
  console.log(`   • Categories: ${categories.length} entries`)
  console.log(`   • Sample books: 3 entries`)
  console.log('\n⚠️  SECURITY REMINDER:')
  console.log('   Please change the default admin password immediately!')
  console.log('   Default password: Admin@123')
  console.log('\n🚀 You can now start the development server:')
  console.log('   npm run dev')
  console.log('\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('\n❌ Error during seeding:')
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
