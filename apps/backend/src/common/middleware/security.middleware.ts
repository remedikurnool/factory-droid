import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { securityHeaders } from '../../config/security.config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add security headers
    Object.entries(securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });

    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Add request ID for tracking
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req['id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log response after it's sent
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const logData = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent,
        requestId: req['id'],
      };

      // Log to console (will be picked up by Winston)
      console.log(JSON.stringify(logData));
    });

    next();
  }
}

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Remove potentially dangerous characters
        const sanitizedValue = this.sanitizeValue(obj[key]);
        sanitized[key] = sanitizedValue;
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove HTML tags and dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }
}
