# TWA E-Library - Vercel & TiDB Deployment Guide

> **Complete step-by-step guide** to deploy the TWA E-Library system to Vercel (free tier) with TiDB Cloud (free tier) database.

---

## ✅ Completed Steps

- [x] TiDB Cloud cluster created and configured
- [x] Local database migrations and seeding successful
- [x] GitHub Actions workflow created (`.github/workflows/prisma-migrate.yml`)
- [x] Health check endpoint created (`/api/health`)

---

## 🚀 Next Steps: Deploy to Vercel

### Step 1: Push Code to GitHub

First, commit and push all changes including the new workflow and health endpoint:

```bash
# Add all changes
git add .

# Commit
git commit -m "feat: add GitHub Actions workflow and health endpoint for deployment"

# Push to main branch
git push origin main
```

**⚠️ Important**: Before pushing, you need to add `DATABASE_URL` as a GitHub repository secret (see Step 2).

---

### Step 2: Add GitHub Repository Secret

The GitHub Actions workflow needs access to your database. Add the `DATABASE_URL` as a repository secret:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secret:
   - **Name**: `DATABASE_URL`
   - **Value**: `mysql://71SiaurSssTT28P.root:HZXgul8ETnIGC2LV@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict`

Click **Add secret**.

---

### Step 3: Create Vercel Project

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. **Import Git Repository**:
   - Select your `twa-elibrary` repository
   - Click **Import**
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build` (default is fine)
   - **Output Directory**: `.next` (default is fine)
   - **Install Command**: `npm install` (default is fine)

**Don't deploy yet!** Click **Environment Variables** first.

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run in project directory)
cd /Users/franzecalleja/twa-elibrary
vercel link

# Follow prompts to create new project
```

---

### Step 4: Add Environment Variables in Vercel

Add these environment variables in Vercel (Project Settings → Environment Variables):

#### Required Variables:

1. **DATABASE_URL**
   ```
   mysql://71SiaurSssTT28P.root:HZXgul8ETnIGC2LV@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```
   - Select: **Production**, **Preview**, **Development** (all environments)

2. **JWT_SECRET**
   ```
   twa-elibrary-production-jwt-secret-CHANGE-THIS-TO-RANDOM-STRING
   ```
   - ⚠️ **IMPORTANT**: Generate a strong random secret for production!
   - You can generate one with: `openssl rand -base64 32`
   - Select: **Production**, **Preview**

3. **NEXT_PUBLIC_APP_URL**
   ```
   https://your-project-name.vercel.app
   ```
   - Replace `your-project-name` with your actual Vercel project name
   - You'll get this URL after first deployment
   - Select: **Production**

4. **(Optional) NODE_ENV**
   ```
   production
   ```
   - Vercel sets this automatically, but you can override if needed

#### Using Vercel Dashboard:

1. In project settings → **Environment Variables**
2. Click **Add New** for each variable
3. Enter **Key** and **Value**
4. Select environments (Production/Preview/Development)
5. Click **Save**

#### Using Vercel CLI:

```bash
# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste your database URL when prompted

# Add JWT_SECRET
vercel env add JWT_SECRET production
# Paste your JWT secret when prompted

# Add NEXT_PUBLIC_APP_URL (after you know your Vercel URL)
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-project-name.vercel.app
```

---

### Step 5: Deploy to Vercel

#### Option A: Automatic Deployment (via Git Push)

Simply push to your `main` branch:

```bash
git push origin main
```

This will:
1. Trigger GitHub Actions → Run migrations and seed
2. Trigger Vercel → Build and deploy your app

Monitor:
- **GitHub Actions**: Repository → Actions tab
- **Vercel**: Project → Deployments

#### Option B: Manual Deployment (via Vercel CLI)

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

---

### Step 6: Verify Deployment

Once deployment completes:

#### 1. Check Health Endpoint

```bash
curl https://your-project-name.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T...",
  "database": {
    "connected": true,
    "responseTime": "XYms"
  },
  "stats": {
    "users": 5,
    "books": 5
  },
  "environment": "production"
}
```

#### 2. Test Login

Visit: `https://your-project-name.vercel.app/login`

Use default admin credentials:
- **Email**: `admin@library.edu`
- **Password**: `Admin@123`

#### 3. Test API Endpoints

```bash
# Get books
curl https://your-project-name.vercel.app/api/books

# Get categories
curl https://your-project-name.vercel.app/api/categories
```

---

### Step 7: Update NEXT_PUBLIC_APP_URL

After your first deployment, you'll know your actual Vercel URL. Update the environment variable:

