# Development Environment Setup Guide

Complete guide to set up and run the ONE MEDI platform locally for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
git --version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/remedikurnool/factory-droid.git
cd factory-droid
```

### 2. Install Dependencies

```bash
npm install
cd apps/frontend && npm install
cd ../admin && npm install
cd ../..
```

Or use the helper script:
```bash
npm run install:all
```

### 3. Set Up Environment Variables

```bash
npm run setup:env
```

This creates `.env.local` files for both frontend and admin apps.

### 4. Configure API Keys

Edit the environment files with your configuration:

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

**Admin** (`apps/admin/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts both applications:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

Or start them individually:
```bash
npm run dev:frontend  # Frontend only (port 3000)
npm run dev:admin     # Admin only (port 3001)
```

## 📦 Project Structure

```
factory-droid/
├── apps/
│   ├── frontend/          # Customer-facing Next.js app (port 3000)
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   └── lib/      # Types, API clients, utilities
│   │   ├── package.json
│   │   └── .env.local    # Frontend environment variables
│   │
│   ├── admin/            # Admin panel Next.js app (port 3001)
│   │   ├── src/
│   │   │   ├── app/      # Admin pages
│   │   │   ├── components/
│   │   │   └── lib/      # Types, API clients
│   │   ├── package.json
│   │   └── .env.local    # Admin environment variables
│   │
│   └── backend/          # NestJS backend (port 4000)
│       └── src/
│
├── scripts/              # Development scripts
│   ├── dev.sh           # Start dev servers
│   └── setup-env.js     # Environment setup
│
├── package.json         # Root package.json
└── README.md
```

## 🛠️ Available Scripts

### Root Level Scripts

```bash
# Development
npm run dev              # Start frontend + admin
npm run dev:frontend     # Start frontend only
npm run dev:admin        # Start admin only
npm run dev:backend      # Start backend only

# Build
npm run build            # Build frontend + admin
npm run build:frontend   # Build frontend only
npm run build:admin      # Build admin only

# Production
npm run start            # Start built apps
npm run start:frontend   # Start frontend production
npm run start:admin      # Start admin production

# Maintenance
npm run clean            # Clean build artifacts
npm run lint             # Lint all apps
npm run setup            # Full setup (install + env)
npm run setup:env        # Setup environment files
npm run install:all      # Install all dependencies
```

### Frontend Scripts (apps/frontend)

```bash
cd apps/frontend

npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run clean            # Remove .next directory
```

### Admin Scripts (apps/admin)

```bash
cd apps/admin

npm run dev              # Start dev server (port 3001)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run clean            # Remove .next directory
```

## 🌐 Application URLs

| Application | Development | Production |
|-------------|-------------|------------|
| Frontend | http://localhost:3000 | TBD |
| Admin Panel | http://localhost:3001 | TBD |
| Backend API | http://localhost:4000 | TBD |

## 🔑 Environment Variables

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` | Yes |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | - | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:4000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ONE MEDI` | No |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` | No |
| `NEXT_PUBLIC_ENABLE_RAZORPAY` | Enable payment | `true` | No |
| `NEXT_PUBLIC_ENABLE_WEBSOCKET` | Enable WebSocket | `true` | No |

### Admin Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:4000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ONE MEDI Admin` | No |
| `NEXT_PUBLIC_APP_URL` | Admin URL | `http://localhost:3001` | No |

## 🔧 Development Workflow

### Starting Development

1. **Start backend** (if available):
   ```bash
   cd apps/backend
   npm run start:dev
   ```

2. **Start frontend and admin**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3001

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** in the appropriate app directory

3. **Test locally**:
   ```bash
   npm run lint
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

## 🐛 Troubleshooting

### Port Already in Use

If you get "Port 3000 is already in use":

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or use different ports:
```bash
# Frontend on different port
cd apps/frontend
PORT=3002 npm run dev

# Admin on different port
cd apps/admin
PORT=3003 npm run dev
```

### Dependencies Issues

If you encounter dependency issues:

```bash
# Clean all node_modules
rm -rf node_modules apps/*/node_modules

# Reinstall
npm run install:all
```

### Build Errors

If build fails:

```bash
# Clean build artifacts
npm run clean

# Rebuild
npm run build
```

### Environment Variables Not Loading

Make sure:
1. `.env.local` files exist in `apps/frontend` and `apps/admin`
2. Variables start with `NEXT_PUBLIC_` to be accessible in browser
3. Restart dev server after changing env variables

## 📱 Testing on Mobile

### Using ngrok (Recommended)

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start dev servers:
   ```bash
   npm run dev
   ```

3. In new terminals, expose ports:
   ```bash
   ngrok http 3000  # Frontend
   ngrok http 3001  # Admin
   ```

4. Use the ngrok URLs on your mobile device

### Using Local Network

1. Find your local IP:
   ```bash
   ifconfig | grep "inet "
   # or
   ipconfig getifaddr en0
   ```

2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_IP:4000/api/v1
   ```

3. Access from mobile:
   - Frontend: `http://YOUR_IP:3000`
   - Admin: `http://YOUR_IP:3001`

## 🔒 Security Notes

### Development Environment

- `.env.local` files are git-ignored
- Never commit API keys or secrets
- Use `.env.example` as template
- Test keys only in development

### API Keys

For development, use test keys:
- **Razorpay**: Use test mode keys (prefix: `rzp_test_`)
- **Backend**: Use development API URL

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project Documentation

- [Complete Implementation Status](./COMPLETE_IMPLEMENTATION_STATUS.md)
- [Pull Request Update](./PR_UPDATE_COMPLETE_PLATFORM.md)
- [Marketing Tools README](./apps/admin/MARKETING_TOOLS_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Create a Pull Request

## 📞 Support

For issues or questions:
- **Product Owner**: Doctor Karthik
- **Repository**: https://github.com/remedikurnool/factory-droid
- **Issues**: https://github.com/remedikurnool/factory-droid/issues

## ✨ Next Steps

After setup:

1. ✅ Verify both apps are running
2. ✅ Check frontend at http://localhost:3000
3. ✅ Check admin at http://localhost:3001
4. ✅ Test API connectivity
5. ✅ Start developing!

---

**Version**: 1.0.0  
**Last Updated**: October 9, 2025  
**Platform**: ONE MEDI Healthcare E-Commerce Platform
