# Student Management Backend - Edit Student Info

## Overview
Complete backend infrastructure for staff to manage and edit student information, including profile details, academic info, and account settings (status, borrowing limits).

## Student Status Rules & Transitions

### Status Definitions
- **INACTIVE**: Pre-registered student awaiting registration. Cannot use the system until they complete registration.
- **ACTIVE**: Fully registered student. Can borrow books and use all system features.
- **SUSPENDED**: Account suspended by staff. Cannot borrow new books until reactivated.

### Status Transition Rules
```
┌──────────┐                    ┌────────┐
│ INACTIVE │───Registration────>│ ACTIVE │
└──────────┘                    └────┬───┘
                                     │
                                Suspend │
                                     │
                                     v
                              ┌────────────┐
                              │ SUSPENDED  │
                              └────┬───────┘
                                   │
                              Reactivate
                                   │
                                   v
                              ┌────────┐
                              │ ACTIVE │
                              └────────┘
```

### Valid Transitions
- ✅ **INACTIVE → ACTIVE**: Only through student registration process (API: `/api/auth/register`)
- ✅ **ACTIVE → SUSPENDED**: Staff suspends student account
- ✅ **SUSPENDED → ACTIVE**: Staff reactivates student account

### Blocked Transitions
- ❌ **INACTIVE → ACTIVE** (via staff edit): Staff cannot manually activate INACTIVE accounts
- ❌ **ACTIVE → INACTIVE**: Cannot revert to pre-registration status
- ❌ **SUSPENDED → INACTIVE**: Cannot revert to pre-registration status
- ❌ **Any → INACTIVE**: INACTIVE is exclusively for pre-registered students

### Field Edit Permissions

**All Statuses (INACTIVE, ACTIVE, SUSPENDED)**:
- ✅ firstName, lastName, email (editable)
- ✅ phone, avatar (editable)
- ✅ program, yearLevel (editable)
- ✅ borrowingLimit (editable)

**Important Note**: When editing name/email for INACTIVE students, staff must inform the student of the updated credentials since registration matching will use the new values.

### API Error Codes
- `INVALID_STATUS_TRANSITION`: Attempted invalid status change
- `DUPLICATE_EMAIL`: Email already exists
- `VALIDATION_ERROR`: Field validation failed
- `NOT_FOUND`: Student not found
- `FORBIDDEN`: Insufficient permissions

## Architecture

### Backend Components
```
API Endpoint (Already exists)
├── GET /api/users/[id] - Fetch student details with stats
└── PUT /api/users/[id] - Update student information

Validation Schemas
├── staffUpdateStudentSchema - Comprehensive student update validation
└── updateUserSchema - Basic user update (limited fields)

Hooks
├── useStudent(id) - Fetch student details
├── useUpdateStudent(id) - Update all student fields
├── useUpdateStudentStatus(id) - Quick status change
└── useUpdateBorrowingLimit(id) - Quick limit adjustment

Store
└── studentManagementStore - UI state management
    ├── Filters (search, status, program, etc.)
    ├── Sorting (field, direction)
    ├── Pagination
    ├── Preferences (columns, view mode)
    └── Dialogs (edit, view, suspend, etc.)
```

## API Endpoint

### GET /api/users/[id]
**Fetch student details with complete information and statistics**

**Endpoint**: `GET /api/users/[id]`

**Authentication**: Required (JWT token)

**Authorization**: 
- Staff can view any user
- Students can only view themselves

**Response**:
```typescript
{
  success: true,
  data: {
    user: {
      id: string
      email: string
      role: 'STUDENT'
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      firstName: string
      lastName: string
      phone: string | null
      avatar: string | null
      studentId: string
      program: string
      yearLevel: number
      borrowingLimit: number
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
      transactions: Transaction[] // Active and overdue only
      _count: {
        transactions: number
      }
    },
    stats: {
      activeLoans: number
      totalTransactions: number
    }
  }
}
```

**Error Responses**:
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - User not found
- `500` - Server error

