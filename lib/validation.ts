/**
 * Validation Schemas using Zod
 */

import { z } from 'zod'

// ================================
// Authentication Schemas
// ================================

export const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or Student ID is required'),
  password: z.string()
    .min(1, 'Password is required')
})

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  studentId: z.string()
    .min(1, 'Student ID is required'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50),
  middleName: z.string()
    .max(50)
    .optional()
    .or(z.literal(''))
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmNewPassword: z.string()
    .min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword']
})

// ================================
// Book Schemas
// ================================

export const bookSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  author: z.string()
    .min(1, 'Author is required')
    .max(100, 'Author must not exceed 100 characters'),
  isbn: z.string()
    .refine(
      (val) => !val || /^(?:\d{10}|\d{13})$/.test(val),
      'Invalid ISBN format (must be 10 or 13 digits)'
    )
    .optional()
    .or(z.literal('')),
  publisher: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  publicationYear: z.number()
    .int()
    .min(1000, 'Invalid publication year')
    .max(new Date().getFullYear() + 1, 'Publication year cannot be in the future')
    .optional(),
  edition: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),
  pages: z.number()
    .int()
    .min(1, 'Pages must be at least 1')
    .optional(),
  description: z.string()
    .optional()
    .or(z.literal('')),
  language: z.string()
    .default('English'),
  location: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),
  categoryIds: z.array(z.string())
    .min(1, 'Select at least one category'),
  quantity: z.number()
    .int()
    .min(1, 'Quantity must be at least 1'),
  barcode: z.string()
    .optional()
})

export const updateBookSchema = bookSchema.partial().extend({
  id: z.string().uuid()
})

// ================================
// User Schemas
// ================================

export const studentPreRegisterSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50),
  middleName: z.string()
    .max(50)
    .optional()
    .or(z.literal('')),
  studentId: z.string()
    .min(1, 'Student ID is required')
    .max(50),
  program: z.string()
    .min(1, 'Program is required')
    .max(100),
  yearLevel: z.number()
    .int()
    .min(1, 'Year level must be at least 1')
    .max(6, 'Year level must not exceed 6'),
  phone: z.string()
    .regex(/^[0-9]{10,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  borrowingLimit: z.number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(3)
})

export const updateUserSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50)
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50)
    .optional(),
  phone: z.string()
    .regex(/^[0-9]{10,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  avatar: z.string()
    .url('Invalid URL')
    .optional()
    .or(z.literal(''))
})

// Student account profile update (limited fields)
export const updateProfileSchema = z.object({
  phone: z.string()
    .regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  avatar: z.string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal(''))
})

// ================================
// Transaction Schemas
// ================================

// Student creates borrow request
export const borrowBookSchema = z.object({
  bookId: z.string()
    .uuid('Invalid book ID')
    .optional(),
  barcode: z.string()
    .min(1, 'Invalid barcode')
    .optional(),
  requestedDays: z.number()
    .int()
    .min(1, 'Minimum borrow period is 1 day')
    .max(90, 'Maximum borrow period is 90 days')
    .default(14),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
}).refine(data => data.bookId || data.barcode, {
  message: 'Either bookId or barcode is required',
  path: ['bookId']
})

// Staff approves borrow request
export const approveBorrowSchema = z.object({
  approved: z.literal(true),
  notes: z.string()
    .max(500)
    .optional()
    .or(z.literal(''))
})

// Staff rejects borrow request
export const rejectBorrowSchema = z.object({
  approved: z.literal(false),
  rejectionReason: z.string()
    .min(1, 'Rejection reason is required')
    .max(500, 'Reason must not exceed 500 characters'),
  notes: z.string()
    .max(500)
    .optional()
    .or(z.literal(''))
})

// Combined approval/rejection schema
export const processBorrowSchema = z.discriminatedUnion('approved', [
  approveBorrowSchema,
  rejectBorrowSchema
])

// Staff returns a book (by barcode scan or from transaction)
export const returnBookSchema = z.object({
  bookId: z.string()
    .uuid('Invalid book ID')
    .optional(),
  barcode: z.string()
    .min(1, 'Barcode is required')
    .optional(),
  condition: z.enum(['GOOD', 'DAMAGED', 'LOST'], {
    message: 'Invalid book condition'
  }).default('GOOD'),
  notes: z.string()
    .max(500)
    .optional()
    .or(z.literal(''))
})
// Note: bookId/barcode not required when called with transaction ID

// Student/Staff renews a book
export const renewBookSchema = z.object({
  additionalDays: z.number()
    .int()
    .min(1, 'Minimum renewal period is 1 day')
    .max(30, 'Maximum renewal period is 30 days')
    .optional(),
  notes: z.string()
    .max(500)
    .optional()
    .or(z.literal(''))
})

// ================================
// Type Exports
// ================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type BookInput = z.infer<typeof bookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type StudentPreRegisterInput = z.infer<typeof studentPreRegisterSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type BorrowBookInput = z.infer<typeof borrowBookSchema>
export type ProcessBorrowInput = z.infer<typeof processBorrowSchema>
export type ReturnBookInput = z.infer<typeof returnBookSchema>
export type RenewBookInput = z.infer<typeof renewBookSchema>
