import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditLogMetadata>(AUDIT_LOG_KEY, context.getHandler());

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { action, resource } = auditMetadata;

    return next.handle().pipe(
      tap((response) => {
        // Log after successful execution
        this.auditService.log({
          userId: user?.id,
          action,
          resource,
          resourceId: response?.id || request.params?.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            method: request.method,
            url: request.url,
            statusCode: 200,
          },
        });
      })
    );
  }
}
