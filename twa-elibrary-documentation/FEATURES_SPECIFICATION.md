# Features Specification

## Detailed Feature Requirements

---

## 1. Authentication & Authorization

### 1.1 User Login
**Actors**: Staff, Students

**Flow**:
1. User enters email and password
2. System validates credentials
3. System generates JWT token
4. User redirected to appropriate dashboard based on role

**Validation**:
- Email format must be valid
- Password minimum 8 characters
- Account must be ACTIVE status

**Success Criteria**:
- Token stored securely
- Session persists across page refreshes
- Redirect to correct dashboard based on role

**Error Handling**:
- Invalid credentials → "Invalid email or password"
- Inactive account → "Your account has been deactivated"
- Suspended account → "Your account is suspended. Contact administrator"

---

### 1.2 Student Registration
**Actors**: Students

**Pre-requisites**:
- Student must be pre-registered by staff
- Student has activation code

**Flow**:
1. Student enters email, student ID, activation code
2. System validates pre-registration
3. Student creates password
4. Account activated
5. Welcome email sent (future)

**Validation**:
- Email matches pre-registered email
- Student ID matches records
- Activation code valid and not expired
- Password meets requirements (min 8 chars, 1 uppercase, 1 number)

---

### 1.3 Password Management
**Actors**: Staff, Students

**Features**:
- Change password (requires old password)
- Reset password via email (future enhancement)
- Password strength indicator

---

## 2. Book Management (Staff)

### 2.1 Add New Book

#### Method 1: Scan Existing Barcode
**Flow**:
1. Staff clicks "Add Book"
2. Staff clicks "Scan Barcode"
3. Camera activates
4. Staff scans book's existing barcode
5. System checks if barcode exists in database
6. If new, form pre-fills with barcode
7. Staff fills remaining details
8. System saves book

#### Method 2: Generate New Barcode
**Flow**:
1. Staff clicks "Add Book"
2. Staff fills book details
3. System auto-generates unique barcode
4. Staff reviews and saves
5. Barcode displayed for printing/labeling

**Required Fields**:
- Title
- Author
- At least one category
- Quantity

**Optional Fields**:
- ISBN
- Publisher
- Publication year
- Edition
- Description
- Cover image
- Location (shelf number)

**Barcode Generation**:
- Format: CODE128
- Pattern: `LIB-{YEAR}-{SEQUENCE}` (e.g., LIB-2026-00001)
- Ensure uniqueness
- Store as PNG/SVG for printing

**Success Criteria**:
- Book saved to database
- Barcode generated/validated
- Available quantity equals total quantity
- Status set to AVAILABLE
- Audit log created

---

### 2.2 View Books List
**Features**:
- Paginated table view
- Grid view option
- Sort by: Title, Author, Date Added, Status
- Filter by:
  - Category
  - Status (Available, Borrowed, Maintenance, etc.)
  - Availability
  - Location

**Search**:
- Search by title, author, ISBN, barcode
- Real-time search results
- Debounced input

**Display**:
- Cover image thumbnail
- Title, Author
- Status badge
- Available/Total quantity
- Quick actions (Edit, View, Delete)

---

### 2.3 View Book Details
**Information Displayed**:
- Complete book information
- Cover image
- Current status
- Total and available copies
- Current borrowers (if borrowed)
- Borrowing history
- Reservation queue (if any)
- Barcode image (downloadable/printable)

**Actions Available**:
- Edit book
- Update status
- Generate new barcode
- View full history
- Delete book (if no active transactions)

---

### 2.4 Edit Book
**Editable Fields**:
- All book details
- Cannot change barcode (must generate new)
- Can update quantity (affects availability)

**Validation**:
- Cannot reduce quantity below borrowed amount
- Cannot delete if active transactions exist

**Audit Trail**:
- Log all changes to BookHistory
- Track who made changes and when

---

### 2.5 Delete Book
**Conditions**:
- No active transactions
- No pending reservations
- Requires confirmation

**Options**:
- Hard delete (remove from database)
- Soft delete (mark as inactive - future)

---

### 2.6 Book Status Management

**Statuses**:
- **AVAILABLE**: Ready to be borrowed
- **BORROWED**: Currently on loan
- **RESERVED**: Reserved by student(s)
- **MAINTENANCE**: Under repair/processing
- **LOST**: Marked as lost
- **DAMAGED**: Damaged and unavailable

**Status Update**:
- Staff can manually update status
- System auto-updates on borrow/return
- Status change logged in history

---

### 2.7 Book History
**Track**:
- All borrowing records
- Status changes
- Edit history
- Who performed actions
- Timestamps

**Display**:
- Timeline view
- Filterable by action type
- Exportable to CSV

