/**
 * Profile Page - Student
 * Complete profile management with stats, info, and edit forms
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileInfo, ProfileStats, EditProfileForm, ChangePasswordDialog } from '@/components/profile'
import { useProfile } from '@/hooks/useAccount'
import { Separator } from '@/components/ui/separator'
import { User, Settings, Shield, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile()

  // Debug logging
  console.log('[ProfilePage] Profile data:', profile)
  console.log('[ProfilePage] Loading:', isLoading)
  console.log('[ProfilePage] Error:', error)

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and settings
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>
            {error.message || 'Unable to load profile data. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and settings
        </p>
      </div>

      {/* Stats Overview */}
      <ProfileStats />

      <Separator />

      {/* Tabs for Profile Sections */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <ProfileInfo />
        </TabsContent>

        {/* Edit Profile Tab */}
        <TabsContent value="edit" className="space-y-4">
          <EditProfileForm
            initialPhone={profile?.phone}
            initialAvatar={profile?.avatar}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password to keep your account secure
                </p>
              </div>
              <ChangePasswordDialog />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
