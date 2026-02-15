/**
 * Staff Profile Page - View Profile
 */

'use client'

import { ProfileInfo, ProfileStats, EditProfileForm, ChangePasswordDialog } from '@/components/profile'

export default function StaffProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View and manage your account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileInfo />
        </div>

        <div className="space-y-4">
          <EditProfileForm />

          <ChangePasswordDialog />
        </div>

        {/* ProfileStats removed for staff/admin view (student-specific metrics) */}
      </div>
    </div>
  )
}
