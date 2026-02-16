/**
 * StatsGrid Component
 * Displays dashboard statistics in a grid layout
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  BookCheck, 
  BookX, 
  Users, 
  UserCheck, 
  FileText, 
  AlarmClock,
  DollarSign 
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { QuickStat } from '@/types'

interface StatsGridProps {
  stats: QuickStat[]
  isLoading?: boolean
}

const iconMap = {
  BookOpen,
  BookCheck,
  BookX,
  Users,
  UserCheck,
  FileText,
  AlarmClock,
  DollarSign,
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap] || BookOpen
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
