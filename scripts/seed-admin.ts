import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@library.edu'
  const password = process.env.ADMIN_PASSWORD || 'Admin123!'

  console.log(`Seeding admin user: ${email}`)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Admin user already exists. Skipping.')
    await prisma.$disconnect()
    return
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'STAFF',
      status: 'ACTIVE',
      firstName: 'Admin',
      lastName: 'Librarian',
      phone: '+0000000000',
    },
  })

  console.log('Created admin user:', user.email)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('Seed admin failed:', e)
  process.exit(1)
})
