/**
 * RecentActivitiesCard Component
 * Displays recent transaction activities
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { DashboardActivity } from '@/types'

interface RecentActivitiesCardProps {
  activities: DashboardActivity[]
  isLoading?: boolean
}

const activityTypeColors = {
  BORROW: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  RETURN: 'bg-green-500/10 text-green-700 dark:text-green-400',
  RENEW: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  OVERDUE: 'bg-red-500/10 text-red-700 dark:text-red-400',
  FINE: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  REQUEST: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
} as const

export function RecentActivitiesCard({ activities, isLoading }: RecentActivitiesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/staff/transactions">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-100">
          <div className="space-y-4">
            {activities.map((activity) => {
              const colorClass = activityTypeColors[activity.type] || activityTypeColors.REQUEST
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className={`rounded-full p-2 ${colorClass}`}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