---

## 3. Student Management (Staff)

### 3.1 Pre-register Students

#### Single Student Entry
**Flow**:
1. Staff clicks "Add Student"
2. Form with fields appears
3. Staff enters student information
4. System generates activation code
5. Student account created in INACTIVE status
6. Activation details shown/sent to student

**Required Fields**:
- Email (must be unique)
- Student ID (must be unique)
- First name
- Last name
- Program/Course
- Year level

**Optional Fields**:
- Phone number
- Custom borrowing limit
- Profile photo

**System Actions**:
- Generate unique activation code
- Set default borrowing limit (from settings)
- Send activation email (future)
- Create audit log

---

#### Bulk CSV Import
**CSV Format**:
```csv
email,studentId,firstName,lastName,program,yearLevel,phone
john@student.edu,2024-12345,John,Doe,Computer Science,1,+1234567890
jane@student.edu,2024-12346,Jane,Smith,Engineering,2,
```

**Flow**:
1. Staff clicks "Import Students"
2. Downloads CSV template
3. Fills template with student data
4. Uploads CSV file
5. System validates each row
6. Shows preview with validation results
7. Staff confirms import
8. System processes valid rows
9. Shows success/error report

**Validation per Row**:
- Email format and uniqueness
- Student ID format and uniqueness
- Required fields present
- Year level is valid number (1-5)

**Error Handling**:
- Skip invalid rows
- Report errors with row numbers
- Import valid rows
- Generate error report for download

**Success Report**:
- Total rows processed
- Successfully imported
- Failed imports with reasons
- Download detailed report

---

### 3.2 View Students List
**Display**:
- Paginated table
- Photo, Name, Student ID
- Program, Year Level
- Status badge
- Borrowing stats (current/limit)
- Quick actions

**Filters**:
- Status (Active, Inactive, Suspended)
- Program
- Year level
- Has outstanding fines
- Has overdue books

**Search**:
- By name, student ID, email

**Sort**:
- Name, Student ID, Program, Join Date

---

### 3.3 View Student Details
**Information Tabs**:

**1. Profile Tab**:
- Personal information
- Contact details
- Account status
- Borrowing limit
- Join date

**2. Current Loans Tab**:
- Books currently borrowed
- Due dates
- Overdue status
- Option to send reminder

**3. History Tab**:
- Complete borrowing history
- Past transactions
- Returned books
- Dates and durations

**4. Fines Tab**:
- Outstanding fines
- Paid fines
- Fine history
- Payment records

**5. Reservations Tab**:
- Active reservations
- Reservation queue position
- Past reservations

**Actions Available**:
- Edit student profile
- Adjust borrowing limit
- Suspend/Activate account
- Waive fines
- View detailed history

---

### 3.4 Manage Student Account
**Actions**:

**Activate Account**:
- Change status from INACTIVE to ACTIVE
- Student can now login and borrow

**Suspend Account**:
- Temporary suspension
- Cannot borrow until reactivated
- Reason required
- Can still login to view history

**Deactivate Account**:
- Student graduated/left
- Cannot login
- Requires all books returned
- All fines paid

**Adjust Borrowing Limit**:
- Custom limit per student
- Override default setting
- Reason for change (optional)

**Reset Password**:
- Generate temporary password
- Send to student email
- Force password change on next login

---

## 4. Transaction Management (Staff)

### 4.1 Process Book Borrowing

**Flow**:
1. Staff/Student scans book barcode OR searches book
2. Staff enters/scans student ID
3. System performs eligibility checks
4. If approved, system creates transaction
5. Due date calculated automatically
6. Receipt generated
7. Email confirmation sent (future)

**Eligibility Checks**:
- ✓ Book is AVAILABLE
- ✓ Student account is ACTIVE
- ✓ Student hasn't exceeded borrowing limit
- ✓ Student has no overdue books
- ✓ Student has no unpaid fines above threshold
- ✓ Book is not currently borrowed by same student

**System Actions**:
- Create Transaction record
- Set status to ACTIVE
- Calculate due date (current date + loan period from settings)
- Decrement book's availableQuantity
- Update book status if all copies borrowed
- Create audit log

**Receipt Contains**:
- Transaction ID
- Student name and ID
- Book title and barcode
- Borrowed date and time
- Due date
- Renewal count remaining
- Staff who processed

**Error Scenarios**:
- Book not found → "Invalid barcode"
- Book unavailable → "Book is currently borrowed. Reserve?"
- Student limit exceeded → "Borrowing limit reached ({current}/{max})"
- Overdue books → "Cannot borrow. Return overdue books first"
- Unpaid fines → "Cannot borrow. Pay outstanding fines first"

