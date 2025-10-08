import { ConfigService } from '@nestjs/config';

export const getSecurityConfig = (configService: ConfigService) => {
  return {
    // Helmet configuration
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },

    // CORS configuration
    cors: {
      origin: [
        configService.get('FRONTEND_URL', 'http://localhost:3000'),
        configService.get('ADMIN_URL', 'http://localhost:3001'),
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    },

    // Rate limiting configuration
    rateLimit: {
      global: {
        ttl: 60 * 1000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      auth: {
        login: {
          ttl: 60 * 1000, // 1 minute
          limit: 5, // 5 login attempts per minute
        },
        register: {
          ttl: 60 * 1000, // 1 minute
          limit: 3, // 3 registrations per minute
        },
      },
      api: {
        ttl: 60 * 1000, // 1 minute
        limit: 50, // 50 requests per minute per endpoint
      },
    },

    // Session configuration
    session: {
      secret: configService.get('SESSION_SECRET', 'onemedi-session-secret-key'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: configService.get('NODE_ENV') === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' as const,
      },
    },

    // CSRF configuration
    csrf: {
      cookie: {
        httpOnly: true,
        secure: configService.get('NODE_ENV') === 'production',
        sameSite: 'strict' as const,
      },
    },
  };
};

// Security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Sensitive route patterns (for extra protection)
export const sensitiveRoutes = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/payments/*',
  '/api/v1/orders/*',
  '/api/v1/users/profile',
];

// Public routes (no rate limiting)
export const publicRoutes = [
  '/api/v1/health',
  '/api/v1/medicines',
  '/api/v1/medicines/categories',
  '/api/v1/medicines/brands',
  '/api/v1/lab-tests',
  '/api/v1/doctors',
];
