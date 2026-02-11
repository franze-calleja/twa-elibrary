# Student Account Management - Backend Infrastructure

Complete backend implementation for student account management in the TWA E-Library system.

## 📁 Created Files

### 1. API Routes

#### `/app/api/account/route.ts`
**Endpoints:**
- `GET /api/account` - Get current user's profile
- `PATCH /api/account` - Update profile (phone, avatar)

**Features:**
- Authentication required
- Returns complete profile with stats (_count)
- Optimistic updates support
- Audit logging
- Comprehensive error handling

**Response Format:**
```typescript
{
  success: true,
  data: {
    profile: {
      id: string
      email: string
      role: 'STUDENT' | 'STAFF'
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      firstName: string
      lastName: string
      middleName: string | null
      phone: string | null
      avatar: string | null
      studentId: string | null
      program: string | null
      yearLevel: number | null
      borrowingLimit: number
      createdAt: string
      updatedAt: string
      lastLoginAt: string | null
      _count: {
        transactions: number  // Active loans only
        fines: number         // Unpaid fines only
      }
    }
  }
}
```

#### `/app/api/account/password/route.ts`
**Endpoint:**
- `PUT /api/account/password` - Change password

**Features:**
- Verifies current password
- Validates new password strength
- Prevents using same password
- Creates audit log
- Bcrypt password hashing

**Request Body:**
```typescript
{
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
```

### 2. Validation Schemas (`/lib/validation.ts`)

#### `updateProfileSchema`
```typescript
{
  phone?: string      // 10-15 digits, optional + prefix
  avatar?: string     // Valid URL
}
```

**Added to exports:**
- `UpdateProfileInput` type

### 3. Zustand Store (`/store/accountStore.ts`)

**State:**
```typescript
{
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}
```

**Actions:**
- `setProfile(profile)` - Set complete profile
- `updateProfile(updates)` - Partial update
- `clearProfile()` - Clear state
- `setLoading(isLoading)` - Set loading state
- `setError(error)` - Set error state

**Usage:**
```typescript
import { useAccountStore } from '@/store/accountStore'

const { profile, isLoading, setProfile } = useAccountStore()
```

### 4. TanStack Query Hooks (`/hooks/useAccount.ts`)

#### `useProfile()`
Fetch current user's profile (auto-enabled when authenticated)

**Usage:**
```typescript
const { data: profile, isLoading, error, refetch } = useProfile()
```

**Features:**
- Auto-syncs with Zustand store
- 5-minute stale time
- Enabled only when authenticated
- Auto-retry on failure

#### `useUpdateProfile()`
Update profile with optimistic updates

**Usage:**
```typescript
const updateProfile = useUpdateProfile()

updateProfile.mutate(
  { phone: '+639171234567' },
  {
    onSuccess: () => {
      toast.success('Profile updated!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  }
)
```

**Features:**
- Optimistic updates (instant UI feedback)
- Automatic rollback on error
- Invalidates related queries
- Syncs with auth store

#### `useChangePassword()`
Change user password

**Usage:**
```typescript
const changePassword = useChangePassword()

changePassword.mutate(
  {
    currentPassword: 'oldpass123',
    newPassword: 'NewPass123',
    confirmNewPassword: 'NewPass123'
  },
  {
    onSuccess: (message) => {
      toast.success(message)
      // Optionally redirect or clear form
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message)
    }
  }
)
```

#### Utility Hooks

**`useProfileStats()`**
```typescript
const stats = useProfileStats()
// Returns: { activeLoans, unpaidFines, borrowingLimit, availableSlots, canBorrow }
```

**`useCanBorrow()`**
```typescript
const canBorrow = useCanBorrow()
// Returns: boolean (true if eligible to borrow)
```

**`useFullName()`**
```typescript
const fullName = useFullName()
// Returns: "John Doe" (formatted full name)
```

### 5. Account Utilities (`/lib/account.ts`)

Complete utility functions for account management:

#### Formatting Functions
- `formatFullName(profile)` - Get full name with middle name
- `getUserInitials(profile)` - Get initials (e.g., "JD")
- `formatPhoneNumber(phone)` - Format for display
- `formatYearLevel(yearLevel)` - "1st Year", "2nd Year", etc.
- `formatAccountAge(createdAt)` - "2 months ago"

#### Validation Functions
- `isValidPhoneNumber(phone)` - Validate phone format
- `isValidAvatarUrl(url)` - Validate avatar URL
- `isProfileComplete(profile)` - Check if all required fields filled

#### Avatar Functions
- `getDefaultAvatar(profile)` - Get placeholder avatar
- `getAvatarUrl(profile)` - Get avatar with fallback

#### Status Functions
- `getStatusBadgeVariant(status)` - Get badge color variant
- `getStatusDisplayText(status)` - Get display text

