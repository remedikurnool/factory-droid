# ONE MEDI - System Architecture

## Overview

ONE MEDI is a comprehensive healthcare e-commerce platform built using a microservices-inspired monorepo architecture. The system is designed to handle multiple healthcare-related services including medicine ordering, lab test bookings, doctor appointments, and emergency services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Customer Web App (Next.js)  │  Admin Panel (Next.js)            │
│  - Responsive UI              │  - Dashboard                      │
│  - shadcn/ui Components       │  - Catalog Management             │
│  - Tailwind CSS               │  - Analytics                      │
└──────────────┬───────────────────────────┬───────────────────────┘
               │                           │
               │       HTTP/REST API       │
               │                           │
┌──────────────┴───────────────────────────┴───────────────────────┐
│                    API Gateway Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  NestJS Backend (Node.js + TypeScript)                           │
│  - OpenAPI/Swagger Docs                                          │
│  - JWT Authentication                                            │
│  - Role-Based Access Control                                     │
│  - Rate Limiting & Throttling                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────────┐
│                    Business Logic Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Modules:                                                        │
│  ├─ Auth Module        ├─ Cart Module       ├─ Payment Module   │
│  ├─ Users Module       ├─ Orders Module     ├─ Lab Tests Module │
│  ├─ Medicines Module   ├─ Doctors Module    ├─ Services Module  │
│  ├─ Emergency Module   ├─ Insurance Module  ├─ Marketing Module │
│  └─ WebSocket Module (Real-time updates)                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────────┐
│                     Data Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   PostgreSQL   │  │   MongoDB    │  │   Redis (Cache)   │   │
│  │  (Primary DB)  │  │  (Logs/Docs) │  │   (Sessions)      │   │
│  └────────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────────┐
│                  External Services                               │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Razorpay (Payments)                                          │
│  ├─ SMS Gateway (OTP)                                            │
│  ├─ Email Service (SMTP)                                         │
│  └─ Cloud Storage (File uploads - S3/Cloudinary)                │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | Server-side rendering, routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Reusable components |
| State | React Context/Zustand | Client state management |
| Forms | React Hook Form + Zod | Form validation |
| HTTP | Axios | API requests |

### Backend Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | NestJS | Enterprise Node.js framework |
| Language | TypeScript | Type safety |
| ORM | Prisma | Database access |
| Auth | Passport + JWT | Authentication |
| Validation | class-validator | DTO validation |
| Docs | Swagger/OpenAPI | API documentation |
| Real-time | Socket.IO | WebSocket connections |
| Payments | Razorpay SDK | Payment processing |
| Files | Multer | File upload handling |
| PDF | PDFKit | Invoice generation |

### Database Stack
| Database | Purpose | Data Types |
|----------|---------|-----------|
| PostgreSQL | Primary relational database | Users, Orders, Products, Bookings |
| MongoDB | Logs and analytics | Application logs, audit trails |
| Redis | Caching and sessions | Session data, cache |

## Database Schema Design

### Core Entities

#### User Management
- **User**: Authentication and profile data
- **Address**: User delivery addresses
- **Prescription**: Uploaded prescription files

#### Catalog Management
- **Medicine**: Product catalog
- **MedicineCategory**: Product categorization
- **Brand**: Medicine brands
- **LabTest**: Diagnostic test catalog
- **LabCategory**: Test categorization

#### Healthcare Services
- **Doctor**: Healthcare providers
- **Hospital**: Medical facilities
- **Appointment**: Doctor bookings
- **HomecareService**: Home healthcare services
- **ServiceBooking**: Service appointments

#### Emergency Services
- **AmbulanceRequest**: Emergency ambulance bookings
- **BloodRequest**: Blood donation requests

#### Insurance
- **InsurancePlan**: Available insurance plans
- **InsurancePurchase**: Customer insurance policies

#### E-commerce
- **CartItem**: Shopping cart
- **Order**: Order records
- **OrderItem**: Order line items
- **Payment**: Payment transactions

#### Marketing
- **Banner**: Homepage banners
- **Offer**: Promotional offers
- **Coupon**: Discount coupons
- **Notification**: User notifications

## API Architecture

### RESTful API Design
```
Base URL: /api/v1

Authentication:
POST   /auth/register
POST   /auth/login
GET    /auth/me

Users:
GET    /users/profile
PUT    /users/profile
GET    /users/addresses
POST   /users/addresses

Medicines:
GET    /medicines
GET    /medicines/:id
GET    /medicines/featured
GET    /medicines/categories
GET    /medicines/brands

Cart:
GET    /cart
POST   /cart/items
PUT    /cart/items/:id
DELETE /cart/items/:id

Orders:
GET    /orders
POST   /orders
GET    /orders/:id
PUT    /orders/:id/status

Payments:
POST   /payments/create-order
POST   /payments/verify

Lab Tests:
GET    /lab-tests
GET    /lab-tests/:id
POST   /lab-tests/book

Doctors:
GET    /doctors
GET    /doctors/:id
POST   /doctors/appointments
```