**Example Usage**:
```typescript
const { data, isLoading, error } = useStudent(studentId)

if (data) {
  console.log(`Student: ${data.user.firstName} ${data.user.lastName}`)
  console.log(`Active Loans: ${data.stats.activeLoans}`)
  console.log(`Status: ${data.user.status}`)
}
```

---

### PUT /api/users/[id]
**Update student information**

**Endpoint**: `PUT /api/users/[id]`

**Authentication**: Required (JWT token)

**Authorization**: 
- **Staff**: Can update all fields
- **Students**: Can only update limited fields (firstName, lastName, phone, avatar) for their own account

**Request Body** (Staff - All fields optional):
```typescript
{
  // Basic Info
  firstName?: string              // 1-50 characters
  lastName?: string               // 1-50 characters
  email?: string                  // Valid email format
  phone?: string                  // 10-15 digits
  avatar?: string                 // Valid URL
  
  // Student-specific Info
  program?: string                // 1-100 characters
  yearLevel?: number              // 1-13 (K-12 + college)
  
  // Account Settings (Staff only)
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  borrowingLimit?: number         // 0-20
}
```

**Validation Rules**:
- `firstName`: 1-50 characters
- `lastName`: 1-50 characters
- `email`: Valid email, must be unique
- `phone`: 10-15 digit format or empty string
- `avatar`: Valid URL or empty string
- `program`: 1-100 characters
- `yearLevel`: Integer between 1-13 (supports K-12 + college)
- `status`: Must be ACTIVE, INACTIVE, or SUSPENDED
- `borrowingLimit`: Integer between 0-20

**Response**:
```typescript
{
  success: true,
  data: {
    user: {
      id: string
      email: string
      role: 'STUDENT'
      status: string
      firstName: string
      lastName: string
      phone: string | null
      avatar: string | null
      studentId: string
      program: string
      yearLevel: number
      borrowingLimit: number
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
    }
  }
}
```

**Error Responses**:
- `400` - Validation error (with details) or Invalid status transition
  - `VALIDATION_ERROR`: Field validation failed
  - `INVALID_STATUS_TRANSITION`: Invalid status change attempted (e.g., INACTIVE → ACTIVE via edit)
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - User not found
- `409` - Email already exists (`DUPLICATE_EMAIL`)
- `500` - Server error

**Features**:
- ✅ Email uniqueness validation
- ✅ Status transition validation (enforces ACTIVE ↔ SUSPENDED only)
- ✅ Field-level permission checks
- ✅ Audit logging (staff updates only)
- ✅ Partial updates (only send changed fields)

**Example Usage**:
```typescript
const updateStudent = useUpdateStudent(studentId)

// Update student info (all statuses can be edited)
updateStudent.mutate({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  program: 'BS Computer Science',
  yearLevel: 3
}, {
  onSuccess: (data) => {
    console.log('Student updated:', data.data.user)
  },
  onError: (error) => {
    console.error('Update failed:', error.response?.data?.error?.message)
  }
})

// Suspend an active student
updateStudent.mutate({
  status: 'SUSPENDED',
  borrowingLimit: 0  // Optional: prevent borrowing
})

// Attempting invalid transition will be rejected by API
// This will fail: INACTIVE → ACTIVE
updateStudent.mutate({ status: 'ACTIVE' })  // Error: Must register first
```

---

## Validation Schemas

### staffUpdateStudentSchema
**Comprehensive validation for staff updating student information**

**Location**: `/lib/validation.ts`

**Schema**:
```typescript
const staffUpdateStudentSchema = z.object({
  // Basic Info - Can be edited for ANY status (INACTIVE, ACTIVE, SUSPENDED)
  // Note: Editing name/email for INACTIVE students means student must register with updated info
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,15}$/).optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  
  // Student-specific Info - Can be edited for ANY status
  program: z.string().min(1).max(100).optional(),
  yearLevel: z.number().int().min(1).max(13).optional(),
  
  // Account Settings
  // Status transitions enforced at API level:
  // - INACTIVE → ACTIVE: Only through registration
  // - ACTIVE ↔ SUSPENDED: Allowed
  // - Any → INACTIVE: Blocked
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  borrowingLimit: z.number().int().min(0).max(20).optional()
})

type StaffUpdateStudentInput = z.infer<typeof staffUpdateStudentSchema>
```