1. Go to Vercel Project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_APP_URL`
3. Set value to your actual URL: `https://your-actual-url.vercel.app`
4. Click **Save**
5. **Redeploy** from Vercel dashboard (Deployments → three dots → Redeploy)

---

## 🔧 Build Configuration (Optional)

### Option 1: Default (Recommended)

Keep the default build command: `npm run build`

The GitHub Actions workflow handles migrations separately, so Vercel only needs to build.

### Option 2: Run Migrations During Build (Not Recommended for Serverless)

If you want Vercel to run migrations during build, update build command:

```bash
npx prisma generate && npx prisma migrate deploy && next build
```

⚠️ **Warning**: This is not recommended because:
- Vercel build containers are ephemeral
- Multiple parallel builds might conflict
- GitHub Actions approach is more reliable

---

## 📊 Monitoring & Troubleshooting

### Check GitHub Actions Logs

1. Go to repository → **Actions** tab
2. Click on latest workflow run
3. View logs for each step

### Check Vercel Build Logs

1. Go to Vercel project → **Deployments**
2. Click on deployment
3. View **Build Logs** and **Function Logs**

### Common Issues

#### Issue 1: "Too many connections" or "Pool timeout"

**Solution**: Your `DATABASE_URL` includes `?sslaccept=strict` which enables SSL. If you still get connection issues:

1. Check TiDB Cloud allows connections from `0.0.0.0/0` (any IP)
2. Or use Prisma Data Proxy (see Optional Setup below)

#### Issue 2: Migrations don't run

**Solution**: 
- Check GitHub repository secrets are set correctly
- Verify GitHub Actions workflow succeeded
- Manually run workflow: Actions → Prisma Database Migrations → Run workflow

#### Issue 3: "Invalid token" or auth errors

**Solution**:
- Make sure `JWT_SECRET` is set in Vercel
- Make sure it's the same value in all environments if you want tokens to work across preview/production

#### Issue 4: Build fails

**Solution**:
- Check Vercel build logs for specific error
- Ensure all dependencies are in `package.json`
- Try: `npm install && npm run build` locally to reproduce

---

## 🔐 Security Checklist

Before making your app public:

- [ ] Change default admin password (`Admin@123` → strong password)
- [ ] Generate strong `JWT_SECRET` for production (use `openssl rand -base64 32`)
- [ ] Review TiDB Cloud IP allowlist (restrict if needed)
- [ ] Enable Vercel domain restrictions (if needed)
- [ ] Set up Vercel authentication (if needed)
- [ ] Review and rotate database credentials periodically

---

## 🎯 Optional: Advanced Setup

### Enable Prisma Data Proxy (Recommended for Serverless)

Prisma Data Proxy helps manage database connections from serverless platforms:

1. Sign up for [Prisma Data Platform](https://cloud.prisma.io/)
2. Create new project
3. Add your TiDB database
4. Get Data Proxy connection string
5. Update `DATABASE_URL` in Vercel to use Data Proxy URL
6. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma" // Add this for Data Proxy
   }
   ```

### Set Up Custom Domain

1. Go to Vercel Project Settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### Enable Preview Deployments

Vercel automatically creates preview deployments for pull requests:

1. Go to Project Settings → **Git**
2. Enable **Preview Deployments**
3. Each PR will get its own preview URL

### Add GitHub Status Checks

Require successful GitHub Actions before merging:

1. GitHub repository → Settings → **Branches**
2. Add branch protection rule for `main`
3. Enable **Require status checks to pass**
4. Select "Prisma Database Migrations"

---

## 📝 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Add `DATABASE_URL` to GitHub Secrets
- [ ] Create Vercel project
- [ ] Add environment variables in Vercel
- [ ] Deploy to Vercel (via Git push or CLI)
- [ ] Verify health endpoint works
- [ ] Test login with admin account
- [ ] Update `NEXT_PUBLIC_APP_URL` with actual URL
- [ ] Change default admin password
- [ ] Test main features (books, borrowing, etc.)

---

## 🎉 You're Done!

Your TWA E-Library is now live at: `https://your-project-name.vercel.app`

**Next Steps**:
- Change default admin password
- Add real book data
- Customize branding and settings
- Set up monitoring and analytics
- Add custom domain (optional)

**Need Help?**
- Check Vercel docs: https://vercel.com/docs
- Check Prisma docs: https://www.prisma.io/docs
- Check TiDB Cloud docs: https://docs.pingcap.com/tidbcloud

---

**Last Updated**: February 10, 2026
