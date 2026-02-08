# GitHub Copilot Instructions - TWA E-Library System

> **Complete AI Development Guide**: This file provides comprehensive context to GitHub Copilot for building the TWA E-Library Management System. All code suggestions should align with these guidelines, best practices, and project requirements.

---

## 🎯 Project Mission

Build a **production-ready university e-library management system** that enables:
- **Staff**: Efficient book management, student administration, and transaction processing via barcode scanning
- **Students**: Seamless book borrowing, account management, and history tracking

**Quality Standards**: Clean, maintainable, type-safe code that's scalable, secure, and user-friendly.

---

## 📚 System Architecture Overview

### User Roles & Permissions

#### Staff (Librarians)
- ✅ Register and manage books (add, edit, delete, update status)
- ✅ Generate and scan barcodes (CODE128 format)
- ✅ Process borrowing and returns
- ✅ Pre-register students (individually or bulk CSV import)
- ✅ Manage student accounts (activate, suspend, view history)
- ✅ Monitor overdue books and process fines
- ✅ Generate reports and analytics
- ✅ Configure system settings

#### Students
- ✅ Browse and search book catalog
- ✅ Scan barcodes to borrow books (mobile-optimized)
- ✅ View currently borrowed books with due dates
- ✅ View complete borrowing history
- ✅ Manage account (update profile, change password)
- ✅ Renew books (if eligible)

### Core Workflows

#### Book Registration Flow
1. Staff scans existing barcode OR manually enters book details
2. If no barcode exists → system generates unique barcode (format: `LIB-{YEAR}-{SEQUENCE}`)
3. Book details saved to database with categories
4. Barcode displayed for printing/labeling
5. Book status set to `AVAILABLE`

#### Borrowing Flow
1. Student/Staff scans book barcode
2. System validates barcode and finds book
3. Student ID entered/scanned
4. **Eligibility checks performed**:
   - Book status is `AVAILABLE`
   - Student account is `ACTIVE`
   - Student within borrowing limit
   - No overdue books
   - No unpaid fines above threshold
5. If approved → create transaction record
6. Calculate due date (current date + loan period from settings)
7. Decrement book's `availableQuantity`
8. Generate receipt with transaction details
9. Send confirmation (future: email)

#### Return Flow
1. Staff scans book barcode
2. System finds active transaction
3. Staff inspects book condition
4. System checks if overdue:
   - If yes → calculate fine (`daysOverdue × finePerDay`)
   - Create Fine record
5. Update transaction status to `RETURNED`
6. Increment book's `availableQuantity`
7. Check reservation queue → notify next student if reserved
8. Generate return receipt

---

## 🛠️ Tech Stack & Tools

### Core Technologies
```yaml
Framework: Next.js 15+ (App Router)
Language: TypeScript (strict mode)
Database: MySQL (TiDB Cloud compatible)
ORM: Prisma
UI Framework: Shadcn UI + Tailwind CSS
State Management:
  - Global: Zustand
  - Server: TanStack Query (React Query)
  - Local: React useState/useReducer
HTTP Client: Axios
Authentication: JWT tokens (httpOnly cookies)
Hosting:
  - Frontend/API: Vercel (free tier)
  - Database: TiDB Cloud (free tier)
```

### Key Libraries
```json
{
  "barcode-generation": "bwip-js",
  "barcode-scanning": "@zxing/browser",
  "forms": "react-hook-form",
  "validation": "zod",
  "dates": "date-fns",
  "csv": "papaparse",
  "styling": "tailwindcss + class-variance-authority",
  "icons": "lucide-react"
}
```

---

## 💾 Database Schema (Prisma)

### Core Models

#### User (Staff & Students)
```prisma
model User {
  id              String       @id @default(uuid())
  email           String       @unique
  password        String       // bcrypt hashed
  role            UserRole     // STAFF | STUDENT
  status          UserStatus   // ACTIVE | INACTIVE | SUSPENDED
  
  // Common fields
  firstName       String
  lastName        String
  phone           String?
  avatar          String?
  
  // Student-specific (nullable)
  studentId       String?      @unique
  program         String?
  yearLevel       Int?
  borrowingLimit  Int          @default(3)
  
  // Relations
  transactions    Transaction[]
  reservations    Reservation[]
  fines           Fine[]
  auditLogs       AuditLog[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  lastLoginAt     DateTime?
}
```