## Security Architecture

### Authentication & Authorization
1. **JWT-based authentication**
   - Access tokens (7 days validity)
   - Secure HTTP-only cookies (planned)

2. **Role-Based Access Control (RBAC)**
   - Customer: Basic access
   - Staff: Catalog management
   - Partner: Service provider access
   - Admin: Full system access
   - Doctor: Patient management

3. **API Security**
   - Rate limiting (100 requests/minute)
   - CORS configuration
   - Input validation
   - SQL injection prevention (Prisma ORM)
   - XSS protection

4. **Data Security**
   - Password hashing (bcrypt)
   - Encrypted sensitive data
   - Secure file uploads
   - HTTPS in production

## Scalability Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx/AWS ALB
- **Stateless API**: JWT tokens
- **Database Read Replicas**: PostgreSQL replication
- **Caching Layer**: Redis for frequently accessed data

### Vertical Scaling
- **Database indexing**: Optimized queries
- **Connection pooling**: Prisma connection management
- **Image optimization**: CDN integration

### Performance Optimization
- **Server-side rendering**: Next.js SSR/SSG
- **API response caching**: Redis
- **Database query optimization**: Indexed fields
- **Lazy loading**: Frontend components
- **Code splitting**: Dynamic imports

## Deployment Architecture

### Development
```
Local Development:
- pnpm dev (all services)
- PostgreSQL (local)
- MongoDB (local)
```

### Production
```
Cloud Infrastructure (Recommended):
- Frontend: Vercel/Netlify
- Backend: AWS EC2/ECS, DigitalOcean
- Database: AWS RDS (PostgreSQL)
- Files: AWS S3/Cloudinary
- CDN: CloudFlare
- Monitoring: DataDog/New Relic
```

### Docker Deployment
```
Docker Compose:
- Backend container
- Frontend container
- Admin container
- PostgreSQL container
- MongoDB container
- Redis container
- Nginx reverse proxy
```

## Monitoring & Logging

### Application Monitoring
- **Health Checks**: `/health` endpoint
- **Metrics**: Response times, error rates
- **Logs**: Structured JSON logs in MongoDB
- **Alerts**: Email/Slack notifications

### Error Tracking
- **Backend**: NestJS exception filters
- **Frontend**: Error boundaries
- **Logging**: Winston/Pino logger

## Data Flow Examples

### Order Creation Flow
```
1. Customer adds items to cart
   ├─ Frontend: Add to cart UI
   └─ Backend: POST /cart/items

2. Customer proceeds to checkout
   ├─ Frontend: Checkout form
   └─ Backend: Validate cart, address

3. Customer initiates payment
   ├─ Backend: POST /payments/create-order
   └─ Razorpay: Generate order ID

4. Payment completion
   ├─ Razorpay: Webhook callback
   ├─ Backend: Verify payment
   └─ Backend: Create order

5. Order confirmation
   ├─ Backend: Clear cart
   ├─ Backend: Send notification
   ├─ WebSocket: Real-time update
   └─ Email: Order confirmation
```

### Real-time Order Tracking
```
1. Customer places order
   └─ Backend: Order status = 'pending'

2. Admin confirms order
   ├─ Backend: Update status = 'confirmed'
   └─ WebSocket: Emit status update

3. Frontend receives update
   ├─ Socket.IO client receives event
   └─ UI updates automatically

4. Order status changes (packing, shipping, delivery)
   ├─ Each status change triggers WebSocket event
   └─ Customer sees live updates
```

## Future Enhancements

### Planned Features
- [ ] Microservices architecture migration
- [ ] Event-driven architecture (Kafka/RabbitMQ)
- [ ] GraphQL API
- [ ] Mobile apps (React Native)
- [ ] AI-powered recommendations
- [ ] Video consultations
- [ ] Multi-region deployment
- [ ] Advanced analytics dashboard
- [ ] Automated testing pipeline
- [ ] Progressive Web App (PWA)

## Best Practices Implemented

1. **Code Organization**
   - Modular architecture
   - Separation of concerns
   - DRY principles

2. **Type Safety**
   - Shared TypeScript types
   - Strict mode enabled
   - Zod runtime validation

3. **Error Handling**
   - Centralized error handling
   - Meaningful error messages
   - Proper HTTP status codes

4. **Code Quality**
   - ESLint + Prettier
   - Husky git hooks (planned)
   - Code reviews

5. **Documentation**
   - OpenAPI/Swagger
   - README files
   - Code comments
   - Architecture docs

---

*Last Updated: October 2025*
