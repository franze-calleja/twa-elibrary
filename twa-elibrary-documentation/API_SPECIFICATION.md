# API Specification

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-app.vercel.app/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## API Structure

### Authentication Endpoints

#### POST /api/auth/login
Login user (staff or student)
```typescript
Request:
{
  email: string
  password: string
}

Response:
{
  success: boolean
  data: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: 'STAFF' | 'STUDENT'
      status: string
    }
    token: string
    expiresIn: number
  }
}
```

#### POST /api/auth/register
Register new student account (requires pre-registration)
```typescript
Request:
{
  email: string
  password: string
  confirmPassword: string
  studentId: string
  activationCode: string
}

Response:
{
  success: boolean
  message: string
}
```

#### POST /api/auth/logout
Invalidate session

#### GET /api/auth/me
Get current user profile

---

### Book Management Endpoints

#### GET /api/books
Get all books with filtering and pagination
```typescript
Query Parameters:
{
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: BookStatus
  sortBy?: 'title' | 'author' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

Response:
{
  success: boolean
  data: {
    books: Book[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}
```

#### GET /api/books/:id
Get single book details

#### POST /api/books
Create new book (Staff only)
```typescript
Request:
{
  barcode?: string // If scanning existing
  isbn?: string
  title: string
  author: string
  publisher?: string
  publicationYear?: number
  edition?: string
  description?: string
  categoryIds: string[]
  quantity: number
  location?: string
  coverImage?: string
}

Response:
{
  success: boolean
  data: {
    book: Book
    generatedBarcode?: string // If new barcode generated
  }
}
```

#### PUT /api/books/:id
Update book details (Staff only)

#### DELETE /api/books/:id
Delete book (Staff only)

#### POST /api/books/:id/generate-barcode
Generate new barcode for existing book

#### GET /api/books/barcode/:barcode
Get book by barcode
```typescript
Response:
{
  success: boolean
  data: {
    book: Book
    availability: {
      isAvailable: boolean
      availableQuantity: number
      nextAvailableDate?: string
    }
  }
}
```

---

### Transaction Endpoints

#### POST /api/transactions/borrow
Borrow a book
```typescript
Request:
{
  bookId: string
  userId: string
  barcode?: string // Alternative to bookId
}

Response:
{
  success: boolean
  data: {
    transaction: Transaction
    dueDate: string
    receipt: {
      transactionId: string
      bookTitle: string
      borrowedAt: string
      dueDate: string
    }
  }
}
```

#### POST /api/transactions/return
Return a book
```typescript
Request:
{
  transactionId: string
  barcode?: string
  condition?: string
  notes?: string
}

Response:
{
  success: boolean
  data: {
    transaction: Transaction
    fine?: Fine
  }
}
```

#### POST /api/transactions/:id/renew
Renew a book loan
```typescript
Response:
{
  success: boolean
  data: {
    transaction: Transaction
    newDueDate: string
  }
}
```

#### GET /api/transactions
Get all transactions with filters
```typescript
Query Parameters:
{
  userId?: string
  bookId?: string
  status?: TransactionStatus
  page?: number
  limit?: number
}
```

#### GET /api/transactions/user/:userId
Get user's borrowing history

#### GET /api/transactions/overdue
Get all overdue transactions (Staff only)

---

### User Management Endpoints

#### GET /api/users
Get all users (Staff only)
```typescript
Query Parameters:
{
  role?: 'STAFF' | 'STUDENT'
  status?: UserStatus
  search?: string
  page?: number
  limit?: number
}
```

#### GET /api/users/:id
Get user details

#### POST /api/users
Create new user (Staff only)

#### PUT /api/users/:id
Update user details

#### DELETE /api/users/:id
Delete user (Staff only)

#### POST /api/users/pre-register
Pre-register students (Staff only)
```typescript
Request:
{
  students: Array<{
    email: string
    firstName: string
    lastName: string
    studentId: string
    program: string
    yearLevel: number
  }>
}

Response:
{
  success: boolean
  data: {
    created: number
    failed: number
    errors: string[]
  }
}
```

#### POST /api/users/import-csv
Bulk import students from CSV (Staff only)
```typescript
Request: FormData with CSV file

Response:
{
  success: boolean
  data: {
    imported: number
    failed: number
    errors: Array<{
      row: number
      error: string
    }>
  }
}
```

#### GET /api/users/:id/borrowing-history
Get complete borrowing history for user

---

### Category Endpoints

#### GET /api/categories
Get all categories

#### POST /api/categories
Create category (Staff only)

#### PUT /api/categories/:id
Update category (Staff only)

#### DELETE /api/categories/:id
Delete category (Staff only)

---

### Reservation Endpoints

#### POST /api/reservations
Reserve a book
```typescript
Request:
{
  bookId: string
  userId: string
}
```

#### GET /api/reservations/user/:userId
Get user's reservations

#### DELETE /api/reservations/:id
Cancel reservation

---

### Fine Endpoints

#### GET /api/fines/user/:userId
Get user's fines

#### POST /api/fines/:id/pay
Mark fine as paid (Staff only)

#### POST /api/fines/:id/waive
Waive fine (Staff only)

---

### Settings Endpoints

#### GET /api/settings
Get all settings (Staff only)

#### PUT /api/settings/:key
Update setting (Staff only)

---

### Dashboard & Analytics Endpoints

#### GET /api/dashboard/stats
Get dashboard statistics (Staff only)
```typescript
Response:
{
  success: boolean
  data: {
    totalBooks: number
    availableBooks: number
    borrowedBooks: number
    totalStudents: number
    activeLoans: number
    overdueLoans: number
    totalFines: number
    unpaidFines: number
    recentTransactions: Transaction[]
    popularBooks: Array<{
      book: Book
      borrowCount: number
    }>
  }
}
```

#### GET /api/reports/borrowing
Generate borrowing report (Staff only)
```typescript
Query Parameters:
{
  startDate: string
  endDate: string
  format?: 'json' | 'csv'
}
```

---

### Barcode Endpoints

#### POST /api/barcode/generate
Generate barcode image
```typescript
Request:
{
  code: string
  format?: 'CODE128' | 'CODE39' | 'EAN13'
  width?: number
  height?: number
}

Response:
{
  success: boolean
  data: {
    barcode: string // Base64 encoded image
    code: string
  }
}
```

#### POST /api/barcode/scan
Process scanned barcode
```typescript
Request:
{
  barcode: string
  action: 'lookup' | 'borrow' | 'return'
  userId?: string
}
```

---

## Error Responses

All endpoints follow consistent error format:
```typescript
{
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `BOOK_NOT_AVAILABLE` - Book not available for borrowing
- `BORROWING_LIMIT_EXCEEDED` - User exceeded borrowing limit
- `OVERDUE_BOOKS` - User has overdue books
- `UNPAID_FINES` - User has unpaid fines
- `ALREADY_BORROWED` - Book already borrowed by user
- `INVALID_BARCODE` - Invalid or unrecognized barcode

## Rate Limiting
- 100 requests per minute per IP for public endpoints
- 300 requests per minute for authenticated users
- 1000 requests per minute for staff users

## API Versioning
Currently using v1 (implicit). Future versions will use explicit versioning:
```
/api/v2/...
```