#### Book
```prisma
model Book {
  id                String       @id @default(uuid())
  barcode           String       @unique  // LIB-2026-00001
  isbn              String?
  title             String
  author            String
  publisher         String?
  publicationYear   Int?
  edition           String?
  description       String?      @db.Text
  language          String       @default("English")
  location          String?      // Shelf location
  status            BookStatus   // AVAILABLE | BORROWED | RESERVED | MAINTENANCE | LOST | DAMAGED
  coverImage        String?
  quantity          Int          @default(1)
  availableQuantity Int          @default(1)
  
  // Relations
  categories        BookCategory[]
  transactions      Transaction[]
  reservations      Reservation[]
  bookHistory       BookHistory[]
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}
```

#### Transaction
```prisma
model Transaction {
  id            String            @id @default(uuid())
  bookId        String
  userId        String
  type          TransactionType   // BORROW | RETURN | RENEW
  status        TransactionStatus // ACTIVE | RETURNED | OVERDUE
  
  borrowedAt    DateTime          @default(now())
  dueDate       DateTime
  returnedAt    DateTime?
  renewalCount  Int               @default(0)
  notes         String?           @db.Text
  processedBy   String?           // Staff user ID
  
  // Relations
  book          Book              @relation(fields: [bookId], references: [id])
  user          User              @relation(fields: [userId], references: [id])
  fine          Fine?
}
```

#### Fine
```prisma
model Fine {
  id            String      @id @default(uuid())
  transactionId String      @unique
  userId        String
  amount        Decimal     @db.Decimal(10, 2)
  reason        String
  status        String      @default("UNPAID") // UNPAID | PAID | WAIVED
  
  issuedAt      DateTime    @default(now())
  paidAt        DateTime?
  notes         String?     @db.Text
  
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  user          User        @relation(fields: [userId], references: [id])
}
```

#### Settings (System Configuration)
```prisma
model Settings {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   @db.Text
  description String?
  updatedAt   DateTime @updatedAt
}
```

**Default Settings**:
- `DEFAULT_LOAN_PERIOD_DAYS`: 14
- `MAX_RENEWALS`: 2
- `FINE_PER_DAY`: 5.00
- `MAX_BORROWING_LIMIT_STUDENT`: 3
- `RESERVATION_EXPIRY_HOURS`: 24

### Other Models
- `Category` (with parent-child hierarchy)
- `BookCategory` (many-to-many junction)
- `Reservation` (book reservation queue)
- `BookHistory` (audit trail for books)
- `AuditLog` (system-wide activity tracking)

**Full schema**: See `/twa-elibrary-documentation/DATABASE_SCHEMA.md`

---

## 🏗️ Project Structure

```
twa-elibrary/
├── app/
│   ├── (auth)/                     # Auth routes (login, register)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                # Protected dashboard routes
│   │   ├── layout.tsx              # Sidebar + Header layout
│   │   ├── staff/                  # Staff-only routes
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── books/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── students/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── pre-register/page.tsx
│   │   │   │   └── import/page.tsx
│   │   │   ├── transactions/
│   │   │   ├── fines/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── student/                # Student routes
│   │       ├── dashboard/page.tsx
│   │       ├── books/
│   │       ├── my-books/
│   │       ├── history/
│   │       ├── scan/page.tsx
│   │       └── profile/
│   │
│   ├── api/                        # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   ├── books/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── barcode/[barcode]/route.ts
│   │   ├── transactions/
│   │   │   ├── borrow/route.ts
│   │   │   ├── return/route.ts
│   │   │   └── [id]/renew/route.ts
│   │   ├── users/
│   │   │   ├── pre-register/route.ts
│   │   │   └── import-csv/route.ts
│   │   ├── categories/route.ts
│   │   ├── fines/
│   │   ├── settings/
│   │   ├── dashboard/stats/route.ts
│   │   └── barcode/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
│
├── components/
│   ├── ui/                         # Shadcn UI components
│   ├── layout/                     # Header, Sidebar, Footer
│   ├── auth/                       # LoginForm, RegisterForm
│   ├── books/                      # BookCard, BookList, BookForm
│   ├── transactions/               # Transaction components
│   ├── students/                   # StudentTable, StudentForm, CSVUploader
│   ├── scanner/                    # BarcodeScanner, BarcodeScannerModal
│   ├── dashboard/                  # StatsCard, RecentActivity
│   └── common/                     # LoadingSpinner, Pagination, DataTable
│
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # JWT utilities, middleware
│   ├── utils.ts                    # cn(), formatters
│   ├── validation.ts               # Zod schemas
│   ├── constants.ts                # App constants
│   ├── barcode.ts                  # Barcode generation
│   └── api.ts                      # Axios instance
│
├── hooks/
│   ├── useAuth.ts
│   ├── useBooks.ts
│   ├── useTransactions.ts
│   ├── useUsers.ts
│   └── useScanner.ts
│
├── store/
│   ├── authStore.ts                # Zustand: auth state
│   ├── bookStore.ts
│   ├── uiStore.ts                  # Sidebar, modals
│   └── scannerStore.ts
│
├── types/
│   ├── index.ts
│   ├── models.ts
│   └── api.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── middleware.ts                   # Next.js auth middleware
```

