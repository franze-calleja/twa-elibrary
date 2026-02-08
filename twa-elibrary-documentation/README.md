# TWA E-Library System Documentation

Complete documentation for the TWA E-Library Management System - a university library management platform with barcode scanning, book tracking, and student management capabilities.

## 📚 Documentation Index

### Core Documentation

1. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**
   - System description and features
   - User roles (Staff & Students)
   - System workflows
   - Tech stack overview
   - Non-functional requirements
   - Future enhancements

2. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**
   - Complete Prisma schema
   - Entity relationships
   - Database design decisions
   - Sample data and settings
   - Migration strategy

3. **[API_SPECIFICATION.md](API_SPECIFICATION.md)**
   - REST API endpoints
   - Request/response formats
   - Authentication flow
   - Error handling
   - Rate limiting

4. **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)**
   - Complete project structure
   - Directory organization
   - File naming conventions
   - Component architecture

5. **[FEATURES_SPECIFICATION.md](FEATURES_SPECIFICATION.md)**
   - Detailed feature requirements
   - User flows and workflows
   - Validation rules
   - Success criteria
   - Edge cases

6. **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)**
   - Getting started
   - Development workflow
   - Common tasks
   - Debugging tips
   - Deployment guide

7. **[GITHUB_COPILOT_INSTRUCTIONS.md](GITHUB_COPILOT_INSTRUCTIONS.md)**
   - **⭐ Essential for AI-assisted development**
   - Project context and standards
   - Code patterns and best practices
   - TypeScript guidelines
   - Component patterns
   - Quick reference snippets

---

## 🚀 Quick Start

### For Developers New to the Project