---

### 4.2 Process Book Return

**Flow**:
1. Staff scans book barcode
2. System identifies active transaction
3. Staff inspects book condition
4. Staff confirms return or reports damage
5. System updates transaction
6. System checks for overdue
7. If overdue, calculate fine
8. System updates book availability
9. If reserved, notify next student
10. Return receipt generated

**Book Condition Check**:
- Good condition → Normal return
- Minor damage → Note added, optional fine
- Major damage → Status to DAMAGED, fine applied
- Lost → Status to LOST, replacement fine

**Overdue Calculation**:
```
Days Overdue = Current Date - Due Date
Fine Amount = Days Overdue × Fine Per Day (from settings)
```

**System Actions**:
- Update transaction status to RETURNED
- Set returnedAt timestamp
- Increment book's availableQuantity
- Update book status to AVAILABLE (if was borrowed)
- Create Fine record if applicable
- Check reservation queue
- Notify next student if reserved
- Create audit log

**Return Receipt**:
- Transaction details
- Return date and time
- Book condition
- Fine amount (if any)
- Staff who processed

---

### 4.3 Renew Book

**Conditions**:
- Book not reserved by another student
- Maximum renewals not exceeded (from settings)
- No overdue fines
- Renewal requested before or on due date

**Flow**:
1. Student requests renewal (via app) OR staff processes
2. System checks eligibility
3. If approved, extend due date
4. Increment renewal count
5. Send confirmation

**System Actions**:
- Update due date (currentDueDate + loan period)
- Increment renewalCount
- Update transaction type to RENEW
- Create audit log
- Send notification (future)

**New Due Date Calculation**:
```
New Due Date = Current Due Date + Loan Period
```

**Maximum Renewals**:
- Read from Settings table (MAX_RENEWALS)
- Default: 2 renewals per book

---

### 4.4 View All Transactions

**Display**:
- Paginated list
- Sortable columns
- Real-time status updates

**Filters**:
- Status (Active, Returned, Overdue)
- Date range
- Student
- Book
- Staff who processed

**Columns**:
- Transaction ID
- Student name
- Book title
- Borrowed date
- Due date
- Return date
- Status badge
- Actions (View, Return, Renew)

---

### 4.5 Overdue Transactions Management

**View**:
- List of all overdue transactions
- Days overdue
- Fine amount
- Student contact info
- Quick action buttons

**Actions**:
- Send reminder (future)
- Contact student
- Process return
- Adjust fine
- Mark book as lost

**Alerts**:
- Dashboard notification of overdue count
- Email reminders to students (future)
- Escalation after X days (future)

---

## 5. Fine Management (Staff)

### 5.1 View Fines

**List View**:
- Student name
- Transaction reference
- Amount
- Reason
- Status (Unpaid, Paid, Waived)
- Issue date
- Payment date

**Filters**:
- Status
- Date range
- Amount range
- Student

**Statistics**:
- Total unpaid fines
- Total collected
- Total waived

---

### 5.2 Process Fine Payment

**Flow**:
1. Staff selects fine
2. Verifies amount with student
3. Records payment
4. Updates fine status to PAID
5. Sets payment date
6. Generates receipt
7. Updates student eligibility

**Receipt**:
- Fine ID
- Student details
- Original fine amount
- Amount paid
- Payment date
- Balance (if partial payment supported)
- Staff who processed

---

### 5.3 Waive Fine

**Conditions**:
- Staff authorization required
- Reason must be provided

**Reasons**:
- System error
- Book returned before deadline (late scanning)
- Special circumstances
- Administrative decision

**Flow**:
1. Staff selects fine
2. Enters reason for waiver
3. Confirms action
4. Fine status updated to WAIVED
5. Audit log created

---

## 6. Reports & Analytics (Staff)

### 6.1 Dashboard Statistics

**Key Metrics**:
- Total books in library
- Books available
- Books borrowed (current)
- Total students
- Active students
- Active transactions
- Overdue transactions
- Total unpaid fines

**Charts**:
- Borrowing trends (line chart - daily/weekly/monthly)
- Popular books (bar chart)
- Books by category (pie chart)
- Student activity (heat map)

**Recent Activity**:
- Latest transactions
- Recent student registrations
- Recent book additions

---

### 6.2 Borrowing Reports

**Generate Reports For**:
- Date range
- Specific student
- Specific book
- Category
- Program/Year level

**Export Formats**:
- PDF
- CSV
- Excel (future)

**Report Contents**:
- Transaction details
- Statistics summary
- Charts/visualizations

---

### 6.3 Inventory Reports

**Stock Report**:
- Total books by category
- Available vs borrowed
- Books needing replacement
- Lost/damaged books

