# Student Profile Page - Implementation Guide

## 🎯 Overview

Complete student profile management system with modern UI built using Shadcn components and TanStack Query.

## 📦 Components Created

### 1. ProfileInfo.tsx
**Purpose**: Display complete user profile information with avatar

**Features**:
- Avatar display with fallback initials
- Account status badge (Active/Inactive/Suspended)
- Email, phone, student ID, program, year level, borrowing limit
- Icon-based information cards
- Loading skeleton
- Responsive grid layout

**Props**: None (uses `useProfile()` hook)

---

### 2. ProfileStats.tsx
**Purpose**: Display borrowing statistics and account status

**Features**:
- 4 stat cards: Active Loans, Unpaid Fines, Borrowing Limit, Eligibility
- Progress bar for borrowing capacity
- Color-coded indicators
- Real-time data from profile
- Skeleton loader

**Props**: None (uses `useProfileStats()` hook)

---

### 3. EditProfileForm.tsx
**Purpose**: Allow students to update phone number and avatar

**Features**:
- React Hook Form with Zod validation
- Phone number input (10-15 digits, optional + prefix)
- Avatar URL input with live preview
- Optimistic updates (instant UI feedback)
- Success/error toast notifications
- Reset button

**Props**:
```typescript
{
  initialPhone?: string | null
  initialAvatar?: string | null
}
```

---

### 4. ChangePasswordDialog.tsx
**Purpose**: Secure password change with validation

**Features**:
- Modal dialog
- Three password fields (current, new, confirm)
- Show/hide password toggles
- Real-time validation
- Password strength requirements
- Success/error handling

**Props**: None

---

## 🎨 Page Layout

The profile page uses **tabs** to organize content:

1. **Profile Tab** - View complete profile information
2. **Edit Profile Tab** - Update phone and avatar
3. **Security Tab** - Change password

## 🚀 Usage Examples

### Simple Profile Display
```typescript
import { ProfileInfo, ProfileStats } from '@/components/profile'

export default function SimplePage() {
  return (
    <div className="space-y-6">
      <ProfileStats />
      <ProfileInfo />
    </div>
  )
}
```

### Edit Profile Only
```typescript
import { EditProfileForm } from '@/components/profile'
import { useProfile } from '@/hooks/useAccount'

export default function EditPage() {
  const { data: profile } = useProfile()
  
  return (
    <EditProfileForm
      initialPhone={profile?.phone}
      initialAvatar={profile?.avatar}
    />
  )
}
```

### Password Change Button
```typescript
import { ChangePasswordDialog } from '@/components/profile'

export default function SettingsPage() {
  return (
    <div>
      <h2>Security Settings</h2>
      <ChangePasswordDialog />
    </div>
  )
}
```

## 🔌 Hooks Used

All components use the custom hooks from `/hooks/useAccount.ts`:

- `useProfile()` - Fetch current user profile
- `useProfileStats()` - Get borrowing statistics
- `useUpdateProfile()` - Update profile (optimistic)
- `useChangePassword()` - Change password
- `useFullName()` - Get formatted full name

## 🎨 Shadcn Components Used

- ✅ Avatar
- ✅ Card (CardHeader, CardContent, CardFooter, etc.)
- ✅ Badge
- ✅ Button
- ✅ Input
- ✅ Form (react-hook-form integration)
- ✅ Dialog
- ✅ Tabs
- ✅ Progress
- ✅ Separator
- ✅ Skeleton
- ✅ Sonner (Toast notifications)

## 🎯 Features

### Real-time Updates
- Profile data auto-refreshes every 5 minutes
- Optimistic updates (changes appear instantly)
- Auto-rollback on error

### Security
- Password strength validation
- Current password verification
- Show/hide password toggles
- Secure API endpoints (JWT auth)

### User Experience
- Loading skeletons
- Success/error notifications
- Form validation with helpful messages
- Responsive design (mobile-friendly)
- Live avatar preview

### Validation
- Phone: 10-15 digits, optional + prefix
- Avatar: Valid image URL
- Password: Min 8 chars, uppercase, lowercase, number

## 🎨 Customization

### Change Colors
```typescript
// In ProfileStats.tsx
const capacityColor = getBorrowingCapacityColor(capacityPercentage)
// Returns: 'text-red-600', 'text-yellow-600', or 'text-green-600'
```

### Add More Statistics
```typescript
// In ProfileStats.tsx
<Card>
  <CardHeader>
    <CardTitle>Total Books Borrowed</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {profile?._count?.totalTransactions || 0}
    </div>
  </CardContent>
</Card>
```

### Customize Form Fields
Edit `EditProfileForm.tsx` to add more editable fields:
```typescript
// Add bio field
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

## 📱 Responsive Design

All components are fully responsive:

- **Mobile**: Single column layout, stacked cards
- **Tablet**: 2-column grid for stats
- **Desktop**: 4-column grid for stats, 2-column for info

## ✅ Testing Checklist

- [ ] Profile info displays correctly
- [ ] Avatar shows with fallback to initials
- [ ] Stats cards show correct data
- [ ] Phone number updates successfully
- [ ] Avatar URL updates with preview
- [ ] Invalid phone number shows error
- [ ] Invalid avatar URL shows error
- [ ] Password change requires current password
- [ ] New password validates strength
- [ ] Passwords must match
- [ ] Show/hide password toggles work
- [ ] Success toasts appear
- [ ] Error toasts show helpful messages
- [ ] Loading states display properly
- [ ] Mobile layout works well

## 🔧 Troubleshooting

### Profile Not Loading
Check:
1. User is authenticated (`useAuthStore`)
2. API route `/api/account` is working
3. JWT token is valid
4. Database connection is active

### Updates Not Saving
Check:
1. Network tab for API errors
2. Validation errors in form
3. JWT token hasn't expired
4. User has permission to update profile

### Toasts Not Showing
Ensure Toaster is in root layout:
```typescript
// app/layout.tsx
import { Toaster } from 'sonner'

<Toaster position="top-right" richColors />
```

## 🚀 Future Enhancements

Potential additions:
- [ ] Image upload for avatar (not just URL)
- [ ] Crop/resize avatar tool
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Account deletion
- [ ] Export profile data
- [ ] Activity log viewer

---

**Status**: ✅ Complete and Ready to Use  
**Created**: February 11, 2026
