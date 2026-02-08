# Project Folder Structure

## Complete Directory Layout

```
twa-elibrary/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Authentication routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # Auth layout (centered, no sidebar)
│   │
│   ├── (dashboard)/                       # Dashboard routes group (protected)
│   │   ├── layout.tsx                     # Dashboard layout (with sidebar, header)
│   │   │
│   │   ├── staff/                         # Staff-only routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx               # Staff dashboard analytics
│   │   │   ├── books/
│   │   │   │   ├── page.tsx               # Books list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx           # Book details
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx       # Edit book
│   │   │   │   └── new/
│   │   │   │       └── page.tsx           # Add new book
│   │   │   ├── students/
│   │   │   │   ├── page.tsx               # Students list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx           # Student details & history
│   │   │   │   ├── pre-register/
│   │   │   │   │   └── page.tsx           # Pre-register students
│   │   │   │   └── import/
│   │   │   │       └── page.tsx           # CSV import
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx               # All transactions
│   │   │   │   ├── borrow/
│   │   │   │   │   └── page.tsx           # Process borrowing
│   │   │   │   ├── return/
│   │   │   │   │   └── page.tsx           # Process returns
│   │   │   │   └── overdue/
│   │   │   │       └── page.tsx           # Overdue transactions
│   │   │   ├── fines/
│   │   │   │   └── page.tsx               # Manage fines
│   │   │   ├── reports/
│   │   │   │   └── page.tsx               # Generate reports
│   │   │   └── settings/
│   │   │       └── page.tsx               # System settings
│   │   │
│   │   └── student/                       # Student routes
│   │       ├── dashboard/
│   │       │   └── page.tsx               # Student dashboard
│   │       ├── books/
│   │       │   ├── page.tsx               # Browse books
│   │       │   └── [id]/
│   │       │       └── page.tsx           # Book details
│   │       ├── my-books/
│   │       │   └── page.tsx               # Currently borrowed books
│   │       ├── history/
│   │       │   └── page.tsx               # Borrowing history
│   │       ├── scan/
│   │       │   └── page.tsx               # Barcode scanner
│   │       └── profile/
│   │           └── page.tsx               # Account management
│   │
│   ├── api/                               # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── books/
│   │   │   ├── route.ts                   # GET, POST books
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts               # GET, PUT, DELETE single book
│   │   │   │   └── generate-barcode/
│   │   │   │       └── route.ts
│   │   │   └── barcode/
│   │   │       └── [barcode]/
│   │   │           └── route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts
│   │   │   ├── borrow/
│   │   │   │   └── route.ts
│   │   │   ├── return/
│   │   │   │   └── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── renew/
│   │   │   │       └── route.ts
│   │   │   ├── user/
│   │   │   │   └── [userId]/
│   │   │   │       └── route.ts
│   │   │   └── overdue/
│   │   │       └── route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── borrowing-history/
│   │   │   │       └── route.ts
│   │   │   ├── pre-register/
│   │   │   │   └── route.ts
│   │   │   └── import-csv/
│   │   │       └── route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── reservations/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── user/
│   │   │       └── [userId]/
│   │   │           └── route.ts
│   │   ├── fines/
│   │   │   ├── user/
│   │   │   │   └── [userId]/
│   │   │   │       └── route.ts
│   │   │   └── [id]/
│   │   │       ├── pay/
│   │   │       │   └── route.ts
│   │   │       └── waive/
│   │   │           └── route.ts
│   │   ├── settings/
│   │   │   ├── route.ts
│   │   │   └── [key]/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   ├── reports/
│   │   │   └── borrowing/
│   │   │       └── route.ts
│   │   └── barcode/
│   │       ├── generate/
│   │       │   └── route.ts
│   │       └── scan/
│   │           └── route.ts
│   │
│   ├── globals.css                        # Global styles
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Landing page
│
├── components/                            # React components
│   ├── ui/                                # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── tabs.tsx
│   │   ├── calendar.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── layout/                            # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── auth/                              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── books/                             # Book-related components
│   │   ├── BookCard.tsx
│   │   ├── BookList.tsx
│   │   ├── BookForm.tsx
│   │   ├── BookDetails.tsx
│   │   ├── BookSearch.tsx
│   │   ├── BookFilters.tsx
│   │   └── BarcodeDisplay.tsx
│   │
│   ├── transactions/                      # Transaction components
│   │   ├── TransactionTable.tsx
│   │   ├── BorrowForm.tsx
│   │   ├── ReturnForm.tsx
│   │   └── TransactionHistory.tsx
│   │
│   ├── students/                          # Student management components
│   │   ├── StudentTable.tsx
│   │   ├── StudentForm.tsx
│   │   ├── StudentDetails.tsx
│   │   ├── PreRegisterForm.tsx
│   │   └── CSVUploader.tsx
│   │
│   ├── scanner/                           # Barcode scanner components
│   │   ├── BarcodeScanner.tsx
│   │   ├── BarcodeScannerModal.tsx
│   │   └── ScannerControls.tsx
│   │
│   ├── dashboard/                         # Dashboard components
│   │   ├── StatsCard.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── PopularBooks.tsx
│   │   └── OverdueAlerts.tsx
│   │
│   └── common/                            # Shared/common components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       ├── DataTable.tsx
│       ├── SearchInput.tsx
│       ├── ConfirmDialog.tsx
│       └── EmptyState.tsx
│
├── lib/                                   # Utility libraries
│   ├── prisma.ts                          # Prisma client singleton
│   ├── auth.ts                            # Authentication utilities
│   ├── utils.ts                           # General utilities (cn, formatters)
│   ├── validation.ts                      # Zod schemas
│   ├── constants.ts                       # App constants
│   ├── barcode.ts                         # Barcode generation utilities
│   └── api.ts                             # Axios instance configuration
│
├── hooks/                                 # Custom React hooks
│   ├── useAuth.ts                         # Authentication hook
│   ├── useBooks.ts                        # Books data fetching
│   ├── useTransactions.ts                 # Transactions data
│   ├── useUsers.ts                        # Users data
│   ├── useScanner.ts                      # Barcode scanner hook
│   ├── useDebounce.ts                     # Debounce hook
│   └── useToast.ts                        # Toast notifications
│
├── store/                                 # Zustand stores
│   ├── authStore.ts                       # Authentication state
│   ├── bookStore.ts                       # Books state
│   ├── transactionStore.ts                # Transactions state
│   ├── uiStore.ts                         # UI state (sidebar, modals)
│   └── scannerStore.ts                    # Scanner state
│
├── types/                                 # TypeScript types
│   ├── index.ts                           # Main types export
│   ├── models.ts                          # Database model types
│   ├── api.ts                             # API request/response types
│   └── components.ts                      # Component prop types
│
├── prisma/                                # Prisma ORM
│   ├── schema.prisma                      # Database schema
│   ├── migrations/                        # Migration files
│   └── seed.ts                            # Database seeding script
│
├── public/                                # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── placeholder-book.png
│   │   └── ...
│   └── ...
│
├── middleware.ts                          # Next.js middleware (auth)
├── .env                                   # Environment variables (local)
├── .env.example                           # Environment variables template
├── .eslintrc.json                         # ESLint configuration
├── .prettierrc                            # Prettier configuration
├── next.config.ts                         # Next.js configuration
├── tsconfig.json                          # TypeScript configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── postcss.config.mjs                     # PostCSS configuration
├── package.json                           # Dependencies
└── README.md                              # Project documentation
```

## Key Folder Explanations

### `/app`
Next.js 15 App Router directory. All routes, layouts, and pages.

### `/components`
Reusable React components organized by feature/domain.

### `/lib`
Utility functions, configurations, and helper modules.

### `/hooks`
Custom React hooks for shared logic and TanStack Query.

### `/store`
Zustand state management stores.

### `/types`
TypeScript type definitions and interfaces.

### `/prisma`
Database schema, migrations, and seeds.

## Naming Conventions

- **Files**: PascalCase for components (`BookCard.tsx`), camelCase for utilities (`utils.ts`)
- **Folders**: kebab-case for routes (`my-books/`), camelCase for others (`components/`)
- **Components**: PascalCase (`BarcodeScanner`)
- **Functions**: camelCase (`generateBarcode`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BORROWING_LIMIT`)
- **Types/Interfaces**: PascalCase (`BookType`, `UserInterface`)
