/**
 * Student Status Badge Component
 * Visual indicator for student account status
 */

import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface StudentStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  showIcon?: boolean
  size?: 'sm' | 'default' | 'lg'
}

export function StudentStatusBadge({ status, showIcon = true, size = 'default' }: StudentStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    default: 'text-sm',
    lg: 'text-base py-1.5 px-3'
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }
  
  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      variant: 'default' as const,
      Icon: CheckCircle,
      className: 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400 border-green-500/20'
    },
    INACTIVE: {
      label: 'Inactive',
      variant: 'secondary' as const,
      Icon: Clock,
      className: 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20'
    },
    SUSPENDED: {
      label: 'Suspended',
      variant: 'destructive' as const,
      Icon: XCircle,
      className: 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 border-red-500/20'
    }
  }
  
  const config = statusConfig[status]
  const Icon = config.Icon
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  )
}

/**
 * Student Status Indicator with Description
 * More detailed status display with explanation
 */
interface StudentStatusIndicatorProps {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  showDescription?: boolean
}

export function StudentStatusIndicator({ status, showDescription = true }: StudentStatusIndicatorProps) {
  const descriptions = {
    ACTIVE: 'Account is active and can use all features',
    INACTIVE: 'Pre-registered, awaiting registration completion',
    SUSPENDED: 'Account suspended, cannot borrow books'
  }
  
  return (
    <div className="flex items-start gap-2">
      <StudentStatusBadge status={status} />
      {showDescription && (
        <p className="text-xs text-muted-foreground">
          {descriptions[status]}
        </p>
      )}
    </div>
  )
}
