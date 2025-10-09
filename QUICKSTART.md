# 🚀 Quick Start Guide - ONE MEDI Platform

Get up and running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Clone and navigate
git clone https://github.com/remedikurnool/factory-droid.git
cd factory-droid

# 2. Install root dependencies
npm install

# 3. Install app dependencies
cd apps/frontend && npm install && cd ../..
cd apps/admin && npm install && cd ../..

# 4. Setup environment files
npm run setup:env

# 5. Start development servers
npm run dev
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Admin: http://localhost:3001

## 📝 What Just Happened?

1. **Cloned** the ONE MEDI platform repository
2. **Installed** all dependencies for root and apps
3. **Created** `.env.local` files with default config
4. **Started** both frontend and admin servers

## 🔧 Next Steps

### 1. Configure API Keys (Optional)

Edit `apps/frontend/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key
```

### 2. Explore the Platform

**Frontend** (http://localhost:3000):
- Medicine catalog with search & filters
- Shopping cart & checkout
- Lab tests booking
- Homecare services
- Emergency services
- Insurance plans
- User profile

**Admin Panel** (http://localhost:3001):
- Dashboard with analytics
- Medicine management
- Order management
- Marketing tools
- Reports & exports

### 3. Start Developing

```bash
# Create a feature branch
git checkout -b feat/your-feature

# Make changes in apps/frontend or apps/admin

# Test your changes at localhost:3000 or localhost:3001

# Commit and push
git add .
git commit -m "feat: your feature"
git push origin feat/your-feature
```

## 📚 Need More Details?

Check out the complete guides:
- [Development Setup Guide](./DEVELOPMENT_SETUP.md) - Full setup with troubleshooting
- [Implementation Status](./COMPLETE_IMPLEMENTATION_STATUS.md) - What's built
- [Pull Request Summary](./PR_UPDATE_COMPLETE_PLATFORM.md) - Latest features

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start both apps
npm run dev:frontend     # Frontend only
npm run dev:admin        # Admin only

# Build
npm run build            # Build both apps

# Maintenance
npm run clean            # Clean build artifacts
npm run lint             # Lint code
```

## 🐛 Issues?

### Port Already in Use?
```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies Issues?
```bash
rm -rf node_modules apps/*/node_modules
npm run install:all
```

### Still Stuck?
See [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) for detailed troubleshooting

## 🎯 Platform Overview

### What's Built (85% Complete)

**Phase 1: Backend** ✅ 100%
- 90+ API endpoints
- Payment integration
- Real-time tracking
- Multi-channel notifications

**Phase 2: Frontend** 🟢 85%
- Medicine e-commerce
- Lab tests booking
- Homecare services
- Emergency services
- Insurance platform
- User profiles

**Phase 3: Admin** 🟡 70%
- Dashboard & analytics
- Medicine management
- Order management
- Marketing tools
- Prescription verification

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, PostgreSQL, Redis
- **Payment**: Razorpay
- **Real-time**: WebSocket (Socket.IO)

## 📞 Support

- **Issues**: https://github.com/remedikurnool/factory-droid/issues
- **Product Owner**: Doctor Karthik

---

**Happy Coding!** 💻✨
