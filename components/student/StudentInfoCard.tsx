/**
 * Student Info Card Component
 * Displays student's personal information
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, GraduationCap, Calendar, User as UserIcon } from 'lucide-react'
import type { User } from '@prisma/client'
import { format } from 'date-fns'

interface StudentInfoCardProps {
  user: User
}

export function StudentInfoCard({ user }: StudentInfoCardProps) {
  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'SUSPENDED':
        return 'destructive'
      case 'INACTIVE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar || undefined} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="text-lg font-semibold">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">
              {user.firstName} {user.middleName && `${user.middleName} `}{user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.studentId}</p>
            <div className="mt-2">
              <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            </div>
          )}

          {user.program && (
            <div className="flex items-start space-x-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Program</p>
                <p className="text-sm text-muted-foreground">{user.program}</p>
              </div>
            </div>
          )}

          {user.yearLevel && (
            <div className="flex items-start space-x-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Year Level</p>
                <p className="text-sm text-muted-foreground">Year {user.yearLevel}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Registered</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {user.lastLoginAt && (
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Borrowing Limit */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Borrowing Limit</span>
            <span className="text-2xl font-bold">{user.borrowingLimit}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Maximum books that can be borrowed simultaneously
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
