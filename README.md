# TWA E-Library Management System 📚

A comprehensive university e-library management system built with Next.js 15, Prisma, TiDB Cloud, and deployed on Vercel.

## 🎯 Features

### For Staff (Librarians)
- ✅ Book management (add, edit, delete, barcode generation)
- ✅ Student account management (register, activate, suspend)
- ✅ Transaction processing (borrow, return, renew)
- ✅ Fine management and tracking
- ✅ Reports and analytics
- ✅ Barcode scanning for quick operations

### For Students
- ✅ Browse and search book catalog
- ✅ Scan barcodes to borrow books
- ✅ View currently borrowed books
- ✅ Complete borrowing history
- ✅ Account management
- ✅ Book renewal

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (TiDB Cloud)
- **ORM**: Prisma 7
- **UI**: Shadcn UI + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Auth**: JWT (httpOnly cookies)
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- TiDB Cloud account (free tier)
- Vercel account (free tier)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twa-elibrary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your TiDB connection string:
   ```env
   DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database**
   ```bash
   npm run prisma:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Visit: http://localhost:3000
   - Login: `admin@library.edu` / `Admin@123`

### Health Check

Test database connectivity:
```bash
curl http://localhost:3000/api/health
```

## 📦 Deployment

### Quick Deploy (5 Steps)

See **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** for a fast deployment guide.

### Full Deployment Guide

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for comprehensive deployment instructions including:
- GitHub Actions setup
- Vercel configuration
- Environment variables
- Production best practices
- Troubleshooting

## 📖 Documentation

Detailed documentation available in `twa-elibrary-documentation/`:
- [Project Overview](./twa-elibrary-documentation/PROJECT_OVERVIEW.md)
- [Database Schema](./twa-elibrary-documentation/DATABASE_SCHEMA.md)
- [API Specification](./twa-elibrary-documentation/API_SPECIFICATION.md)
- [Features Specification](./twa-elibrary-documentation/FEATURES_SPECIFICATION.md)
- [Development Guide](./twa-elibrary-documentation/DEVELOPMENT_GUIDE.md)

## 🔑 Default Credentials

After seeding, use these credentials:

**Admin Account:**
- Email: `admin@library.edu`
- Password: `Admin@123`

**Sample Student:**
- Email: `student@university.edu`
- Password: `Student@123`

⚠️ **Change these passwords immediately in production!**

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run prisma:seed  # Seed database
```

## 🏗️ Project Structure

```
twa-elibrary/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and configs
├── prisma/               # Database schema and migrations
├── hooks/                # Custom React hooks
├── store/                # Zustand stores
└── types/                # TypeScript types
```

## 🔐 Security

- JWT tokens stored in httpOnly cookies
- Bcrypt password hashing
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- SSL/TLS for database connections

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Check the documentation
- Review deployment guides
- Open an issue on GitHub

---

**Built with ❤️ for TWA University**