### validateStatusTransition Helper
**Validates student status transitions**

**Location**: `/lib/validation.ts`

```typescript
function validateStatusTransition(
  currentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
): { isValid: boolean; error?: string }
```

**Rules**:
- ✅ ACTIVE → SUSPENDED (suspend student)
- ✅ SUSPENDED → ACTIVE (reactivate student)
- ❌ INACTIVE → ACTIVE (only through registration)
- ❌ Any → INACTIVE (INACTIVE is for pre-registration only)
- ❌ ACTIVE → INACTIVE (illogical)
- ❌ SUSPENDED → INACTIVE (illogical)

**Usage in Forms**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { staffUpdateStudentSchema, type StaffUpdateStudentInput } from '@/lib/validation'

const form = useForm<StaffUpdateStudentInput>({
  resolver: zodResolver(staffUpdateStudentSchema),
  defaultValues: {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    status: student.status,
    borrowingLimit: student.borrowingLimit
  }
})
```

---

## React Query Hooks

### useStudent(id: string)
**Fetch student details with statistics**

**Returns**:
```typescript
{
  data: {
    user: UserWithStats
    stats: {
      activeLoans: number
      totalTransactions: number
    }
  }
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}
```

**Features**:
- Auto-enabled when `id` is provided
- Cached under `['users', id]` key
- Automatically refetched when hook is remounted

**Example**:
```typescript
const { data, isLoading } = useStudent('student-id-123')

if (isLoading) return <LoadingSkeleton />

return (
  <div>
    <h1>{data?.user.firstName} {data?.user.lastName}</h1>
    <p>Active Loans: {data?.stats.activeLoans}</p>
    <p>Status: {data?.user.status}</p>
  </div>
)
```

---

### useUpdateStudent(id: string)
**Update student information (all fields)**

**Parameters**:
- `id`: Student user ID

**Returns**:
```typescript
{
  mutate: (data: StaffUpdateStudentInput) => void
  mutateAsync: (data: StaffUpdateStudentInput) => Promise<any>
  isPending: boolean
  isError: boolean
  error: Error | null
  data: ApiResponse<{ user: UserWithStats }> | undefined
}
```

**Features**:
- Automatically invalidates cached queries on success
- Invalidates: `['users', id]`, `['users']`, `['dashboard']`
- Supports TypeScript type safety with `StaffUpdateStudentInput`

**Example**:
```typescript
const updateStudent = useUpdateStudent(studentId)

const handleSubmit = (formData: StaffUpdateStudentInput) => {
  updateStudent.mutate(formData, {
    onSuccess: () => {
      toast({ title: 'Success', description: 'Student updated successfully' })
      closeDialog()
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error?.message || 'Failed to update student',
        variant: 'destructive'
      })
    }
  })
}

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <Button 
      type="submit" 
      disabled={updateStudent.isPending}
    >
      {updateStudent.isPending ? 'Updating...' : 'Update Student'}
    </Button>
  </form>
)
```

---

### useUpdateStudentStatus(id: string)
**Quick action to change student status**

**Parameters**:
- `id`: Student user ID

**Mutation Function**:
```typescript
mutate(status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')
```

**Status Transition Rules**:
- ✅ ACTIVE → SUSPENDED: Allowed
- ✅ SUSPENDED → ACTIVE: Allowed
- ❌ INACTIVE → ACTIVE: Blocked (only through registration)
- ❌ Any → INACTIVE: Blocked (pre-registration only)

**Example**:
```typescript
const updateStatus = useUpdateStudentStatus(studentId)

// Suspend an active student
const handleSuspend = () => {
  updateStatus.mutate('SUSPENDED', {
    onSuccess: () => {
      toast({ title: 'Student suspended successfully' })
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error?.message,
        variant: 'destructive'
      })
    }
  })
}