---

## ✨ Code Standards & Best Practices

### 1. TypeScript - Strict Mode Always

**✅ DO:**
```typescript
interface BookFormData {
  title: string
  author: string
  isbn?: string
  categoryIds: string[]
}

function createBook(data: BookFormData): Promise<Book> {
  return prisma.book.create({ data })
}

// Use Prisma-generated types
import type { Book, User, Transaction } from '@prisma/client'

// Type guards
function isStaff(user: User): boolean {
  return user.role === 'STAFF'
}
```

**❌ DON'T:**
```typescript
const data: any = {...}  // NEVER use 'any'
function createBook(data) { ... }  // Missing types
```

### 2. Next.js App Router Patterns

#### Server Components (Default)
```typescript
// app/(dashboard)/staff/books/page.tsx
import { prisma } from '@/lib/prisma'

export default async function BooksPage() {
  // Fetch directly in Server Component
  const books = await prisma.book.findMany({
    include: { categories: true },
    orderBy: { title: 'asc' }
  })
  
  return (
    <div>
      <h1>Books</h1>
      <BookList books={books} />
    </div>
  )
}
```

#### Client Components (When Needed)
```typescript
// components/scanner/BarcodeScanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const [error, setError] = useState<string>()
  // Browser API usage requires 'use client'
  
  return <video ref={videoRef} />
}
```

**Use 'use client' when you need**:
- useState, useEffect, other React hooks
- Browser APIs (camera, localStorage, etc.)
- Event handlers (onClick, onChange)
- Context providers

### 3. API Route Standards

**Template for all API routes**:
```typescript
// app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { bookSchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    // 2. Build where clause
    const where = search ? {
      OR: [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } }
      ]
    } : {}
    
    // 3. Fetch with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { categories: true }
      }),
      prisma.book.count({ where })
    ])
    
    // 4. Return consistent format
    return NextResponse.json({
      success: true,
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('[API] GET /api/books - Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR',
          message: 'Failed to fetch books' 
        } 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const user = await verifyAuth(request)
    if (!user || user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Staff access required' } },
        { status: 403 }
      )
    }
    
    // 2. Parse and validate body
    const body = await request.json()
    const validated = bookSchema.parse(body)
    
    // 3. Business logic - generate barcode if not provided
    const barcode = validated.barcode || await generateUniqueBarcode()
    
    // 4. Database operation
    const book = await prisma.book.create({
      data: {
        ...validated,
        barcode,
        availableQuantity: validated.quantity
      },
      include: { categories: true }
    })
    
    // 5. Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_BOOK',
        entityType: 'BOOK',
        entityId: book.id,
        description: `Created book: ${book.title}`
      }
    })
    
    // 6. Return success
    return NextResponse.json({
      success: true,
      data: { book, generatedBarcode: !validated.barcode ? barcode : undefined }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_BARCODE', message: 'Barcode already exists' } },
          { status: 409 }
        )
      }
    }
    
    console.error('[API] POST /api/books - Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create book' } },
      { status: 500 }
    )
  }
}
```

