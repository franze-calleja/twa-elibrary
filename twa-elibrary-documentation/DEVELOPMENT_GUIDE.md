# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MySQL database (or TiDB Cloud account)
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and Install**
```bash
cd twa-elibrary
npm install
```

2. **Environment Setup**
Create `.env` file in root:
```env
# Database
DATABASE_URL="mysql://username:password@host:port/database_name"

# Example for TiDB Cloud:
# DATABASE_URL="mysql://user.root:password@gateway01.region.prod.aws.tidbcloud.com:4000/elibrary?sslaccept=strict"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="TWA E-Library"

# Email (Optional, for future notifications)
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASSWORD=""
```

3. **Database Setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed
```

4. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Development Workflow

### 1. Feature Development

#### Step-by-Step Process:
1. **Create feature branch**
   ```bash
   git checkout -b feature/book-borrowing
   ```

2. **Define types** (`types/models.ts`)
   ```typescript
   export interface BorrowBookRequest {
     bookId: string
     userId: string
     barcode?: string
   }
   ```

3. **Create API route** (`app/api/transactions/borrow/route.ts`)
   ```typescript
   export async function POST(request: NextRequest) {
     // Implementation
   }
   ```

4. **Add validation schema** (`lib/validation.ts`)
   ```typescript
   export const borrowBookSchema = z.object({
     bookId: z.string().uuid(),
     userId: z.string().uuid(),
   })
   ```

5. **Create data hook** (`hooks/useTransactions.ts`)
   ```typescript
   export function useBorrowBook() {
     return useMutation({...})
   }
   ```

6. **Build UI components** (`components/transactions/BorrowForm.tsx`)
   ```typescript
   export function BorrowForm() {
     // Component implementation
   }
   ```

7. **Add to page** (`app/(dashboard)/staff/transactions/borrow/page.tsx`)

8. **Test thoroughly**
   - Happy path
   - Error cases
   - Edge cases

9. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: implement book borrowing feature"
   git push origin feature/book-borrowing
   ```

### 2. Database Changes

When modifying the database schema:

1. **Edit Prisma Schema** (`prisma/schema.prisma`)
   ```prisma
   model Book {
     // Add new field
     condition String @default("GOOD")
   }
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_book_condition
   ```

3. **Update Types**
   ```bash
   npx prisma generate
   ```

4. **Update Seed** (if needed) (`prisma/seed.ts`)

### 3. Adding New Dependencies

```bash
# Add dependency
npm install <package-name>

# Add dev dependency
npm install -D <package-name>

# Update dependencies
npm update
```

---

## Project Structure Walkthrough

### App Router Structure
```
app/
  (auth)/          → Public auth pages
  (dashboard)/     → Protected dashboard pages
  api/             → API endpoints
```

### Component Organization
```
components/
  ui/              → Base Shadcn components
  feature/         → Feature-specific components
  layout/          → Layout components
  common/          → Shared utilities
```

### State Management
- **Zustand**: Global state (auth, UI)
- **TanStack Query**: Server state
- **React State**: Local component state

---

## Common Tasks

### Adding a New Page

1. **Create page file**
   ```typescript
   // app/(dashboard)/staff/reports/page.tsx
   export default function ReportsPage() {
     return <div>Reports</div>
   }
   ```

2. **Add to navigation** (`components/layout/Sidebar.tsx`)

3. **Create required components**

### Adding a New API Endpoint

1. **Create route file**
   ```typescript
   // app/api/books/search/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function GET(request: NextRequest) {
     const { searchParams } = new URL(request.url)
     const query = searchParams.get('q')
     
     // Implementation
     
     return NextResponse.json({ success: true, data })
   }
   ```

2. **Add validation** (`lib/validation.ts`)

3. **Create hook** (`hooks/useBooks.ts`)
   ```typescript
   export function useBookSearch(query: string) {
     return useQuery({
       queryKey: ['books', 'search', query],
       queryFn: () => api.get(`/api/books/search?q=${query}`)
     })
   }
   ```

### Adding Shadcn UI Component

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

### Creating a Zustand Store

```typescript
// store/settingsStore.ts
import { create } from 'zustand'

interface SettingsState {
  loanPeriod: number
  setLoanPeriod: (days: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  loanPeriod: 14,
  setLoanPeriod: (days) => set({ loanPeriod: days })
}))
```

---

## Barcode Implementation

