# Staff Dashboard - Backend Infrastructure

> Complete backend infrastructure for the staff dashboard including API routes, hooks, and state management.

---

## 📊 Overview

The staff dashboard provides:
- **Real-time statistics** - Books, users, transactions, fines
- **Recent activities** - Latest transactions and events
- **Overdue books** - Books past their due date
- **Pending requests** - Student borrow requests awaiting approval

---

## 🔌 API Routes

All dashboard endpoints require **STAFF** authentication.

### 1. Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Description:** Get overall dashboard statistics

**Response:**
```typescript
{
  success: true,
  data: {
    totalBooks: number           // Total book quantity
    availableBooks: number       // Books available for borrowing
    borrowedBooks: number        // Currently borrowed books
    totalUsers: number           // All users (staff + students)
    activeStudents: number       // Active student accounts
    activeTransactions: number   // Currently active borrows
    overdueTransactions: number  // Overdue books count
    totalFines: number           // Total fines amount
    unpaidFines: number          // Unpaid fines amount
  }
}
```

**Features:**
- ✅ Parallel database queries for optimal performance
- ✅ Aggregations for accurate counts
- ✅ Real-time data

---

### 2. Recent Activities

**Endpoint:** `GET /api/dashboard/recent-activities`

**Description:** Get recent transactions/activities

**Query Parameters:**
- `limit` (optional) - Number of activities to return (default: 10)

**Response:**
```typescript
{
  success: true,
  data: {
    activities: TransactionWithDetails[]
    total: number
  }
}
```

**Each activity includes:**
- Transaction details (id, status, dates, etc.)
- Book information (title, author, barcode, cover)
- User information (name, email, studentId, avatar)

---

### 3. Overdue Books

**Endpoint:** `GET /api/dashboard/overdue-books`

