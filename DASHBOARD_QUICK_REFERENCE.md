# Staff Dashboard Quick Reference

## 🎯 Quick Start

### Import Everything You Need
```typescript
import { useDashboard } from '@/hooks/useDashboard'
import { useDashboardStore } from '@/store/dashboardStore'
```

### Basic Dashboard Component
```typescript
export default function Dashboard() {
  const { stats, isLoading } = useDashboard()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>Total Books: {stats.data?.totalBooks}</h1>
    </div>
  )
}
```

---

## 📊 Available Hooks

| Hook | Purpose | Auto-Refetch | Params |
|------|---------|--------------|--------|
| `useDashboardStats()` | Overall statistics | Every 5 min | None |
| `useRecentActivities()` | Recent transactions | Every 2 min | `{ limit? }` |
| `useOverdueBooks()` | Overdue transactions | Every 2 min | `{ page?, limit? }` |
| `usePendingRequests()` | Pending approvals | Every 1 min | `{ page?, limit? }` |
| `useDashboard()` | All of the above | Varies | None |

---

## 🔌 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/dashboard/stats` | GET | STAFF | Get statistics |
| `/api/dashboard/recent-activities` | GET | STAFF | Recent activities |
| `/api/dashboard/overdue-books` | GET | STAFF | Overdue list |
| `/api/dashboard/pending-requests` | GET | STAFF | Pending requests |

---

## 📦 Data Structures

### DashboardStats
```typescript
{
  totalBooks: number
  availableBooks: number
  borrowedBooks: number
  totalUsers: number
  activeStudents: number
  activeTransactions: number
  overdueTransactions: number
  totalFines: number
  unpaidFines: number
}
```

### TransactionWithDetails
```typescript
{
  id: string
  status: TransactionStatus
  borrowedAt: Date
  dueDate: Date
  returnedAt: Date | null
  requestedDays: number
  book: {
    id: string
    title: string
    author: string
    barcode: string
    coverImage: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    studentId: string
    avatar: string
  }
  fine?: Fine
}
```

---

## 🗄️ Store Actions

### View Management
```typescript
const { currentView, setCurrentView } = useDashboardStore()

setCurrentView('overview')  // 'overview' | 'pending' | 'overdue' | 'recent'
```

### Filters
```typescript
const { filters, setPeriod, setSearchQuery, resetFilters } = useDashboardStore()

setPeriod('week')           // 'today' | 'week' | 'month' | 'all'
setSearchQuery('search...')
resetFilters()
```

### Preferences
```typescript
const { preferences, toggleAutoRefresh, setRefreshInterval } = useDashboardStore()

toggleAutoRefresh()
setRefreshInterval(60)      // seconds
```

---

## 💡 Common Patterns

### Stats Card
```typescript
function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

// Usage
<StatsCard 
  label="Total Books" 
  value={stats.data?.totalBooks} 
  icon={<BookOpen />} 
/>
```

### Recent Activities List
```typescript
function RecentActivities() {
  const { data } = useRecentActivities({ limit: 5 })
  
  return (
    <ul>
      {data?.activities.map(activity => (
        <li key={activity.id}>
          <Avatar src={activity.user.avatar} />
          <div>
            <p>{activity.user.firstName} {activity.user.lastName}</p>
            <p className="text-sm">Borrowed "{activity.book.title}"</p>
            <p className="text-xs">{formatDistance(activity.borrowedAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

### Overdue Table
```typescript
function OverdueTable() {
  const [page, setPage] = useState(1)
  const { data } = useOverdueBooks({ page, limit: 10 })
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Book</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Days Overdue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.overdueBooks.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.user.firstName}</TableCell>
              <TableCell>{transaction.book.title}</TableCell>
              <TableCell>{format(transaction.dueDate, 'MMM dd')}</TableCell>
              <TableCell>{getDaysOverdue(transaction.dueDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination {...data?.pagination} onPageChange={setPage} />
    </>
  )
}
```

### Pending Requests with Actions
```typescript
function PendingRequests() {
  const { data, refetch } = usePendingRequests({ limit: 10 })
  const approveRequest = useProcessBorrowRequest()
  
  const handleApprove = async (id: string) => {
    await approveRequest.mutateAsync({
      transactionId: id,
      action: 'approve'
    })
    refetch()
  }
  
  return (
    <div>
      {data?.pendingRequests.map(request => (
        <Card key={request.id}>
          <p>{request.user.firstName} wants to borrow</p>
          <p>{request.book.title}</p>
          <Button onClick={() => handleApprove(request.id)}>
            Approve
          </Button>
        </Card>
      ))}
    </div>
  )
}
```

### Auto-Refresh Indicator
```typescript
function AutoRefreshStatus() {
  const { preferences, toggleAutoRefresh } = useDashboardStore()
  
  return (
    <Button 
      variant={preferences.autoRefresh ? 'default' : 'outline'}
      onClick={toggleAutoRefresh}
    >
      {preferences.autoRefresh ? '🔄 Auto-refresh ON' : 'Auto-refresh OFF'}
    </Button>
  )
}
```

---

## 🎨 UI Component Structure

```
DashboardPage
├── Header
│   ├── Title
│   ├── RefreshButton
│   └── Settings
├── StatsGrid (4 columns)
│   ├── TotalBooksCard
│   ├── ActiveTransactionsCard
│   ├── OverdueCard
│   └── PendingCard
├── TabsOrViews
│   ├── Overview
│   │   ├── RecentActivities
│   │   ├── QuickStats
│   │   └── Alerts
│   ├── PendingRequests
│   │   ├── RequestsTable
│   │   └── Actions
│   ├── OverdueBooks
│   │   ├── OverdueTable
│   │   └── ContactActions
│   └── RecentActivities
│       └── ActivitiesList
└── Footer
```

---

## 🔄 Refresh Strategies

### Manual Refresh
```typescript
const { refetchAll } = useDashboard()

<Button onClick={refetchAll}>Refresh All</Button>
```

### Individual Refresh
```typescript
const stats = useDashboardStats()
const activities = useRecentActivities()

<Button onClick={() => stats.refetch()}>Refresh Stats</Button>
<Button onClick={() => activities.refetch()}>Refresh Activities</Button>
```

### Auto-Refresh with Interval
```typescript
const { preferences } = useDashboardStore()
const { refetchAll } = useDashboard()

useEffect(() => {
  if (!preferences.autoRefresh) return
  
  const interval = setInterval(refetchAll, preferences.refreshInterval * 1000)
  return () => clearInterval(interval)
}, [preferences.autoRefresh, preferences.refreshInterval, refetchAll])
```

---

## 🎯 Implementation Checklist

Dashboard UI components to build:

- [ ] **StatsGrid** - 4 stat cards (books, transactions, overdue, pending)
- [ ] **RecentActivities** - List of recent transactions
- [ ] **OverdueTable** - Table of overdue books with student info
- [ ] **PendingRequests** - List with approve/reject actions
- [ ] **QuickActions** - Common staff actions
- [ ] **SearchBar** - Global dashboard search
- [ ] **FilterPanel** - Date range, status filters
- [ ] **RefreshButton** - Manual refresh trigger
- [ ] **SettingsMenu** - Auto-refresh, notifications, view preferences
- [ ] **Charts** - Transaction trends, popular books
- [ ] **Alerts** - Important notifications

---

## 📝 Example: Complete Dashboard

See [`STAFF_DASHBOARD_BACKEND.md`](./STAFF_DASHBOARD_BACKEND.md) for complete implementation example.

---

**Ready to build?** All backend infrastructure is in place! 🚀