// Reactivate a suspended student
const handleReactivate = () => {
  updateStatus.mutate('ACTIVE', {
    onSuccess: () => {
      toast({ title: 'Student reactivated successfully' })
    }
  })
}

// This will fail - INACTIVE can only become ACTIVE through registration
const handleInvalidActivate = () => {
  updateStatus.mutate('ACTIVE')  // API will reject with INVALID_STATUS_TRANSITION
}
```

---

### useUpdateBorrowingLimit(id: string)
**Quick action to adjust borrowing limit**

**Parameters**:
- `id`: Student user ID

**Mutation Function**:
```typescript
mutate(borrowingLimit: number)
```

**Example**:
```typescript
const updateLimit = useUpdateBorrowingLimit(studentId)

const handleAdjustLimit = (newLimit: number) => {
  updateLimit.mutate(newLimit, {
    onSuccess: () => {
      toast({ 
        title: 'Borrowing limit updated', 
        description: `New limit: ${newLimit} books` 
      })
    }
  })
}
```

---

## Zustand Store

### studentManagementStore
**UI state management for student list and operations**

**Location**: `/store/studentManagementStore.ts`

**State Structure**:
```typescript
{
  // View
  currentView: 'list' | 'grid' | 'detail'
  selectedStudentId: string | null
  
  // Filters
  filters: {
    search: string
    status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    program: string
    yearLevel: number | null
    hasOverdue: boolean
    hasFines: boolean
  }
  
  // Sorting
  sortConfig: {
    field: 'firstName' | 'lastName' | 'studentId' | 'program' | 'yearLevel' | 'createdAt' | 'borrowingLimit'
    direction: 'asc' | 'desc'
  }
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // Preferences
  preferences: {
    showInactiveStudents: boolean
    compactMode: boolean
    showStatistics: boolean
    columnsVisible: { ... }
  }
  
  // Dialogs
  dialogs: {
    editStudent: boolean
    viewStudent: boolean
    suspendStudent: boolean
    adjustLimit: boolean
    preRegister: boolean
    importCSV: boolean
  }
}
```

**Key Actions**:
```typescript
// View
setCurrentView(view)
setSelectedStudent(id)

// Filters
setFilters(filters)
resetFilters()

// Sorting
setSortConfig(config)
toggleSortDirection()

// Pagination
setCurrentPage(page)
setItemsPerPage(count)
nextPage()
previousPage()

// Dialogs
openDialog(dialog)
closeDialog(dialog)
closeAllDialogs()

// Reset
reset()
```

**Usage Example**:
```typescript
import { useStudentManagementStore } from '@/store/studentManagementStore'

