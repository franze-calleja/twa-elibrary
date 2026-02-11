/**
 * Profile Information Card Component
 * Displays user's profile information with avatar
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProfile, useFullName } from '@/hooks/useAccount'
import { 
  getAvatarUrl, 
  getUserInitials, 
  formatPhoneNumber,
  getStatusBadgeVariant,
  getStatusDisplayText,
  formatYearLevel,
  formatAccountAge
} from '@/lib/account'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Phone, IdCard, GraduationCap, Calendar, BookOpen } from 'lucide-react'

export function ProfileInfo() {
  const { data: profile, isLoading, error } = useProfile()
  const fullName = useFullName()

  if (isLoading) {
    return <ProfileInfoSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-destructive">Error loading profile</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Unable to load profile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Your personal details and account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={getAvatarUrl(profile)} alt={fullName} />
            <AvatarFallback className="text-lg">{getUserInitials(profile)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusBadgeVariant(profile.status)}>
                {getStatusDisplayText(profile.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Member for {formatAccountAge(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <p className="text-sm font-semibold">{profile.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p className="text-sm font-semibold">{formatPhoneNumber(profile.phone)}</p>
            </div>
          </div>

          {/* Student ID */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IdCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Student ID</p>
              <p className="text-sm font-semibold">{profile.studentId || 'N/A'}</p>
            </div>
          </div>

          {/* Program */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Program</p>
              <p className="text-sm font-semibold">{profile.program || 'N/A'}</p>
            </div>
          </div>

          {/* Year Level */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Year Level</p>
              <p className="text-sm font-semibold">{formatYearLevel(profile.yearLevel)}</p>
            </div>
          </div>

          {/* Borrowing Limit */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Borrowing Limit</p>
              <p className="text-sm font-semibold">{profile.borrowingLimit} books</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
