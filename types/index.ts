/**
 * TypeScript Type Definitions
 */

import type { 
  User, 
  Book, 
  Category, 
  Transaction, 
  Reservation, 
  Fine,
  BookCategory,
  BookHistory,
  AuditLog,
  Settings,
  UserRole,
  UserStatus,
  BookStatus,
  TransactionStatus,
  TransactionType
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Book,
  Category,
  Transaction,
  Reservation,
  Fine,
  BookCategory,
  BookHistory,
  AuditLog,
  Settings,
  UserRole,
  UserStatus,
  BookStatus,
  TransactionStatus,
  TransactionType
}

// ================================
// API Response Types
// ================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  message?: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ================================
// Authentication Types
// ================================

export interface LoginResponse {
  user: Omit<User, 'password'>
  token: string
  expiresIn: number
}

export interface RegisterResponse {
  message: string
  user: Omit<User, 'password'>
}

// ================================
// Extended Model Types (with relations)
// ================================

export interface BookWithCategories extends Book {
  categories: {
    category: Category
  }[]
}

export interface BookWithDetails extends Book {
  categories: {
    category: Category
  }[]
  transactions: Transaction[]
  reservations: Reservation[]
}

export interface TransactionWithDetails extends Transaction {
  book: Book
  user: Omit<User, 'password'>
  fine?: Fine
}

export interface UserWithStats extends Omit<User, 'password'> {
  _count: {
    transactions: number
    fines: number
  }
  activeTransactions?: Transaction[]
  overdueTransactions?: Transaction[]
  unpaidFines?: Fine[]
}

export interface ReservationWithDetails extends Reservation {
  book: Book
  user: Omit<User, 'password'>
}

export interface FineWithDetails extends Fine {
  transaction: Transaction
  user: Omit<User, 'password'>
}

// ================================
// Dashboard Stats
// ================================

export interface DashboardStats {
  totalBooks: number
  availableBooks: number
  borrowedBooks: number
  totalUsers: number
  activeStudents: number
  activeTransactions: number
  overdueTransactions: number
  totalFines: number
  unpaidFines: number
}

export interface StudentDashboardStats {
  borrowedBooks: number
  overdueBooks: number
  unpaidFines: number
  borrowingLimit: number
  availableBorrowings: number
  totalBorrowingHistory: number
}

// ================================
// Form Data Types
// ================================

export interface BookFormData {
  title: string
  author: string
  isbn?: string
  publisher?: string
  publicationYear?: number
  edition?: string
  pages?: number
  description?: string
  language: string
  location?: string
  categoryIds: string[]
  quantity: number
  barcode?: string
  coverImage?: string
}

export interface StudentFormData {
  email: string
  firstName: string
  lastName: string
  studentId: string
  program: string
  yearLevel: number
  phone?: string
  borrowingLimit: number
}

export interface BorrowFormData {
  bookId: string
  userId: string
}

export interface ReturnFormData {
  transactionId: string
  notes?: string
}

// ================================
// Query Parameters
// ================================

export interface BookQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: BookStatus
  sortBy?: 'title' | 'author' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface TransactionQueryParams {
  page?: number
  limit?: number
  userId?: string
  bookId?: string
  status?: TransactionStatus
  startDate?: string
  endDate?: string
  sortBy?: 'borrowedAt' | 'dueDate' | 'returnedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  program?: string
  yearLevel?: number
  sortBy?: 'firstName' | 'lastName' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface FineQueryParams {
  page?: number
  limit?: number
  userId?: string
  status?: 'PAID' | 'UNPAID' | 'WAIVED'
  startDate?: string
  endDate?: string
  sortBy?: 'issuedAt' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

// ================================
// Account Management Types
// ================================

export interface UserProfile extends Omit<User, 'password'> {
  _count?: {
    transactions: number
    fines: number
  }
}

export interface ProfileUpdateData {
  phone?: string
  avatar?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface AccountStats {
  activeLoans: number
  unpaidFines: number
  borrowingLimit: number
  availableSlots: number
  canBorrow: boolean
}

// ================================
// Transaction / Borrowing Types
// ================================

export interface TransactionWithDetails extends Transaction {
  book: Book
  user: Omit<User, 'password'>
  fine?: Fine
}

export interface BorrowRequest {
  bookId?: string
  barcode?: string
  requestedDays: number
  notes?: string
}

export interface BorrowApproval {
  approved: true
  notes?: string
}

export interface BorrowRejection {
  approved: false
  rejectionReason: string
  notes?: string
}

export type ProcessBorrow = BorrowApproval | BorrowRejection

// Alternative format for ProcessBorrow using action property
export interface ProcessBorrowAction {
  action: 'approve' | 'reject'
  rejectionReason?: string
  notes?: string
}

// Book condition type
export type BookCondition = 'GOOD' | 'DAMAGED' | 'LOST'

export interface ReturnBookRequest {
  bookId?: string
  barcode?: string
  condition: BookCondition
  notes?: string
}

export interface RenewBookRequest {
  additionalDays?: number
  notes?: string
}

export interface BorrowEligibility {
  eligible: boolean
  reason?: string
  details?: {
    bookAvailable?: boolean
    accountActive?: boolean
    withinLimit?: boolean
    noOverdueBooks?: boolean
    noUnpaidFines?: boolean
  }
}

export interface TransactionStats {
  total: number
  pending: number
  active: number
  returned: number
  overdue: number
  rejected: number
}