**Consistent Response Format**:
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details?: any  // Optional, e.g., validation errors
  }
}
```

**Standard Error Codes**:
- `AUTH_REQUIRED` - No token provided
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `BOOK_NOT_AVAILABLE` - Book unavailable
- `BORROWING_LIMIT_EXCEEDED` - Limit reached
- `OVERDUE_BOOKS` - User has overdue books
- `UNPAID_FINES` - Outstanding fines
- `DUPLICATE_BARCODE` - Barcode already exists

### 4. Database Operations with Prisma

#### Use Transactions for Multi-Step Operations
```typescript
// ✅ Good: Using transaction
async function borrowBook(bookId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Decrement available quantity
    const book = await tx.book.update({
      where: { id: bookId },
      data: { availableQuantity: { decrement: 1 } }
    })
    
    // 2. Update status if all copies borrowed
    if (book.availableQuantity === 0) {
      await tx.book.update({
        where: { id: bookId },
        data: { status: 'BORROWED' }
      })
    }
    
    // 3. Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        bookId,
        userId,
        status: 'ACTIVE',
        dueDate: addDays(new Date(), 14)
      }
    })
    
    return transaction
  })
}
```

#### Select Only Needed Fields
```typescript
// ✅ Good: Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true
    // Don't include password!
  }
})

// ❌ Bad: Fetching everything including password
const users = await prisma.user.findMany()
```

#### Proper Includes
```typescript
// ✅ Good: Include related data efficiently
const transaction = await prisma.transaction.findUnique({
  where: { id },
  include: {
    book: {
      select: {
        title: true,
        author: true,
        barcode: true
        // Only needed fields
      }
    },
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    }
  }
})
```

### 5. Form Handling with react-hook-form + Zod

**Complete form pattern**:
```typescript
// lib/validation.ts
import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  isbn: z.string().regex(/^(?:\d{10}|\d{13})$/, 'Invalid ISBN').optional().or(z.literal('')),
  publisher: z.string().optional(),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  location: z.string().optional()
})

export type BookFormData = z.infer<typeof bookSchema>
```

```typescript
// components/books/BookForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookSchema, type BookFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/useToast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function BookForm() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      categoryIds: [],
      quantity: 1
    }
  })
  
  const createBook = useMutation({
    mutationFn: async (data: BookFormData) => {
      const res = await axios.post('/api/books', data)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast({
        title: 'Success',
        description: 'Book created successfully'
      })
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to create book',
        variant: 'destructive'
      })
    }
  })
  
  const onSubmit = (data: BookFormData) => {
    createBook.mutate(data)
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <Input {...field} placeholder="Enter book title" />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <Input {...field} placeholder="Enter author name" />
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* More fields... */}
        
        <Button type="submit" disabled={createBook.isPending}>
          {createBook.isPending ? 'Creating...' : 'Create Book'}
        </Button>
      </form>
    </Form>
  )
}
```

### 6. State Management

#### Zustand for Global State
```typescript
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@prisma/client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false })
    }),
    {
      name: 'auth-storage'
    }
  )
)
```

#### TanStack Query for Server State
```typescript
// hooks/useBooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/api'