### Generating Barcodes

```typescript
// lib/barcode.ts
import bwipjs from 'bwip-js'

export async function generateBarcode(text: string): Promise<string> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
    })
    
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (error) {
    throw new Error('Failed to generate barcode')
  }
}
```

### Scanning Barcodes

```typescript
// components/scanner/BarcodeScanner.tsx
'use client'

import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string>()
  
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    
    codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
      if (result) {
        onScan(result.getText())
      }
      if (err && !(err instanceof NotFoundException)) {
        setError(err.message)
      }
    })
    
    return () => {
      codeReader.reset()
    }
  }, [onScan])
  
  return (
    <div>
      <video ref={videoRef} className="w-full" />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

---

## Database Management

### Viewing Data
```bash
# Open Prisma Studio
npx prisma studio
```

### Resetting Database
```bash
# ⚠️ WARNING: This deletes all data
npx prisma migrate reset
```

### Creating Seed Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create staff user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@library.edu',
      password: hashedPassword,
      role: 'STAFF',
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE'
    }
  })
  
  // Create categories
  await prisma.category.createMany({
    data: [
      { name: 'Computer Science', description: 'CS books' },
      { name: 'Mathematics', description: 'Math books' },
      { name: 'Physics', description: 'Physics books' },
    ]
  })
  
  // Create settings
  await prisma.settings.createMany({
    data: [
      { key: 'DEFAULT_LOAN_PERIOD_DAYS', value: '14' },
      { key: 'MAX_RENEWALS', value: '2' },
      { key: 'FINE_PER_DAY', value: '5.00' }
    ]
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
npx prisma db seed
```

---

## Testing

### Manual Testing Checklist

#### Books Management
- [ ] Add new book with generated barcode
- [ ] Add book by scanning existing barcode
- [ ] Edit book details
- [ ] Delete book
- [ ] Search and filter books
- [ ] View book history

#### Borrowing Flow
- [ ] Scan barcode to borrow
- [ ] Check borrowing limit
- [ ] Return book on time
- [ ] Return overdue book (fine calculation)
- [ ] Renew book
- [ ] Reserve borrowed book

#### Student Management
- [ ] Pre-register single student
- [ ] Import students via CSV
- [ ] View student details
- [ ] View student borrowing history
- [ ] Deactivate student account

#### Authentication
- [ ] Staff login
- [ ] Student login
- [ ] Password change
- [ ] Logout
- [ ] Session persistence

---

## Debugging Tips

### Common Issues

1. **Prisma Client not generated**
   ```bash
   npx prisma generate
   ```

2. **Database connection error**
   - Check DATABASE_URL in `.env`
   - Verify database is running
   - Test connection with Prisma Studio

3. **Module not found**
   ```bash
   npm install
   rm -rf .next
   npm run dev
   ```

4. **Type errors after schema change**
   ```bash
   npx prisma generate
   # Restart TypeScript server in VS Code
   ```

### Logging

```typescript
// Add logging to debug
console.log('[DEBUG] User:', user)
console.error('[ERROR] Failed to create book:', error)

// Use in API routes
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/books - Request received')
  try {
    // ...
  } catch (error) {
    console.error('[API] POST /api/books - Error:', error)
  }
}
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Configure project

3. **Set Environment Variables**
   - Add all `.env` variables in Vercel dashboard
   - Use TiDB Cloud DATABASE_URL

4. **Deploy**
   - Vercel auto-deploys on push to main
   - Manual deploy from Vercel dashboard

### Database Migration on Production

```bash
# Run migrations on production database
npx prisma migrate deploy
```

---

## Best Practices

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Git Commits
```bash
# Good commit messages
git commit -m "feat: add book borrowing feature"
git commit -m "fix: resolve barcode scanning error"
git commit -m "refactor: improve transaction query performance"
git commit -m "docs: update API documentation"
```

### Performance
- Use React.memo for heavy components
- Implement pagination for large lists
- Use database indexes
- Optimize images
- Leverage Next.js caching

### Security
- Never commit `.env` file
- Validate all user input
- Use parameterized queries (Prisma)
- Implement rate limiting
- Use HTTPS in production
- Hash passwords with bcrypt

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## Getting Help

1. Check documentation files in `twa-elibrary-documentation/`
2. Review similar implementations in codebase
3. Search GitHub issues
4. Ask team members
5. Consult official documentation

Happy coding! 🚀
