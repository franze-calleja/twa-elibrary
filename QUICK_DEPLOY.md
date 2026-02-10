# 🚀 Quick Deployment Steps

## Prerequisites
- ✅ TiDB Cloud cluster created
- ✅ Local migrations completed
- ✅ GitHub repository set up

## Deploy in 5 Steps

### 1️⃣ Add GitHub Secret
Go to GitHub repo → Settings → Secrets → Actions → New secret:
- Name: `DATABASE_URL`
- Value: Your TiDB connection string with `?sslaccept=strict`

### 2️⃣ Push Code
```bash
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### 3️⃣ Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- New Project → Import `twa-elibrary` repo
- **Don't deploy yet!**

### 4️⃣ Add Vercel Environment Variables
In Vercel project settings → Environment Variables:

```env
DATABASE_URL=mysql://[YOUR_TIDB_CONNECTION_STRING]?sslaccept=strict
JWT_SECRET=[GENERATE_RANDOM_STRING]
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Generate JWT secret:
```bash
openssl rand -base64 32
```

### 5️⃣ Deploy
Click **Deploy** in Vercel or:
```bash
vercel --prod
```

## ✅ Verify Deployment

Health check:
```bash
curl https://your-project.vercel.app/api/health
```

Login:
- URL: `https://your-project.vercel.app/login`
- Email: `admin@library.edu`
- Password: `Admin@123`

**⚠️ Change default password immediately!**

---

📖 **Full Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
