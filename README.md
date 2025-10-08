# ONE MEDI - Healthcare E-commerce Platform

<div align="center">
  <h3>🏥 Enterprise-grade Healthcare E-commerce Platform for India</h3>
  <p>A comprehensive healthcare solution for medicines, lab tests, doctor appointments, emergency services, and more.</p>
</div>

## 🚀 Features

### Customer Features
- 💊 **Medicines**: Browse, search, and order medicines with prescription upload
- 🧪 **Lab Tests**: Book diagnostic tests with home sample collection
- 👨‍⚕️ **Doctors**: Find and book appointments with specialists
- 🏠 **Homecare Services**: Nursing, physiotherapy, diabetes management
- 🚑 **Emergency Services**: Ambulance booking and blood bank requests
- 🛡️ **Insurance**: Health insurance plans purchase
- 🛒 **Shopping Cart**: Smart cart with prescription validation
- 💳 **Payments**: Razorpay integration for secure payments
- 📦 **Order Tracking**: Real-time order status updates with Socket.IO
- 💰 **Wallet & Loyalty**: Reward points and cashback

### Admin Features
- 📊 **Dashboard**: KPIs, analytics, and real-time insights
- 📝 **Catalog Management**: Products, services, tests management
- 📋 **Order Management**: Live tracking and status updates
- 👥 **User Management**: Role-based access control (RBAC)
- 🎯 **Marketing Tools**: Banners, offers, coupons, notifications
- 📈 **Reports**: Sales, performance, and revenue analytics
- 🔧 **API Management**: Integrations and webhooks

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js, TypeScript)
- **Database**: PostgreSQL (Prisma ORM)
- **Logging**: MongoDB
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.IO
- **Payments**: Razorpay
- **File Upload**: Multer
- **PDF Generation**: PDFKit

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context/Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

### Admin Panel
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts/Chart.js

### DevOps
- **Monorepo**: Turborepo + pnpm workspaces
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions (planned)
- **Containerization**: Docker (planned)

## 📁 Project Structure

```
one-medi/
├── apps/
│   ├── backend/          # NestJS API Server
│   ├── frontend/         # Next.js Customer App
│   └── admin/            # Next.js Admin Panel
├── packages/
│   ├── shared/           # Shared types, constants
│   └── database/         # Prisma schema & client
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
└── turbo.json            # Turborepo config
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- MongoDB >= 6 (optional, for logs)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd factory-droid
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# Copy example env files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# Update the values in .env files
```

4. **Set up the database**
```bash
# Generate Prisma client
cd packages/database
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed the database
pnpm prisma:seed
```

5. **Start development servers**
```bash
# From root directory

# Start all services
pnpm dev

# Or start individual services
pnpm backend:dev    # Backend API (port 4000)
pnpm frontend:dev   # Frontend (port 3000)
pnpm admin:dev      # Admin Panel (port 3001)
```

## 📚 API Documentation

Once the backend is running, access the Swagger documentation at:
```
http://localhost:4000/api/docs
```

## 🔑 Default Credentials

**Admin User** (created by seed):
- Email: `admin@onemedi.com`
- Phone: `+919876543210`
- Password: `admin123`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Medicines
- `GET /api/v1/medicines` - List all medicines
- `GET /api/v1/medicines/:id` - Get medicine details
- `GET /api/v1/medicines/featured` - Get featured medicines
- `GET /api/v1/medicines/categories` - List categories
- `GET /api/v1/medicines/brands` - List brands

### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:id` - Update cart item
- `DELETE /api/v1/cart/items/:id` - Remove from cart

### Orders
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id/status` - Update order status

### Lab Tests
- `GET /api/v1/lab-tests` - List all lab tests
- `GET /api/v1/lab-tests/:id` - Get test details
- `POST /api/v1/lab-tests/book` - Book a test

### Doctors
- `GET /api/v1/doctors` - List all doctors
- `GET /api/v1/doctors/:id` - Get doctor details
- `POST /api/v1/doctors/appointments` - Book appointment

### Payments
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/addresses` - Get addresses
- `POST /api/v1/users/addresses` - Add address
- `PUT /api/v1/users/addresses/:id` - Update address
- `DELETE /api/v1/users/addresses/:id` - Delete address

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/onemedi"
MONGODB_URI="mongodb://localhost:27017/onemedi-logs"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
PORT=4000
API_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
NODE_ENV="development"
```

## 🗄️ Database Schema

The platform uses a comprehensive Prisma schema with the following main models:
- User, Address
- Medicine, MedicineCategory, Brand
- LabTest, LabCategory, LabBooking
- Doctor, Hospital, Appointment
- HomecareService, ServiceBooking
- AmbulanceRequest, BloodRequest
- InsurancePlan, InsurancePurchase
- CartItem, Order, OrderItem
- Payment, Prescription
- Notification, Banner, Offer, Coupon

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## 🏗️ Building for Production

```bash
# Build all applications
pnpm build

# Build specific app
pnpm --filter backend build
pnpm --filter frontend build
pnpm --filter admin build
```

## 🚀 Deployment

### Backend
```bash
cd apps/backend
pnpm build
pnpm start:prod
```

### Frontend & Admin
```bash
cd apps/frontend  # or apps/admin
pnpm build
pnpm start
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint and Prettier rules
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Naming Conventions
- **Files**: kebab-case (user-service.ts)
- **Classes**: PascalCase (UserService)
- **Functions**: camelCase (getUserById)
- **Constants**: UPPER_SNAKE_CASE (MAX_FILE_SIZE)

### Git Workflow
1. Create feature branch from `main`
2. Make changes and commit
3. Create pull request
4. Code review and merge

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Doctor Karthik** - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the best React framework
- Prisma team for the excellent ORM
- shadcn for the beautiful UI components

## 📞 Support

For support, email support@onemedi.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] AI-powered medicine recommendations
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Advanced analytics dashboard
- [ ] Integration with ABDM (Ayushman Bharat Digital Mission)

---

<div align="center">
  <p>Built with ❤️ for better healthcare in India</p>
</div>