#### Borrowing Functions
- `getBorrowingCapacity(active, limit)` - Calculate percentage
- `getBorrowingCapacityColor(percentage)` - Get color class

#### Other Functions
- `getMissingProfileFields(profile)` - Get array of missing fields
- `getAccountAge(createdAt)` - Get age in days

### 6. TypeScript Types (`/types/index.ts`)

Added account-related types:
```typescript
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
```

---

## 🚀 Usage Examples

### Example 1: Profile Page Component

```typescript
'use client'

import { useProfile, useUpdateProfile, useFullName } from '@/hooks/useAccount'
import { getAvatarUrl, formatPhoneNumber } from '@/lib/account'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const fullName = useFullName()
  const { toast } = useToast()
  const [phone, setPhone] = useState('')

  if (isLoading) return <div>Loading...</div>
  if (!profile) return <div>Profile not found</div>

  const handleUpdatePhone = () => {
    updateProfile.mutate(
      { phone },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Phone updated!' })
        },
        onError: (error: any) => {
          toast({ 
            title: 'Error', 
            description: error.response?.data?.error?.message,
            variant: 'destructive'
          })
        }
      }
    )
  }

  return (
    <div className="p-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={getAvatarUrl(profile)} 
            alt={fullName}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student ID</label>
            <p className="text-lg">{profile.studentId}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex gap-2">
              <Input 
                value={phone || profile.phone || ''} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+639171234567"
              />
              <Button 
                onClick={handleUpdatePhone}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving...' : 'Update'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {formatPhoneNumber(profile.phone)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

### Example 2: Change Password Component

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useChangePassword } from '@/hooks/useAccount'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validation'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function ChangePasswordForm() {
  const { toast } = useToast()
  const changePassword = useChangePassword()
  
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const onSubmit = (data: ChangePasswordInput) => {
    changePassword.mutate(data, {
      onSuccess: (message) => {
        toast({ title: 'Success', description: message })
        form.reset()
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error?.message || 'Failed to change password'
        toast({ 
          title: 'Error', 
          description: errorMessage,
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <Input type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <Input type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <Input type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </Form>
  )
}
```

### Example 3: Profile Stats Widget

```typescript
'use client'

import { useProfileStats } from '@/hooks/useAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Book, AlertCircle, CheckCircle } from 'lucide-react'

export function ProfileStatsWidget() {
  const stats = useProfileStats()

  const capacityPercentage = (stats.activeLoans / stats.borrowingLimit) * 100

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeLoans} / {stats.borrowingLimit}
          </div>
          <Progress value={capacityPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.availableSlots} slots available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unpaid Fines</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unpaidFines}</div>
          <p className="text-xs text-muted-foreground">
            {stats.unpaidFines > 0 ? 'Please settle fines' : 'All clear!'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Can Borrow</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.canBorrow ? 'Yes' : 'No'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.canBorrow ? 'Ready to borrow' : 'Check requirements'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🔒 Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **Password Validation** - Minimum 8 chars, uppercase, lowercase, number
3. **Current Password Verification** - Must provide correct current password
4. **Same Password Prevention** - Cannot use same password
5. **Bcrypt Hashing** - Passwords hashed with bcrypt (10 rounds)
6. **Audit Logging** - All profile/password changes logged
7. **Limited Updates** - Students can only update phone and avatar (not name, email, etc.)

---

## ✅ Error Handling

All endpoints return consistent error format:
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` - No authentication token
- `USER_NOT_FOUND` - Profile not found
- `VALIDATION_ERROR` - Invalid input (Zod validation failed)
- `INVALID_PASSWORD` - Current password incorrect
- `SAME_PASSWORD` - New password same as current
- `FETCH_ERROR` - Failed to retrieve profile
- `UPDATE_ERROR` - Failed to update profile

---

## 🧪 Testing the Implementation

### Test with cURL

```bash
# 1. Get Profile (requires authentication cookie/token)
curl -X GET http://localhost:3000/api/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Update Profile
curl -X PATCH http://localhost:3000/api/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+639171234567"}'

# 3. Change Password
curl -X PUT http://localhost:3000/api/account/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass123",
    "confirmNewPassword": "NewPass123"
  }'
```

---

## 📋 Next Steps

Now you can implement the UI components:

1. **Profile Page** - Display and edit profile
2. **Change Password Dialog** - Password change form
3. **Avatar Upload** - Image upload component
4. **Profile Stats Dashboard** - Statistics cards
5. **Settings Page** - Combined profile and settings

The backend infrastructure is complete and ready to be consumed by the frontend!

---

**Created:** February 11, 2026
**Status:** ✅ Complete and Ready for UI Implementation
