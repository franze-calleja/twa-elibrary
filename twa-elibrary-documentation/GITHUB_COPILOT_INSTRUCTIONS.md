# GitHub Copilot Instructions for TWA E-Library System

## Project Context
You are helping build a university e-library management system with two user roles (Staff and Students) for managing books, borrowing, and student accounts through barcode scanning technology.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: MySQL via Prisma ORM (TiDB Cloud)
- **UI**: Shadcn UI + Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query + Axios
- **Hosting**: Vercel (free tier)

---

## Core Development Principles

### 1. TypeScript Standards
- **Always use strict TypeScript** with proper type definitions
- **Never use `any`** - use `unknown` or proper types
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Leverage Prisma generated types

```typescript
// ✅ Good
interface BookFormData {
  title: string
  author: string
  isbn?: string
}

// ❌ Bad
const data: any = {...}
```

### 2. Next.js App Router Patterns
- Use Server Components by default
- Add `'use client'` only when needed (state, effects, browser APIs)
- Implement proper loading and error states
- Use Server Actions for mutations when appropriate
- Leverage route handlers for API endpoints

```typescript
// ✅ Server Component (default)
export default async function BooksPage() {
  const books = await prisma.book.findMany()
  return <BookList books={books} />
}

// ✅ Client Component (when needed)
'use client'
export function BookScanner() {
  const [scanning, setScanning] = useState(false)
  // ... uses browser APIs
}
```

### 3. API Route Structure
- Use consistent response format
- Implement proper error handling
- Validate input with Zod
- Use middleware for authentication
- Return appropriate HTTP status codes

```typescript
// ✅ Standard API response format
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await fetchData()
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'ERROR_CODE',
          message: error.message 
        } 
      },
      { status: 500 }
    )
  }
}
```

### 4. Database Operations with Prisma
- Always use Prisma Client for database access
- Use transactions for multi-step operations
- Implement proper error handling
- Use select to limit returned fields
- Include related data with include/select

```typescript
// ✅ Prisma best practices
const transaction = await prisma.transaction.create({
  data: {
    bookId,
    userId,
    dueDate: addDays(new Date(), 14),
    status: 'ACTIVE'
  },
  include: {
    book: {
      select: {
        title: true,
        author: true,
        barcode: true
      }
    },
    user: {
      select: {
        firstName: true,
        lastName: true
      }
    }
  }
})

// ✅ Use transactions for multiple operations
await prisma.$transaction(async (tx) => {
  await tx.book.update({
    where: { id: bookId },
    data: { availableQuantity: { decrement: 1 } }
  })
  
  await tx.transaction.create({
    data: { bookId, userId, status: 'ACTIVE' }
  })
})
```

### 5. Form Handling
- Use react-hook-form with Zod validation
- Implement proper error messages
- Show loading states during submission
- Handle success/error with toast notifications
- Reset form after successful submission

```typescript
// ✅ Form with validation
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional()
})

type BookFormData = z.infer<typeof bookSchema>

export function BookForm() {
  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema)
  })
  
  const onSubmit = async (data: BookFormData) => {
    // Handle submission
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### 6. State Management with Zustand
- Create focused stores for specific domains
- Use immer middleware for complex updates
- Implement selectors for derived state
- Keep stores simple and focused

```typescript
// ✅ Zustand store pattern
import { create } from 'zustand'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}))
```

### 7. Data Fetching with TanStack Query
- Use Query for GET operations
- Use Mutation for POST/PUT/DELETE
- Implement proper cache invalidation
- Show loading and error states
- Leverage optimistic updates when appropriate

```typescript
// ✅ TanStack Query pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await axios.get('/api/books')
      return res.data.data
    }
  })
}

