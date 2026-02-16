# Dashboard Quick Test Guide

## 🧪 Testing the Dashboard

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Staff Dashboard
```
http://localhost:3000/staff/dashboard
```

### 3. What You Should See

#### Welcome Section
- Personalized greeting: "Welcome back, {FirstName}!"
- Subtitle: "Here's what's happening in your library today."
- Refresh button in top right

#### Stats Grid (8 Cards)
- Total Books (with available count)
- Available Books (with borrowed count)
- Borrowed Books (with active loans)
- Total Users (with active students)
- Active Students
- Active Transactions
- Overdue Books (alerts)
- Total Fines (with unpaid amount)

#### Quick Actions (8 Buttons)
- All buttons clickable and navigate to correct routes
- Color-coded with icons
- Hover effects working

#### Two Column Section
**Left - Recent Activities**:
- Shows last 10 transactions
- Color-coded by type (borrow=blue, return=green, etc.)
- Relative timestamps
- Scrollable if more than 5 activities

**Right - Pending Requests**:
- Shows borrow requests awaiting approval
- Student avatars and names
- Book titles
- Approve/Reject buttons (handlers TBD)

#### Overdue Books Table
- Full-width table
- Shows book, student, due date, days overdue, fine
- Direct links to transaction details
- Shows "No overdue books" if none

### 4. Test Auto-Refresh

The dashboard auto-refreshes at different intervals:
- **Stats**: Every 5 minutes
- **Activities**: Every 2 minutes
- **Overdue Books**: Every 2 minutes
- **Pending Requests**: Every 1 minute

Or click the **Refresh button** to manually refresh all data.

### 5. Check Loading States

On slow connections, you should see skeleton loaders for:
- Stats cards (8 skeletons)
- Activity feed (5 skeletons)
- Pending requests (5 skeletons)
- Overdue table (5 rows)

### 6. Test Empty States

If there's no data, you should see friendly empty state messages:
- Activities: Book icon + "No recent activity to display"
- Pending Requests: Clock icon + "No pending requests at the moment"  
- Overdue Books: Alert icon + "No overdue books! Everything is on track."

### 7. Responsive Testing

Test on different screen sizes:
- **Mobile**: All cards stack vertically
- **Tablet**: 2-column stats grid
- **Desktop**: 4-column stats grid, side-by-side activities/requests

### 8. Navigation Testing

Click each quick action button and verify navigation:
- ✅ Add New Book → `/staff/books?action=new`
- ✅ Register Student → `/staff/students?action=register`
- ✅ Scan Barcode → `/staff/transactions?action=scan`
- ✅ Process Transaction → `/staff/transactions`
- ✅ View Reports → `/staff/reports`
- ✅ Manage Books → `/staff/books`
- ✅ Import Students → `/staff/students?action=import`
- ✅ Settings → `/staff/settings`

## 🔍 Debugging

### If Stats Don't Load

1. Check browser console for errors
2. Verify API endpoint is running: `http://localhost:3000/api/dashboard/stats`
3. Check database connection
4. Verify staff authentication token

### If Activities Are Empty

1. Check if there are transactions in the database
2. Run: `http://localhost:3000/api/dashboard/recent-activities`
3. Verify transactions have proper relations (book, user)

### If Overdue Books Don't Show

1. Check if there are overdue transactions
2. Run SQL: `SELECT * FROM Transaction WHERE dueDate < NOW() AND status IN ('ACTIVE', 'OVERDUE')`
3. Verify: `http://localhost:3000/api/dashboard/overdue-books`

## ✅ Expected Behavior Checklist

Dashboard should:
- [ ] Load within 2 seconds on initial visit
- [ ] Show real data from database
- [ ] Auto-refresh at specified intervals
- [ ] Manual refresh works
- [ ] All navigation links work
- [ ] Responsive on all screen sizes
- [ ] Loading states appear when fetching
- [ ] Empty states show when no data
- [ ] Error alerts show if API fails
- [ ] Timestamps are relative ("2 hours ago")
- [ ] Numbers are formatted with commas (1,234)
- [ ] Currency shows Philippine Peso symbol (₱)

## 🎯 Success Criteria

✅ **Dashboard is ready for production if**:
1. All API endpoints return data successfully
2. All components render without errors
3. Auto-refresh works correctly
4. No TypeScript compilation errors
5. Responsive design works on mobile/tablet/desktop
6. Quick actions navigate correctly
7. Loading and empty states display properly

---

**Happy Testing!** 🚀
