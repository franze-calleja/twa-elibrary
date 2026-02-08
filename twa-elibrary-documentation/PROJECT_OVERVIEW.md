# TWA E-Library System - Project Overview

## Project Description
A comprehensive e-library management system designed for university use, enabling efficient book tracking, student management, and borrowing operations through barcode scanning technology.

## Target Users
- **Staff**: Librarians and administrative personnel
- **Students**: University students with borrowing privileges

## Core Features

### Staff Module
1. **Book Management**
   - Register new books in the system
   - Generate barcodes for books (primary method)
   - Scan existing book barcodes
   - Update book information and status
   - Monitor book availability and location
   - View complete book history (borrowing records, maintenance, etc.)
   - Track damaged or lost books

2. **Student Management**
   - Pre-register students for system access
   - Bulk upload student data via CSV
   - Manage student accounts (activate/deactivate)
   - View individual student profiles
   - Monitor student borrowing patterns
   - Check student borrowing history and current loans

3. **System Administration**
   - Dashboard with key metrics
   - Generate reports (borrowing statistics, overdue books, etc.)
   - Configure system settings (borrowing limits, loan periods)
   - Manage staff accounts and permissions

### Student Module
1. **Account Management**
   - View and update personal information
   - Change password
   - View account status and borrowing limits

2. **Book Borrowing**
   - Scan book barcode to initiate borrowing
   - View available books catalog
   - Search and filter books
   - Request book renewals
   - Return books (scan confirmation)

3. **Personal Library**
   - View currently borrowed books
   - View borrowing history
   - Track due dates and overdue status
   - View fines and penalties

## System Workflow

### Book Registration Flow (Staff)
1. Staff scans existing barcode OR manually enters book details
2. If no barcode exists, system generates a unique barcode
3. Book details are saved to database
4. Barcode is printed/displayed for physical labeling
5. Book status set to "Available"

### Student Pre-registration Flow (Staff)
1. Staff uploads CSV file with student data OR manually adds students
2. System validates data and creates student accounts
3. Temporary passwords generated and sent to students
4. Students receive activation email/notification

### Book Borrowing Flow (Student)
1. Student logs into system
2. Student scans book barcode (or staff scans on behalf)
3. System checks:
   - Book availability
   - Student borrowing eligibility
   - Outstanding fines
   - Borrowing limit
4. If approved, transaction is recorded
5. Due date is calculated and displayed
6. Receipt/confirmation is generated

### Book Return Flow
1. Book barcode is scanned
2. System validates the loan record
3. Checks for damages or late fees
4. Updates book status to "Available"
5. Updates student borrowing record

## Technical Architecture

### Tech Stack
- **Frontend & Backend**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: MySQL (TiDB Cloud - free tier)
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios
- **Hosting**: Vercel (free tier)

### Key Libraries & Tools
- **Barcode Generation**: `react-barcode` or `bwip-js`
- **Barcode Scanning**: `@zxing/browser` or `quagga2`
- **Form Validation**: `zod` + `react-hook-form`
- **Date Handling**: `date-fns`
- **CSV Processing**: `papaparse`
- **Authentication**: NextAuth.js or custom JWT
- **File Upload**: Built-in Next.js API routes

## Database Schema (High-Level)

### Core Tables
1. **Users** - Staff and student accounts
2. **Books** - Book catalog and inventory
3. **Categories** - Book categorization
4. **Transactions** - Borrowing records
5. **Reservations** - Book reservation queue
6. **Fines** - Penalty records
7. **Settings** - System configuration
8. **AuditLogs** - System activity tracking

## Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- Barcode scan response < 1 second
- Support 1000+ concurrent users

### Security
- Role-based access control (RBAC)
- Secure password storage (bcrypt)
- JWT token authentication
- SQL injection prevention (Prisma)
- XSS protection

### Scalability
- Designed for 10,000+ books
- 5,000+ student accounts
- Optimized database queries
- Efficient caching strategy

### Usability
- Mobile-responsive design
- Intuitive barcode scanning interface
- Clear error messages
- Accessibility compliance (WCAG 2.1)

## Deployment Strategy

### Development Environment
- Local MySQL or TiDB Cloud
- Local Next.js development server
- Prisma Studio for database management

### Production Environment
- **Frontend & API**: Vercel
- **Database**: TiDB Cloud (MySQL compatible)
- **Environment Variables**: Vercel Environment Variables
- **Monitoring**: Vercel Analytics

## Future Enhancements
- Email notifications for due dates
- SMS reminders
- Book recommendations based on borrowing history
- E-book integration
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with university student information system
