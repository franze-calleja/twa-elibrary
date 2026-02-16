/**
 * QuickActionsCard Component
 * Displays quick action buttons for common tasks
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Users, 
  ScanLine, 
  ArrowLeftRight,
  FileText,
  Settings,
  BarChart3,
  Upload
} from 'lucide-react'

interface QuickAction {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Add New Book',
    description: 'Register a new book',
    icon: BookOpen,
    href: '/staff/books?action=new',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400'
  },
  {
    label: 'Register Student',
    description: 'Pre-register student',
    icon: Users,
    href: '/staff/students?action=register',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400'
  },
  {
    label: 'Scan Barcode',
    description: 'Quick scan',
    icon: ScanLine,
    href: '/staff/transactions?action=scan',
    color: 'bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400'
  },
  {
    label: 'Process Transaction',
    description: 'Borrow or return',
    icon: ArrowLeftRight,
    href: '/staff/transactions',
    color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400'
  },
  {
    label: 'View Reports',
    description: 'Analytics & stats',
    icon: BarChart3,
    href: '/staff/reports',
    color: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-400'
  },
  {
    label: 'Manage Books',
    description: 'Edit book catalog',
    icon: FileText,
    href: '/staff/books',
    color: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400'
  },
  {
    label: 'Import Students',
    description: 'Bulk CSV import',
    icon: Upload,
    href: '/staff/students?action=import',
    color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
  },
  {
    label: 'Settings',
    description: 'Configure system',
    icon: Settings,
    href: '/staff/settings',
    color: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-400'
  },
]

export function QuickActionsCard() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Button
                key={action.label}
                variant="outline"
                className={`h-auto flex-col items-start py-4 px-4 rounded-lg border-dashed ${action.color} transition-all hover:scale-105`}
                onClick={() => router.push(action.href)}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="font-semibold text-sm">{action.label}</span>
                <span className="text-xs opacity-75 mt-1">{action.description}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
