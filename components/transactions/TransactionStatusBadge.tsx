/**
 * Transaction Status Badge Component
 * Displays transaction status with appropriate colors
 */

import { Badge } from '@/components/ui/badge'
import type { TransactionStatus } from '@prisma/client'
import { Clock, CheckCircle2, XCircle, AlertTriangle, Ban } from 'lucide-react'

interface TransactionStatusBadgeProps {
  status: TransactionStatus
  className?: string
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending Approval',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }
      case 'ACTIVE':
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 border-green-300'
        }
      case 'RETURNED':
        return {
          label: 'Returned',
          variant: 'outline' as const,
          icon: CheckCircle2,
          className: 'bg-gray-100 text-gray-800 border-gray-300'
        }
      case 'OVERDUE':
        return {
          label: 'Overdue',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-300'
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-300'
        }
      default:
        return {
          label: status,
          variant: 'outline' as const,
          icon: Ban,
          className: ''
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