export function useBooks(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const res = await axios.get('/api/books', { params })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async () => {
      const res = await axios.get(`/api/books/${id}`)
      return res.data.data
    },
    enabled: !!id
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BookFormData) => {
      const res = await axios.post('/api/books', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

export function useBorrowBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { bookId: string; userId: string }) => {
      const res = await axios.post('/api/transactions/borrow', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
```

### 7. Component Patterns

#### Base Component Template
```typescript
// components/books/BookCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Book } from '@prisma/client'
import Image from 'next/image'

interface BookCardProps {
  book: Book
  onAction?: (book: Book) => void
  actionLabel?: string
  showActions?: boolean
}

export function BookCard({ 
  book, 
  onAction, 
  actionLabel = 'View Details',
  showActions = true 
}: BookCardProps) {
  const isAvailable = book.status === 'AVAILABLE' && book.availableQuantity > 0
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        {book.coverImage && (
          <Image
            src={book.coverImage}
            alt={book.title}
            width={200}
            height={300}
            className="rounded-md object-cover mb-4"
          />
        )}
        <CardTitle className="line-clamp-2">{book.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2">
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {book.status}
          </Badge>
          <p className="text-sm">
            Available: {book.availableQuantity}/{book.quantity}
          </p>
          {book.location && (
            <p className="text-xs text-muted-foreground">
              Location: {book.location}
            </p>
          )}
        </div>
      </CardContent>
      
      {showActions && onAction && (
        <CardFooter>
          <Button 
            onClick={() => onAction(book)} 
            className="w-full"
            disabled={!isAvailable && actionLabel === 'Borrow'}
          >
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

### 8. Authentication & Authorization

#### Middleware for Route Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/staff') ||
      request.nextUrl.pathname.startsWith('/student')) {
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const user = await verifyToken(token)
      
      // Check role-based access
      if (request.nextUrl.pathname.startsWith('/staff') && user.role !== 'STAFF') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
      
      if (request.nextUrl.pathname.startsWith('/student') && user.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url))
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/staff/:path*', '/student/:path*']
}
```

#### Auth Utilities
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    throw new Error('No token provided')
  }
  
  const decoded = verifyToken(token)
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })
  
  if (!user || user.status !== 'ACTIVE') {
    throw new Error('User not found or inactive')
  }
  
  return user
}
```

---

## 📱 Barcode Implementation

### Generate Barcode
```typescript
// lib/barcode.ts
import bwipjs from 'bwip-js'

export async function generateBarcodeImage(text: string): Promise<string> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: text,             // Text to encode
      scale: 3,               // 3x scaling factor
      height: 10,             // Bar height, in millimeters
      includetext: true,      // Show human-readable text
      textxalign: 'center',   // Center text
    })
    
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (error) {
    console.error('Barcode generation error:', error)
    throw new Error('Failed to generate barcode')
  }
}

export async function generateUniqueBarcode(): Promise<string> {
  const year = new Date().getFullYear()
  
  // Find the highest sequence number for this year
  const lastBook = await prisma.book.findFirst({
    where: {
      barcode: {
        startsWith: `LIB-${year}-`
      }
    },
    orderBy: {
      barcode: 'desc'
    }
  })
  
  let sequence = 1
  if (lastBook) {
    const match = lastBook.barcode.match(/LIB-\d{4}-(\d+)/)
    if (match) {
      sequence = parseInt(match[1]) + 1
    }
  }
  
  return `LIB-${year}-${sequence.toString().padStart(5, '0')}`
}
```

### Scan Barcode
```typescript
// components/scanner/BarcodeScanner.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>()
  const codeReaderRef = useRef<BrowserMultiFormatReader>()
  
  const startScanning = async () => {
    try {
      setError(undefined)
      setIsScanning(true)
      
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader
      
      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText()
            onScan(code)
            stopScanning()
          }
          
          if (err && !(err instanceof NotFoundException)) {
            const errorMessage = 'Scanning error. Please try again.'
            setError(errorMessage)
            onError?.(errorMessage)
          }
        }
      )
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to access camera'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsScanning(false)
    }
  }
  
  const stopScanning = () => {
    codeReaderRef.current?.reset()
    setIsScanning(false)
  }
  
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button
        onClick={isScanning ? stopScanning : startScanning}
        variant={isScanning ? 'destructive' : 'default'}
        className="w-full"
      >
        {isScanning ? (
          <>
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Scanning
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </>
        )}
      </Button>
    </div>
  )
}
```

---

## 🎨 UI/UX Guidelines

### Responsive Design
- **Mobile-first approach**: Design for mobile, then scale up
- **Tailwind breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Test on all screen sizes

### Accessibility
- **ARIA labels**: All interactive elements
- **Keyboard navigation**: Focus states, tab order
- **Color contrast**: WCAG 2.1 AA minimum
- **Screen reader**: Semantic HTML

### Loading States
```typescript
// Always show loading feedback
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
) : (
  <DataTable data={data} />
)}
```

### Error States
```typescript
// Clear error messages
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error.message || 'An unexpected error occurred'}
    </AlertDescription>
  </Alert>
)}
```

### Empty States
```typescript
// Helpful empty states
{books.length === 0 && (
  <div className="text-center py-12">
    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No books found</h3>
    <p className="text-sm text-muted-foreground">
      Add your first book to get started
    </p>
    <Button className="mt-4" onClick={() => router.push('/staff/books/new')}>
      Add Book
    </Button>
  </div>
)}
```

---

## 🔒 Security Best Practices

1. **Never expose sensitive data**:
   - Don't return passwords in API responses
   - Sanitize error messages (no stack traces in production)

2. **Input validation**:
   - Validate on client AND server
   - Use Zod schemas
   - Sanitize HTML inputs

3. **Authentication**:
   - Store tokens in httpOnly cookies
   - Implement token refresh
   - Check permissions on every API call

4. **SQL injection prevention**:
   - Prisma handles this automatically
   - Never use raw SQL with user input

5. **Rate limiting** (future):
   - Implement rate limiting on API routes
   - Prevent brute force attacks

---

## 📊 Performance Optimization

1. **Database queries**:
   - Use indexes (defined in schema)
   - Limit selected fields
   - Paginate large results
   - Use database aggregations

2. **React optimization**:
   - Use React.memo for expensive components
   - Implement virtualization for long lists (react-virtual)
   - Lazy load images

3. **Next.js optimization**:
   - Use Image component for automatic optimization
   - Implement proper caching headers
   - Use Server Components when possible

4. **TanStack Query**:
   - Set appropriate staleTime
   - Use query invalidation strategically
   - Implement optimistic updates

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Book Management**:
- [ ] Add book with generated barcode
- [ ] Add book by scanning existing barcode
- [ ] Edit book details
- [ ] Delete book (ensure no active transactions)
- [ ] Search and filter books
- [ ] Update book status

**Borrowing Flow**:
- [ ] Successful borrow (all checks pass)
- [ ] Borrowing limit exceeded
- [ ] Book unavailable
- [ ] Student has overdue books
- [ ] Student has unpaid fines
- [ ] Return on time (no fine)
- [ ] Return overdue (fine calculated correctly)
- [ ] Renew book (eligible)
- [ ] Renew book (max renewals reached)

**Student Management**:
- [ ] Pre-register single student
- [ ] Import students via CSV
- [ ] Activate/Suspend/Deactivate account
- [ ] View borrowing history
- [ ] Adjust borrowing limit

**Authentication**:
- [ ] Staff login
- [ ] Student login
- [ ] Logout
- [ ] Session persistence
- [ ] Role-based access control

---

## 🚀 Deployment Checklist

### Vercel Deployment
1. [ ] Environment variables set
2. [ ] Database connection tested
3. [ ] Build successful
4. [ ] No build errors or warnings
5. [ ] API routes working
6. [ ] Authentication working
7. [ ] Images loading correctly

### Database (TiDB Cloud)
1. [ ] Migrations applied
2. [ ] Seed data loaded
3. [ ] Indexes created
4. [ ] Backups configured
5. [ ] Connection string secure

---

## 📖 Quick Reference

### Common Imports
```typescript
// Next.js
import { NextRequest, NextResponse } from 'next/server'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// React
import { useState, useEffect, useCallback } from 'react'

// Prisma
import { prisma } from '@/lib/prisma'
import type { Book, User, Transaction } from '@prisma/client'

// Forms
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/api'

// UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/useToast'

// Icons
import { Search, Plus, Edit, Trash, Camera, Book } from 'lucide-react'

// Utils
import { cn } from '@/lib/utils'
import { addDays, format, differenceInDays } from 'date-fns'
```

### Environment Variables
```env
# Database
DATABASE_URL="mysql://..."

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Useful Commands
```bash
# Prisma
npx prisma generate
npx prisma migrate dev --name <name>
npx prisma studio
npx prisma db seed

# Development
npm run dev
npm run build
npm run start

# Shadcn
npx shadcn-ui@latest add [component]
```

---

## 📚 Documentation Reference

For detailed information, see:
- `/twa-elibrary-documentation/PROJECT_OVERVIEW.md` - System overview
- `/twa-elibrary-documentation/DATABASE_SCHEMA.md` - Complete schema
- `/twa-elibrary-documentation/API_SPECIFICATION.md` - All endpoints
- `/twa-elibrary-documentation/FOLDER_STRUCTURE.md` - Project structure
- `/twa-elibrary-documentation/FEATURES_SPECIFICATION.md` - Feature requirements
- `/twa-elibrary-documentation/DEVELOPMENT_GUIDE.md` - Developer guide

---

## 🎯 Development Philosophy

**Write code that**:
1. ✅ Is **type-safe** (strict TypeScript)
2. ✅ Is **maintainable** (clear, well-structured)
3. ✅ Is **secure** (validated, authorized, sanitized)
4. ✅ Is **performant** (optimized queries, efficient rendering)
5. ✅ Is **accessible** (WCAG 2.1 AA)
6. ✅ Is **responsive** (mobile-first)
7. ✅ Is **well-documented** (clear comments, JSDoc)
8. ✅ Follows **best practices** (these guidelines)

**Remember**: We're building a production system that real users will depend on. Quality matters!

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
