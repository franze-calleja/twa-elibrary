/**
 * Staff Layout with Sidebar Navigation
 */

'use client'

import { useLogout } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowRightLeft, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MoreVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/staff/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Books',
    href: '/staff/books',
    icon: BookOpen
  },
  {
    title: 'Students',
    href: '/staff/students',
    icon: Users
  },
  {
    title: 'Transactions',
    href: '/staff/transactions',
    icon: ArrowRightLeft
  },
  {
    title: 'Settings',
    href: '/staff/settings',
    icon: Settings
  }
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const logout = useLogout()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    logout.mutate()
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar_collapsed')
      if (stored !== null) setSidebarCollapsed(stored === 'true')
    } catch (e) {
      // ignore
    }
  }, [])

  function toggleCollapse() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sidebar_collapsed', String(next))
      } catch (e) {
        // ignore
      }
      return next
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-card border-r transform transition-all duration-200 ease-in-out lg:translate-x-0",
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                {!sidebarCollapsed && (
                  <Image src="/digital-library-seal.png" alt="Tayabas Digital Library" width={36} height={36} className="rounded-full object-cover" />
                )}
                <span className={cn('font-bold text-lg transition-opacity', sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>TWA E-Library</span>
              </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex bg-white border border-slate-200 rounded-md shadow-sm"
                onClick={toggleCollapse}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Green underline under header */}
          <div className="h-1 bg-primary rounded-b-md" />

          {/* Role Badge */}
          <div className="px-4 py-3 bg-primary/10 rounded-md">
            <p className={cn('text-sm font-medium text-primary transition-opacity', sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>Staff Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  sidebarCollapsed ? 'justify-center px-2' : '',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn(sidebarCollapsed ? 'hidden' : 'inline')}>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Profile / Logout (bottom) */}
          <div className="p-4 border-t mt-auto">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.firstName ?? 'User'} />
                  ) : (
                    <AvatarFallback>{(user?.firstName || 'U')[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div className={cn('text-sm font-medium', sidebarCollapsed ? 'hidden' : 'block')}>
                  <div>{user?.firstName ? `${user.firstName} ${user.lastName ?? ''}` : 'User Name'}</div>
                </div>
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileMenu((s) => !s)}
                  aria-label="Open profile menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 bottom-10 z-50 w-44 rounded-md bg-white border border-slate-200 shadow-md py-1">
                    <a href="/staff/profile" className="block px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setShowProfileMenu(false)}>View profile</a>
                    <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => { setShowProfileMenu(false); handleLogout(); }}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
