/**
 * Student Quick Actions Card Component
 * Provides quick navigation to common student actions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, History, User, QrCode, Bell, Heart, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LucideIcon } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Browse Books',
    description: 'Explore our collection',
    icon: Search,
    href: '/student/books',
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
  },
  {
    title: 'Scan Barcode',
    description: 'Quick borrow via QR',
    icon: QrCode,
    href: '/student/scan',
    color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
  },
  {
    title: 'My Books',
    description: 'View borrowed books',
    icon: BookOpen,
    href: '/student/my-books',
    color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
  },
  {
    title: 'History',
    description: 'Borrowing history',
    icon: History,
    href: '/student/history',
    color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
  },
  {
    title: 'Favorites',
    description: 'Saved books',
    icon: Heart,
    href: '/student/favorites',
    color: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'
  },
  {
    title: 'Notifications',
    description: 'View alerts',
    icon: Bell,
    href: '/student/notifications',
    color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
  },
  {
    title: 'Profile',
    description: 'Manage account',
    icon: User,
    href: '/student/profile',
    color: 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
  },
  {
    title: 'Settings',
    description: 'Preferences',
    icon: Settings,
    href: '/student/settings',
    color: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
]

export function StudentQuickActionsCard() {
  const router = useRouter()

  const handleAction = (href: string) => {
    router.push(href)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Access common tasks and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.title}
                onClick={() => handleAction(action.href)}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:border-primary transition-colors group"
              >
                <div className={`p-3 rounded-lg ${action.color} transition-colors`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
