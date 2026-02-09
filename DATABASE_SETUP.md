# Database Setup Guide

## 📊 Overview

This guide covers the complete database setup for the TWA E-Library Management System using Prisma ORM with MySQL.

## 🗄️ Database Schema

The schema includes **11 models**:
- **User** - Staff and students (role-based)
- **Book** - Book catalog with barcode tracking
- **Category** - Hierarchical book categorization
- **BookCategory** - Many-to-many junction table
- **Transaction** - Borrowing records
- **Reservation** - Book reservation queue
- **Fine** - Penalty management
- **BookHistory** - Book audit trail
- **Settings** - System configuration
- **AuditLog** - System-wide activity tracking

## 🚀 Setup Instructions

### 1. Install Dependencies

If not already installed, run:

```bash
npm install
```

This installs:
- `@prisma/client` - Prisma client for database operations
- `prisma` - Prisma CLI
- `bcryptjs` - Password hashing
- `tsx` - TypeScript execution for seed file

### 2. Configure Database Connection

Make sure MySQL is running locally on port 3306 with:
- Username: `root`
- Password: `root`
- Database: `twa_elibrary_db`

Your `.env.local` should contain:
```env
DATABASE_URL="mysql://root:root@localhost:3306/twa_elibrary_db"
```

### 3. Create the Database

Create the MySQL database if it doesn't exist:

```bash
mysql -u root -p
CREATE DATABASE twa_elibrary_db;
EXIT;
```

Or use a GUI tool like phpMyAdmin, MySQL Workbench, or TablePlus.

### 4. Generate Prisma Client

Generate the Prisma client from the schema:

```bash
npx prisma generate
```

### 5. Run Database Migration

Create the database tables from the schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables with relationships
- Apply indexes
- Set up foreign keys
- Generate the migration files

### 6. Seed the Database

Populate the database with initial data:

```bash
npx prisma db seed
```

This will create:
- **6 system settings** (loan period, fines, limits, etc.)
- **12 book categories** (Fiction, Computer Science, etc.)
- **1 staff account** (admin@library.edu / Admin123!)
- **1 student account** (student@university.edu / Student123!)
- **4 sample books** with proper categorization

### 7. View Database (Optional)

Open Prisma Studio to view and manage data:

```bash
npx prisma studio
```

Accessible at: http://localhost:5555

## 🧪 Test Credentials

After seeding, you can test the system with:

**Staff Account:**
- Email: `admin@library.edu`
- Password: `Admin123!`

**Student Account:**
- Email: `student@university.edu`
- Password: `Student123!`

## 📁 File Structure

```
twa-elibrary/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Migration history (auto-generated)
├── lib/
│   └── prisma.ts              # Prisma client singleton
├── .env                       # Database URL (fallback)
└── .env.local                 # Local database URL (gitignored)
```

## 🔧 Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to production
npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Run seed script
npx prisma db seed

# Pull schema from existing database
npx prisma db pull

# Push schema without migration
npx prisma db push
```

## 🛡️ Database Design Highlights

### UUID Primary Keys
All models use UUID for security and scalability.

### Proper Indexing
Strategic indexes on:
- Foreign keys for faster joins
- Search fields (email, studentId, barcode, title, author)
- Filter fields (status, role, dates)

### Cascading Deletes
- Deleting a book removes its categories and history
- Deleting a category removes book associations

### Soft Relationships
- Users are preserved even if transactions exist
- Books can't be deleted if active transactions exist

### Decimal Precision
Fine amounts use `Decimal(10, 2)` for accurate monetary calculations.

### Timestamps
All models have `createdAt` and `updatedAt` (where applicable).

## 🔐 Security Considerations

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **No Sensitive Data Exposure**: Prisma client excludes password by default in queries
3. **SQL Injection Prevention**: Prisma parameterizes all queries
4. **Environment Variables**: Database credentials in `.env.local` (gitignored)

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Check if MySQL is running: `mysql.server status` (macOS) or `sudo service mysql status` (Linux)
- Verify connection string in `.env.local`
- Test connection: `mysql -u root -p`

### Error: "Database does not exist"
- Create the database: `CREATE DATABASE twa_elibrary_db;`

### Error: "Migration failed"
- Reset and retry: `npx prisma migrate reset`
- Or manually drop the database and recreate

### Error: "Seed script failed"
- Check if migration was applied: `npx prisma migrate status`
- Ensure tsx is installed: `npm install -D tsx`
- Run seed manually: `npx tsx prisma/seed.ts`

### Error: "Prisma Client not generated"
- Run: `npx prisma generate`
- Check if `@prisma/client` is installed

## 📚 Next Steps

After database setup:

1. ✅ Test Prisma client in API routes
2. ✅ Create authentication endpoints
3. ✅ Build book management APIs
4. ✅ Implement transaction workflows
5. ✅ Add validation with Zod
6. ✅ Create UI components

## 📖 Documentation

For more details, see:
- `/twa-elibrary-documentation/DATABASE_SCHEMA.md` - Complete schema documentation
- `/twa-elibrary-documentation/API_SPECIFICATION.md` - API endpoints
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Last Updated**: February 9, 2026  
**Schema Version**: 1.0.0