export function useBorrowBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BorrowData) => {
      const res = await axios.post('/api/transactions/borrow', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}
```

### 8. Component Patterns
- Create small, focused components
- Use composition over inheritance
- Implement proper prop types
- Use Shadcn UI components as base
- Follow accessibility best practices

```typescript
// ✅ Component pattern
interface BookCardProps {
  book: Book
  onBorrow?: (bookId: string) => void
  showActions?: boolean
}

export function BookCard({ book, onBorrow, showActions = true }: BookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{book.title}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={book.status === 'AVAILABLE' ? 'success' : 'secondary'}>
          {book.status}
        </Badge>
      </CardContent>
      {showActions && (
        <CardFooter>
          <Button onClick={() => onBorrow?.(book.id)}>Borrow</Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

### 9. Authentication & Authorization
- Use middleware for route protection
- Implement JWT token-based auth
- Store token in httpOnly cookies or secure storage
- Check user role for protected actions
- Refresh tokens before expiry

```typescript
// ✅ Middleware for auth
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/staff/:path*', '/student/:path*']
}
```

### 10. Barcode Implementation
- Use CODE128 format for generated barcodes
- Implement camera-based scanning with ZXing
- Handle scan errors gracefully
- Validate barcode format before processing
- Support both manual entry and scanning

```typescript
// ✅ Barcode scanner component
'use client'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef } from 'react'

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      (result, error) => {
        if (result) {
          onScan(result.getText())
        }
      }
    )
    
    return () => codeReader.reset()
  }, [onScan])
  
  return <video ref={videoRef} />
}
```

---

## Code Generation Guidelines

### When Creating Components:
1. Import from correct paths (`@/components/ui/...`)
2. Use TypeScript interfaces for props
3. Implement loading and error states
4. Add proper ARIA labels for accessibility
5. Use Tailwind CSS for styling
6. Follow mobile-first responsive design

### When Creating API Routes:
1. Validate input with Zod schemas
2. Check authentication and authorization
3. Use Prisma for database operations
4. Return consistent response format
5. Handle errors with try-catch
6. Log important actions to AuditLog

### When Working with Forms:
1. Use react-hook-form + Zod
2. Implement field-level validation
3. Show inline error messages
4. Disable submit during loading
5. Show success/error toast
6. Reset form or redirect after success

### When Implementing Features:
1. Start with types/interfaces
2. Create API route handler
3. Build data fetching hook (TanStack Query)
4. Create UI components
5. Add to appropriate page
6. Test common scenarios

---

## File Creation Patterns

### New Page:
```typescript
// app/(dashboard)/staff/books/page.tsx
import { Suspense } from 'react'
import { BookList } from '@/components/books/BookList'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function BooksPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Books Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <BookList />
      </Suspense>
    </div>
  )
}
```

### New API Route:
```typescript
// app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookSchema } from '@/lib/validation'
import { authMiddleware } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const books = await prisma.book.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { categories: true }
    })
    
    const total = await prisma.book.count()
    
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
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch books' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request)
    if (user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN' } },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validated = bookSchema.parse(body)
    
    const book = await prisma.book.create({
      data: validated
    })
    
    return NextResponse.json({ success: true, data: book })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    )
  }
}
```

### New Component:
```typescript
// components/books/BookCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Book } from '@prisma/client'

interface BookCardProps {
  book: Book
  onAction?: (book: Book) => void
  actionLabel?: string
}

export function BookCard({ book, onAction, actionLabel = 'View' }: BookCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2">{book.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <Badge variant={book.status === 'AVAILABLE' ? 'default' : 'secondary'}>
          {book.status}
        </Badge>
      </CardContent>
      {onAction && (
        <CardFooter>
          <Button onClick={() => onAction(book)} className="w-full">
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

---

## Common Patterns & Snippets

### Error Handling:
```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: 'Record already exists' } },
        { status: 409 }
      )
    }
  }
  throw error
}
```

### Pagination:
```typescript
const page = parseInt(params.page || '1')
const limit = parseInt(params.limit || '10')
const skip = (page - 1) * limit

const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count()
])

return {
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
}
```

### Date Calculations:
```typescript
import { addDays, isPast, differenceInDays } from 'date-fns'

const dueDate = addDays(new Date(), 14) // 14 days loan period
const isOverdue = isPast(dueDate)
const daysOverdue = differenceInDays(new Date(), dueDate)
```

---

## Testing Considerations
- Write unit tests for utility functions
- Test API routes with proper auth scenarios
- Test form validation edge cases
- Mock Prisma in tests
- Test barcode scanning fallbacks

## Performance Optimization
- Use React.memo for expensive renders
- Implement virtualization for long lists
- Optimize images with Next.js Image
- Use suspense boundaries strategically
- Implement proper caching with TanStack Query

## Security Best Practices
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting on API routes
- Sanitize data before display
- Use HTTPS in production
- Store secrets in environment variables
- Implement CSRF protection

---

## Quick Reference Commands

```bash
# Database
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma studio
npx prisma db push

# Development
npm run dev
npm run build
npm run start

# Linting
npm run lint
npm run lint:fix
```

## Environment Variables Template
```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Remember:
- **Prioritize user experience** - smooth, responsive, intuitive
- **Write clean, maintainable code** - future developers will thank you
- **Follow TypeScript strictly** - catch errors early
- **Test edge cases** - barcode scanning, network failures, concurrent operations
- **Document complex logic** - especially business rules around borrowing/fines
- **Keep security in mind** - validate, sanitize, authorize
- **Optimize for performance** - this is a real-time system with scanning

When in doubt, refer to:
1. Official Next.js documentation
2. Prisma documentation
3. Shadcn UI components
4. This instruction file

**Goal**: Build a robust, user-friendly e-library system that university staff and students love to use!