**Description:** Get list of overdue transactions

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```typescript
{
  success: true,
  data: {
    overdueBooks: TransactionWithDetails[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

**Features:**
- ✅ Sorted by oldest overdue first
- ✅ Includes fine information if applicable
- ✅ Paginated results

---

### 4. Pending Requests

**Endpoint:** `GET /api/dashboard/pending-requests`

**Description:** Get pending borrow requests awaiting staff approval

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```typescript
{
  success: true,
  data: {
    pendingRequests: TransactionWithDetails[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

**Features:**
- ✅ Includes book availability status
- ✅ Includes student status and borrowing limit
- ✅ Sorted by oldest requests first

---

## 🪝 React Hooks

Located in: [`hooks/useDashboard.ts`](../hooks/useDashboard.ts)

All hooks use **TanStack Query** for caching, automatic refetching, and loading states.

### 1. `useDashboardStats()`

Fetch overall dashboard statistics.

```typescript
import { useDashboardStats } from '@/hooks/useDashboard'

function StatsComponent() {
  const { data, isLoading, error, refetch } = useDashboardStats()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />
  
  return (
    <div>
      <h3>Total Books: {data.totalBooks}</h3>
      <h3>Active Transactions: {data.activeTransactions}</h3>
      {/* ... */}
    </div>
  )
}
```

**Auto-refetch:** Every 5 minutes  
**Stale time:** 1 minute

---

### 2. `useRecentActivities(params?)`

Fetch recent activities/transactions.

```typescript
import { useRecentActivities } from '@/hooks/useDashboard'

function RecentActivitiesComponent() {
  const { data, isLoading } = useRecentActivities({ limit: 10 })
  
  return (
    <ul>
      {data?.activities.map(activity => (
        <li key={activity.id}>
          {activity.book.title} - {activity.user.firstName}
        </li>
      ))}
    </ul>
  )
}
```

**Parameters:**
- `limit` - Number of activities (default: 10)

**Auto-refetch:** Every 2 minutes  
**Stale time:** 30 seconds

---

### 3. `useOverdueBooks(params?)`

Fetch overdue books/transactions.

```typescript
import { useOverdueBooks } from '@/hooks/useDashboard'

function OverdueBooksComponent() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOverdueBooks({ page, limit: 20 })
  
  return (
    <div>
      <Table data={data?.overdueBooks} />
      <Pagination {...data?.pagination} onPageChange={setPage} />
    </div>
  )
}
```

**Parameters:**
- `page` - Page number
- `limit` - Items per page

**Auto-refetch:** Every 2 minutes  
**Stale time:** 30 seconds

---

### 4. `usePendingRequests(params?)`

Fetch pending borrow requests.

```typescript
import { usePendingRequests } from '@/hooks/useDashboard'

function PendingRequestsComponent() {
  const { data, isLoading, refetch } = usePendingRequests({ limit: 5 })
  
  const handleApprove = async (id: string) => {
    // Approve logic...
    await refetch() // Refresh the list
  }
  
  return (
    <div>
      <h3>Pending: {data?.pagination.total}</h3>
      {/* Render requests... */}
    </div>
  )
}
```

**Parameters:**
- `page` - Page number
- `limit` - Items per page

**Auto-refetch:** Every 1 minute  
**Stale time:** 15 seconds

---

### 5. `useDashboard()` - Combined Hook

Fetch all dashboard data at once.

```typescript
import { useDashboard } from '@/hooks/useDashboard'

function DashboardPage() {
  const {
    stats,
    recentActivities,
    overdueBooks,
    pendingRequests,
    isLoading,
    refetchAll
  } = useDashboard()
  
  if (isLoading) return <LoadingScreen />
  
  return (
    <div>
      <StatsGrid data={stats.data} />
      <RecentActivities data={recentActivities.data} />
      <OverdueBooks data={overdueBooks.data} />
      <PendingRequests data={pendingRequests.data} />
      
      <Button onClick={refetchAll}>Refresh All</Button>
    </div>
  )
}
```

**Returns:**
- `stats` - Statistics data and state
- `recentActivities` - Recent activities data and state
- `overdueBooks` - Overdue books data and state
- `pendingRequests` - Pending requests data and state
- `isLoading` - True if ANY query is loading
- `refetchAll()` - Refetch all queries

---

## 🗄️ Zustand Store

Located in: [`store/dashboardStore.ts`](../store/dashboardStore.ts)

Manages dashboard UI state, filters, and user preferences.

### State Structure

```typescript
{
  currentView: 'overview' | 'pending' | 'overdue' | 'recent'
  
  filters: {
    period: 'today' | 'week' | 'month' | 'all'
    searchQuery: string
    statusFilter: string[]
  }
  
  preferences: {
    autoRefresh: boolean
    refreshInterval: number      // seconds
    showNotifications: boolean
    compactView: boolean
  }
}
```

### Usage Examples

#### Change Current View
```typescript
import { useDashboardStore } from '@/store/dashboardStore'

function Navigation() {
  const { currentView, setCurrentView } = useDashboardStore()
  
  return (
    <nav>
      <button onClick={() => setCurrentView('overview')}>
        Overview
      </button>
      <button onClick={() => setCurrentView('pending')}>
        Pending Requests
      </button>
    </nav>
  )
}
```

#### Manage Filters
```typescript
import { useDashboardStore } from '@/store/dashboardStore'

function Filters() {
  const { filters, setPeriod, setSearchQuery, resetFilters } = useDashboardStore()
  
  return (
    <div>
      <select value={filters.period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="all">All Time</option>
      </select>
      
      <input 
        value={filters.searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      
      <button onClick={resetFilters}>Reset</button>
    </div>
  )
}
```

#### User Preferences
```typescript
import { useDashboardStore } from '@/store/dashboardStore'

function Settings() {
  const { 
    preferences, 
    toggleAutoRefresh, 
    toggleCompactView,
    setRefreshInterval 
  } = useDashboardStore()
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={preferences.autoRefresh}
          onChange={toggleAutoRefresh}
        />
        Auto-refresh dashboard
      </label>
      
      <label>
        <input 
          type="checkbox" 
          checked={preferences.compactView}
          onChange={toggleCompactView}
        />
        Compact view
      </label>
      
      <select 
        value={preferences.refreshInterval}
        onChange={(e) => setRefreshInterval(Number(e.target.value))}
      >
        <option value={30}>30 seconds</option>
        <option value={60}>1 minute</option>
        <option value={300}>5 minutes</option>
      </select>
    </div>
  )
}
```

#### Selectors (Performance Optimization)
```typescript
import { useDashboardStore, selectAutoRefresh, selectFilters } from '@/store/dashboardStore'

// Only re-renders when autoRefresh changes
function AutoRefreshIndicator() {
  const autoRefresh = useDashboardStore(selectAutoRefresh)
  
  return autoRefresh ? <span>🔄 Auto-refresh ON</span> : null
}

// Only re-renders when filters change
function FilterDisplay() {
  const filters = useDashboardStore(selectFilters)
  
  return <div>Period: {filters.period}</div>
}
```

---

## 📝 Complete Dashboard Example

```typescript
'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { useDashboardStore } from '@/store/dashboardStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StaffDashboardPage() {
  const {
    stats,
    recentActivities,
    overdueBooks,
    pendingRequests,
    isLoading,
    refetchAll
  } = useDashboard()
  
  const { preferences, toggleAutoRefresh } = useDashboardStore()
  
  if (isLoading) return <LoadingScreen />
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1>Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={refetchAll}>Refresh</Button>
          <Button 
            variant={preferences.autoRefresh ? 'default' : 'outline'}
            onClick={toggleAutoRefresh}
          >
            Auto-refresh: {preferences.autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <h3>Total Books</h3>
          <p className="text-3xl">{stats.data?.totalBooks}</p>
        </Card>
        <Card>
          <h3>Active Transactions</h3>
          <p className="text-3xl">{stats.data?.activeTransactions}</p>
        </Card>
        <Card>
          <h3>Overdue</h3>
          <p className="text-3xl text-red-600">
            {stats.data?.overdueTransactions}
          </p>
        </Card>
        <Card>
          <h3>Pending Requests</h3>
          <p className="text-3xl text-yellow-600">
            {pendingRequests.data?.pagination.total}
          </p>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <Card>
        <h2>Recent Activities</h2>
        <ul>
          {recentActivities.data?.activities.map(activity => (
            <li key={activity.id}>
              {activity.user.firstName} borrowed "{activity.book.title}"
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Overdue Books */}
      <Card>
        <h2>Overdue Books ({overdueBooks.data?.pagination.total})</h2>
        <table>
          {/* Render overdue books... */}
        </table>
      </Card>
      
      {/* Pending Requests */}
      <Card>
        <h2>Pending Requests ({pendingRequests.data?.pagination.total})</h2>
        <table>
          {/* Render pending requests... */}
        </table>
      </Card>
    </div>
  )
}
```

---

## 🚀 Next Steps

1. ✅ API routes created and tested
2. ✅ Hooks implemented with TanStack Query
3. ✅ Store created with Zustand
4. ⏳ Build UI components using the hooks
5. ⏳ Add charts and visualizations
6. ⏳ Implement real-time notifications
7. ⏳ Add export functionality (PDF/CSV)

---

## 📚 Related Documentation

- [API Specification](../twa-elibrary-documentation/API_SPECIFICATION.md)
- [Database Schema](../twa-elibrary-documentation/DATABASE_SCHEMA.md)
- [Types Reference](../types/index.ts)
- [Copilot Instructions](../.github/copilot-instructions.md)

---

**Last Updated:** February 15, 2026  
**Status:** ✅ Backend Complete - Ready for UI Implementation