1. **Read these first** (in order):
   - [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Understand what we're building
   - [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Set up your environment
   - [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Navigate the codebase

2. **Reference during development**:
   - [GITHUB_COPILOT_INSTRUCTIONS.md](GITHUB_COPILOT_INSTRUCTIONS.md) - Coding standards
   - [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure
   - [API_SPECIFICATION.md](API_SPECIFICATION.md) - API contracts

3. **Feature implementation**:
   - [FEATURES_SPECIFICATION.md](FEATURES_SPECIFICATION.md) - Requirements

---

## 🎯 System Overview

### What is TWA E-Library?
A modern, barcode-enabled library management system designed for universities to:
- Track book inventory with barcode scanning
- Manage student borrowing and returns
- Monitor overdue books and fines
- Generate reports and analytics

### Key Features
- **For Staff**: Book management, student pre-registration, transaction processing, reporting
- **For Students**: Book browsing, barcode scanning to borrow, borrowing history

### Tech Stack
```
Frontend & Backend: Next.js 15 (App Router)
Language: TypeScript
Database: MySQL (Prisma ORM)
UI: Shadcn UI + Tailwind CSS
State: Zustand + TanStack Query
Hosting: Vercel + TiDB Cloud (free tier)
```

---

## 👥 User Roles

### Staff
- Register and manage books
- Process borrowing and returns
- Manage student accounts
- Generate barcodes
- View analytics and reports
- Configure system settings

### Students
- Browse book catalog
- Scan barcodes to borrow
- View current loans
- Track borrowing history
- Manage account

---

## 📱 Core Workflows

### Book Registration
1. Staff scans existing barcode OR enters book details
2. System generates barcode (if needed)
3. Book saved to database
4. Barcode ready for printing

### Borrowing Process
1. Scan book barcode
2. Scan/enter student ID
3. System validates eligibility
4. Transaction created
5. Due date assigned
6. Receipt generated

### Return Process
1. Scan book barcode
2. System finds active transaction
3. Check for overdue (calculate fine if applicable)
4. Update book availability
5. Notify reserved students (if any)

---

## 🗂️ Project Structure

```
twa-elibrary/
├── app/                    # Next.js routes
│   ├── (auth)/            # Login, register
│   ├── (dashboard)/       # Staff & student dashboards
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # Shadcn components
│   ├── books/            # Book-related
│   ├── transactions/     # Transaction-related
│   └── scanner/          # Barcode scanner
├── lib/                   # Utilities
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── prisma/                # Database schema
```

---

## 🔐 Environment Setup

Required environment variables:
```env
DATABASE_URL="mysql://..."
JWT_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for complete setup instructions.

---

## 📊 Database Schema Overview

### Core Tables
- **Users** - Staff and students
- **Books** - Book catalog
- **Transactions** - Borrowing records
- **Fines** - Penalty records
- **Categories** - Book categorization
- **Reservations** - Book reservations
- **Settings** - System configuration
- **AuditLogs** - Activity tracking

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete schema.

---

## 🛠️ Development Guidelines

### Code Standards
- Strict TypeScript (no `any` types)
- Server Components by default
- Zod for validation
- TanStack Query for data fetching
- Proper error handling
- Comprehensive logging

### Git Workflow
```bash
# Feature branch
git checkout -b feature/book-scanning

# Commit with conventional commits
git commit -m "feat: implement barcode scanner"

# Push and create PR
git push origin feature/book-scanning
```

### Testing Checklist
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Edge cases covered
- [ ] Mobile responsive
- [ ] Accessible
- [ ] Performance optimized

---

## 🔧 Common Tasks

### Add a New Page
1. Create file in `app/(dashboard)/...`
2. Add to navigation
3. Implement with Server/Client Components

### Add API Endpoint
1. Create `route.ts` in `app/api/...`
2. Add validation schema
3. Implement handler
4. Create TanStack Query hook

### Add UI Component
1. Use Shadcn: `npx shadcn-ui@latest add [component]`
2. Or create custom in `components/...`
3. Export from index file

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [description]`
3. Run `npx prisma generate`

---

## 🚀 Deployment

### Vercel (Frontend + API)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

### TiDB Cloud (Database)
1. Create free cluster
2. Get connection string
3. Run migrations
4. Seed initial data

---

## 📖 API Quick Reference

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Books
```
GET    /api/books
POST   /api/books
GET    /api/books/:id
PUT    /api/books/:id
DELETE /api/books/:id
GET    /api/books/barcode/:barcode
```

### Transactions
```
POST /api/transactions/borrow
POST /api/transactions/return
POST /api/transactions/:id/renew
GET  /api/transactions/overdue
```

### Users (Staff only)
```
GET  /api/users
POST /api/users/pre-register
POST /api/users/import-csv
GET  /api/users/:id/borrowing-history
```

See [API_SPECIFICATION.md](API_SPECIFICATION.md) for complete documentation.

---

## 🤖 AI-Assisted Development

### Using GitHub Copilot

The [GITHUB_COPILOT_INSTRUCTIONS.md](GITHUB_COPILOT_INSTRUCTIONS.md) file contains:
- Project context for Copilot
- Code patterns and conventions
- Best practices and anti-patterns
- Quick reference snippets

**To maximize Copilot effectiveness**:
1. Keep the instructions file open
2. Reference it in comments
3. Use descriptive variable names
4. Write clear function signatures

---

## 📝 Documentation Standards

### When Adding Features
1. Update [FEATURES_SPECIFICATION.md](FEATURES_SPECIFICATION.md)
2. Add API endpoints to [API_SPECIFICATION.md](API_SPECIFICATION.md)
3. Update database schema if needed
4. Add to [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) if it's a common task

### Code Comments
- Explain WHY, not WHAT
- Document complex business logic
- Add JSDoc for public functions
- Link to relevant documentation

---

## 🔍 Troubleshooting

### Common Issues

**Prisma Client not found**
```bash
npx prisma generate
```

**Database connection error**
```bash
# Check DATABASE_URL in .env
# Verify database is running
npx prisma studio  # Test connection
```

**Type errors after schema change**
```bash
npx prisma generate
# Restart TS server in VS Code
```

**Module not found**
```bash
npm install
rm -rf .next
npm run dev
```

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for more troubleshooting.

---

## 📚 Additional Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

### Project-Specific
- All documentation in this folder
- Code comments throughout the project
- API route handlers (self-documenting)

---

## 🤝 Contributing

1. Read [GITHUB_COPILOT_INSTRUCTIONS.md](GITHUB_COPILOT_INSTRUCTIONS.md)
2. Follow code standards
3. Write tests for new features
4. Update documentation
5. Create descriptive PRs

---

## 📅 Project Status

**Current Phase**: Development  
**Version**: 1.0.0 (In Progress)  
**Target Deployment**: Production Ready

### Completed
- ✅ Project setup
- ✅ Documentation
- ✅ Database schema design

### In Progress
- ⏳ Core feature implementation
- ⏳ UI/UX design
- ⏳ Testing

### Planned
- ⏭️ Production deployment
- ⏭️ User training
- ⏭️ Email notifications
- ⏭️ Mobile app

---

## 📞 Support

For questions or issues:
1. Check documentation in this folder
2. Review codebase for similar implementations
3. Consult official tech stack documentation
4. Reach out to team members

---

## 📄 License

[Specify your license here]

---

## ✨ Acknowledgments

Built with:
- Next.js
- Prisma
- Shadcn UI
- TanStack Query
- Zustand
- And many other amazing open-source tools

---

**Last Updated**: February 8, 2026  
**Maintained By**: Development Team

---

## 🎓 Learning Path for New Developers

### Week 1: Understanding
- [ ] Read PROJECT_OVERVIEW.md
- [ ] Review DATABASE_SCHEMA.md
- [ ] Study FOLDER_STRUCTURE.md
- [ ] Set up development environment

### Week 2: Development
- [ ] Follow DEVELOPMENT_GUIDE.md
- [ ] Implement a simple feature
- [ ] Read GITHUB_COPILOT_INSTRUCTIONS.md
- [ ] Review existing code

### Week 3: Mastery
- [ ] Implement complex feature
- [ ] Write tests
- [ ] Review API_SPECIFICATION.md
- [ ] Contribute to documentation

---

**Happy Coding! 🚀**
