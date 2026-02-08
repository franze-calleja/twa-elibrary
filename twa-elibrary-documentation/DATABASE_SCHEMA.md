# Database Schema Design

## Entity Relationship Overview

```
Users (Staff & Students)
  ├── Transactions (Borrowing Records)
  ├── Reservations
  └── Fines

Books
  ├── Transactions
  ├── Reservations
  ├── BookCategories (Many-to-Many)
  └── BookHistory

Categories
  └── BookCategories (Many-to-Many)

Settings (System Configuration)
AuditLogs (Activity Tracking)
```

## Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  STAFF
  STUDENT
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum BookStatus {
  AVAILABLE
  BORROWED
  RESERVED
  MAINTENANCE
  LOST
  DAMAGED
}

enum TransactionStatus {
  ACTIVE
  RETURNED
  OVERDUE
}

enum TransactionType {
  BORROW
  RETURN
  RENEW
}

// Models

model User {
  id                String            @id @default(uuid())
  email             String            @unique
  password          String
  role              UserRole
  status            UserStatus        @default(ACTIVE)
  
  // Common fields
  firstName         String
  lastName          String
  phone             String?
  avatar            String?
  
  // Student specific fields
  studentId         String?           @unique
  program           String?
  yearLevel         Int?
  borrowingLimit    Int               @default(3)
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  transactions      Transaction[]
  reservations      Reservation[]
  fines             Fine[]
  auditLogs         AuditLog[]
  
  @@index([email])
  @@index([studentId])
  @@index([role])
}

model Book {
  id                String            @id @default(uuid())
  barcode           String            @unique
  isbn              String?
  title             String
  author            String
  publisher         String?
  publicationYear   Int?
  edition           String?
  pages             Int?
  description       String?           @db.Text
  language          String            @default("English")
  location          String?           // Shelf location
  status            BookStatus        @default(AVAILABLE)
  coverImage        String?
  quantity          Int               @default(1)
  availableQuantity Int               @default(1)
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  categories        BookCategory[]
  transactions      Transaction[]
  reservations      Reservation[]
  bookHistory       BookHistory[]
  
  @@index([barcode])
  @@index([status])
  @@index([title])
  @@index([author])
}

model Category {
  id                String            @id @default(uuid())
  name              String            @unique
  description       String?
  parentId          String?
  
  // Self-referential relation for nested categories
  parent            Category?         @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children          Category[]        @relation("CategoryHierarchy")
  
  // Relations
  books             BookCategory[]
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([name])
}

model BookCategory {
  bookId            String
  categoryId        String
  
  book              Book              @relation(fields: [bookId], references: [id], onDelete: Cascade)
  category          Category          @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([bookId, categoryId])
  @@index([bookId])
  @@index([categoryId])
}

model Transaction {
  id                String            @id @default(uuid())
  bookId            String
  userId            String
  type              TransactionType   @default(BORROW)
  status            TransactionStatus @default(ACTIVE)
  
  borrowedAt        DateTime          @default(now())
  dueDate           DateTime
  returnedAt        DateTime?
  renewalCount      Int               @default(0)
  
  notes             String?           @db.Text
  processedBy       String?           // Staff user ID who processed
  
  // Relations
  book              Book              @relation(fields: [bookId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  fine              Fine?
  
  @@index([bookId])
  @@index([userId])
  @@index([status])
  @@index([dueDate])
}

model Reservation {
  id                String            @id @default(uuid())
  bookId            String
  userId            String
  status            String            @default("PENDING") // PENDING, FULFILLED, CANCELLED, EXPIRED
  
  reservedAt        DateTime          @default(now())
  expiresAt         DateTime
  fulfilledAt       DateTime?
  cancelledAt       DateTime?
  
  // Relations
  book              Book              @relation(fields: [bookId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([bookId])
  @@index([userId])
  @@index([status])
}

model Fine {
  id                String            @id @default(uuid())
  transactionId     String            @unique
  userId            String
  amount            Decimal           @db.Decimal(10, 2)
  reason            String
  status            String            @default("UNPAID") // UNPAID, PAID, WAIVED
  
  issuedAt          DateTime          @default(now())
  paidAt            DateTime?
  
  notes             String?           @db.Text
  
  // Relations
  transaction       Transaction       @relation(fields: [transactionId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
}

model BookHistory {
  id                String            @id @default(uuid())
  bookId            String
  action            String            // CREATED, UPDATED, STATUS_CHANGED, etc.
  description       String            @db.Text
  performedBy       String?           // User ID
  
  createdAt         DateTime          @default(now())
  
  // Relations
  book              Book              @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@index([bookId])
  @@index([createdAt])
}

model Settings {
  id                String            @id @default(uuid())
  key               String            @unique
  value             String            @db.Text
  description       String?
  
  updatedAt         DateTime          @updatedAt
  
  @@index([key])
}

model AuditLog {
  id                String            @id @default(uuid())
  userId            String?
  action            String
  entityType        String?           // USER, BOOK, TRANSACTION, etc.
  entityId          String?
  description       String            @db.Text
  ipAddress         String?
  userAgent         String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  // Relations
  user              User?             @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([entityType])
  @@index([createdAt])
}
```

## Key Design Decisions

### 1. User Model
- Single table for both Staff and Students (identified by `role`)
- Student-specific fields are nullable
- `borrowingLimit` allows customization per student

### 2. Book Management
- `barcode` is unique identifier for physical books
- `quantity` and `availableQuantity` support multiple copies
- `status` tracks overall book condition
- Soft categorization through many-to-many relationship

### 3. Transactions
- Tracks all borrowing activities
- `type` field supports BORROW, RETURN, RENEW operations
- `renewalCount` limits number of renewals
- Links to Fine if penalties apply

### 4. Reservations
- Allows students to reserve borrowed books
- Auto-expires after duration
- Queue system for popular books

### 5. Fines
- Links to specific transaction
- Supports different statuses (UNPAID, PAID, WAIVED)
- Decimal precision for monetary amounts

### 6. Audit Trail
- `BookHistory` tracks book-specific changes
- `AuditLog` tracks system-wide activities
- Essential for compliance and debugging

### 7. Settings
- Key-value store for system configuration
- Examples: DEFAULT_LOAN_PERIOD, MAX_RENEWALS, FINE_PER_DAY

## Sample Settings Records

```typescript
const defaultSettings = [
  { key: 'DEFAULT_LOAN_PERIOD_DAYS', value: '14', description: 'Default book loan period in days' },
  { key: 'MAX_RENEWALS', value: '2', description: 'Maximum number of renewals per book' },
  { key: 'FINE_PER_DAY', value: '5.00', description: 'Fine amount per day (overdue)' },
  { key: 'MAX_BORROWING_LIMIT_STUDENT', value: '3', description: 'Maximum books a student can borrow' },
  { key: 'RESERVATION_EXPIRY_HOURS', value: '24', description: 'Hours before reservation expires' },
  { key: 'SYSTEM_EMAIL', value: 'library@university.edu', description: 'System email address' },
]
```

## Indexes Strategy
- Primary indexes on foreign keys for faster joins
- Compound indexes on frequently queried fields
- Covering indexes for common query patterns
- Regular index maintenance and optimization

## Data Migration Strategy
1. Initialize database with Prisma migrations
2. Seed default settings and categories
3. Import existing book data (if any)
4. Bulk import student data via CSV
5. Set up automated backups (TiDB supports point-in-time recovery)
