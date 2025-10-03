# 🔗 URL Shortener

Production-grade URL shortener built with Node.js, Express, React, PostgreSQL, Redis, and Clerk authentication.

## 🚀 Features

- ✅ Create short URLs with 7-character codes
- ✅ Redis caching for high-performance redirects
- ✅ Click tracking and analytics
- ✅ Update/deactivate URLs
- ✅ Clerk authentication
- ✅ CRUD operations for URL management
- ✅ Production-ready security (CORS, headers, rate limiting)

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express 5
- Prisma 7 (PostgreSQL with Accelerate)
- ioredis (Upstash Redis)
- Clerk Express SDK
- Zod validation

**Frontend:**
- React 18 + Vite 6
- Clerk React
- React Router DOM 7

## 📦 Setup

### Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Push database schema
npm run prisma:push

# Generate Prisma client
npm run prisma:generate

# Start dev server
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Start dev server
npm run dev
```

## 🌐 Deployment

### Backend → Fly.io

```bash
cd backend
flyctl launch
flyctl secrets set CLERK_SECRET_KEY=xxx
flyctl secrets set DATABASE_URL=xxx
flyctl secrets set REDIS_URL=xxx
flyctl secrets set FRONTEND_URL=https://your-frontend.vercel.app
flyctl deploy
```

### Frontend → Vercel

```bash
cd frontend
vercel
# Set environment variables in Vercel dashboard:
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_API_URL (your Fly.io backend URL)
```

## 🔒 Security

- CORS configured with whitelist
- Rate limiting on API endpoints
- Payload size limits (10kb)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Clerk authentication on all write operations

## 📝 License

MIT