function StudentListPage() {
  const { 
    filters, 
    setFilters, 
    currentPage, 
    itemsPerPage,
    openDialog,
    dialogs 
  } = useStudentManagementStore()
  
  const { data, isLoading } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: filters.search,
    status: filters.status === 'ALL' ? undefined : filters.status
  })
  
  return (
    <div>
      <Input 
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        placeholder="Search students..."
      />
      
      <Button onClick={() => openDialog('editStudent')}>
        Edit Student
      </Button>
      
      {dialogs.editStudent && (
        <EditStudentDialog />
      )}
    </div>
  )
}
```

**Persisted State**:
The following state is saved to localStorage and persists across sessions:
- `currentView`
- `filters`
- `sortConfig`
- `itemsPerPage`
- `preferences`

---

## Complete Implementation Example

### Edit Student Dialog Component
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { staffUpdateStudentSchema, type StaffUpdateStudentInput } from '@/lib/validation'
import { useStudent, useUpdateStudent } from '@/hooks/useUsers'
import { useStudentManagementStore } from '@/store/studentManagementStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'

export function EditStudentDialog() {
  const { toast } = useToast()
  const { selectedStudentId, dialogs, closeDialog } = useStudentManagementStore()
  const { data, isLoading: loadingStudent } = useStudent(selectedStudentId!)
  const updateStudent = useUpdateStudent(selectedStudentId!)
  
  const form = useForm<StaffUpdateStudentInput>({
    resolver: zodResolver(staffUpdateStudentSchema),
    defaultValues: {
      firstName: data?.user.firstName || '',
      lastName: data?.user.lastName || '',
      email: data?.user.email || '',
      phone: data?.user.phone || '',
      program: data?.user.program || '',
      yearLevel: data?.user.yearLevel || 1,
      status: data?.user.status || 'ACTIVE',
      borrowingLimit: data?.user.borrowingLimit || 3
    }
  })
  
  const onSubmit = (formData: StaffUpdateStudentInput) => {
    updateStudent.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Student information updated successfully'
        })
        closeDialog('editStudent')
        form.reset()
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.error?.message || 'Failed to update student',
          variant: 'destructive'
        })
      }
    })
  }
  
  if (loadingStudent) {
    return (
      <Dialog open={dialogs.editStudent} onOpenChange={() => closeDialog('editStudent')}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <Dialog open={dialogs.editStudent} onOpenChange={() => closeDialog('editStudent')}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Information</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john.doe@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="09123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BS Computer Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Level</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min={1}
                        max={13}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="borrowingLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrowing Limit</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min={0}
                        max={20}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => closeDialog('editStudent')}
                disabled={updateStudent.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateStudent.isPending}
              >
                {updateStudent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Student'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Testing

### Manual Testing Checklist

**Basic Updates**:
- [ ] Update first name
- [ ] Update last name
- [ ] Update email (ensure uniqueness check works)
- [ ] Update phone number
- [ ] Update program
- [ ] Update year level

**Status Management**:
- [ ] Activate student
- [ ] Suspend student (should prevent borrowing)
- [ ] Deactivate student
- [ ] Verify status changes reflect immediately

**Borrowing Limit**:
- [ ] Increase limit
- [ ] Decrease limit
- [ ] Set to 0 (prevent new borrows)
- [ ] Set to maximum (20)

**Validation**:
- [ ] Try invalid email format
- [ ] Try duplicate email
- [ ] Try invalid phone format
- [ ] Try year level outside 1-10 range
- [ ] Try borrowing limit outside 0-20 range

**Authorization**:
- [ ] Staff can update any student
- [ ] Student cannot update status/borrowing limit
- [ ] Student can only update own basic info

**UI State**:
- [ ] Filters persist after page refresh
- [ ] Selected student state maintained
- [ ] Dialog states work correctly

---

## Summary

### ✅ What's Already Implemented
1. **API Endpoints**:
   - GET `/api/users/[id]` - Fetch student details
   - PUT `/api/users/[id]` - Update student info

2. **Validation Schemas**:
   - `staffUpdateStudentSchema` - Comprehensive update validation
   - `StaffUpdateStudentInput` - TypeScript type

3. **React Query Hooks**:
   - `useStudent(id)` - Fetch student
   - `useUpdateStudent(id)` - Update all fields
   - `useUpdateStudentStatus(id)` - Quick status change
   - `useUpdateBorrowingLimit(id)` - Quick limit change

4. **Zustand Store**:
   - `studentManagementStore` - Complete UI state management
   - Filters, sorting, pagination, preferences, dialogs
   - LocalStorage persistence

### 📝 Ready for UI Implementation
All backend infrastructure is complete and production-ready. When you're ready to build the UI:

1. Create `EditStudentDialog` component (template provided above)
2. Create student list table/grid components
3. Add filter and search UI
4. Implement quick action buttons (suspend, activate, adjust limit)
5. Connect to store for state management

### 📚 Related Files
- `/app/api/users/[id]/route.ts` - API endpoint
- `/lib/validation.ts` - Validation schemas
- `/hooks/useUsers.ts` - React Query hooks
- `/store/studentManagementStore.ts` - Zustand store
- `/types/index.ts` - TypeScript types

---

**Implementation Date**: February 17, 2026  
**Status**: ✅ Backend Complete - Ready for UI  
**Version**: 1.0.0