**Popular Books**:
- Most borrowed books
- Trending books
- Never borrowed books

**Maintenance Report**:
- Books in maintenance
- Damaged books
- Lost books
- Replacement queue

---

## 7. Student Features

### 7.1 Student Dashboard

**Display**:
- Welcome message
- Currently borrowed books
- Due dates and countdown
- Overdue alerts (if any)
- Outstanding fines
- Quick actions (Browse, Scan, History)

**Stats Cards**:
- Books borrowed (current)
- Borrowing limit remaining
- Total borrowed (all-time)
- Books reserved

---

### 7.2 Browse Books Catalog

**Features**:
- Grid view with cover images
- Search by title, author, ISBN
- Filter by category
- Sort options
- Availability indicator

**Book Card**:
- Cover image
- Title and author
- Status badge
- Quick view button
- Borrow/Reserve button

**Book Details Modal**:
- Full book information
- Availability status
- Other copies location
- Similar books
- Borrow or Reserve action

---

### 7.3 Barcode Scanning (Student)

**Purpose**: Borrow books via mobile device

**Flow**:
1. Student clicks "Scan to Borrow"
2. Camera activates
3. Student scans book barcode
4. Book information displayed
5. Student confirms borrowing
6. System processes (same as staff process)
7. Confirmation shown

**Mobile Optimization**:
- Responsive camera interface
- Auto-focus
- Flash toggle
- Manual barcode entry option

**Error Handling**:
- Invalid barcode → "Book not found"
- Poor scan quality → "Try again in better lighting"
- Permission denied → "Camera access required"

---

### 7.4 My Books (Current Loans)

**Display**:
- List of currently borrowed books
- Cover images
- Title and author
- Borrowed date
- Due date with countdown
- Overdue indicator
- Renew button

**Actions per Book**:
- Renew (if eligible)
- View details
- View location

**Sorting**:
- Due date (nearest first)
- Borrowed date
- Title

---

### 7.5 Borrowing History

**Display**:
- Paginated list
- Past transactions
- Return dates
- Duration borrowed

**Filters**:
- Date range
- Category
- Returned/Current

**Statistics**:
- Total books borrowed (lifetime)
- Favorite categories
- Average borrowing duration

---

### 7.6 Account Management (Student)

**Editable Fields**:
- Phone number
- Profile photo
- Password

**View Only**:
- Name
- Student ID
- Email
- Program
- Year level
- Borrowing limit
- Account status

**Actions**:
- Change password
- Update profile photo
- Update contact info

---

## 8. Settings & Configuration (Staff)

### 8.1 System Settings

**Configurable Parameters**:

**Loan Settings**:
- Default loan period (days)
- Maximum renewals allowed
- Grace period before overdue

**Fine Settings**:
- Fine per day (overdue)
- Maximum fine cap
- Fine for damaged book
- Fine for lost book

**Borrowing Rules**:
- Default borrowing limit (students)
- Minimum fine threshold to block borrowing
- Reservation expiry hours

**Notification Settings** (Future):
- Email notifications enabled
- Reminder days before due date
- Overdue reminder frequency

**System Information**:
- Library name
- Contact email
- Operating hours
- Rules and policies

---

### 8.2 Category Management

**Actions**:
- Add new category
- Edit category
- Delete category (if no books assigned)
- Organize hierarchy (parent-child)

**Category Fields**:
- Name
- Description
- Parent category (optional)
- Icon/Color (future)

---

## 9. Advanced Features (Future Enhancements)

### 9.1 Book Reservations
- Queue system for borrowed books
- Auto-notify when available
- Reservation expiry
- Priority reservation (staff override)

### 9.2 Email Notifications
- Due date reminders
- Overdue notifications
- Reservation available
- Account activation
- Password reset

### 9.3 SMS Notifications
- Critical overdue alerts
- Same-day due date reminder

### 9.4 Advanced Analytics
- Predictive analysis for book demand
- Student reading patterns
- Recommendation engine

### 9.5 E-book Integration
- Digital library section
- PDF viewing
- Download tracking

### 9.6 Mobile App
- React Native app
- Offline barcode scanning
- Push notifications

---

## Success Criteria Summary

Each feature is considered complete when:
1. ✓ Functionality works as specified
2. ✓ Validation handles all edge cases
3. ✓ Error messages are clear and helpful
4. ✓ Responsive on mobile and desktop
5. ✓ Accessible (WCAG 2.1 AA)
6. ✓ Performance meets standards (<2s load)
7. ✓ Code reviewed and tested
8. ✓ Documentation updated
9. ✓ Audit logging implemented
10. ✓ Security verified
