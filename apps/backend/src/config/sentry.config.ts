import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

export const initializeSentry = (configService: ConfigService) => {
  const dsn = configService.get('SENTRY_DSN');
  const environment = configService.get('NODE_ENV', 'development');

  if (!dsn) {
    console.log('Sentry DSN not configured. Sentry will not be initialized.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      // Performance monitoring
      new ProfilingIntegration(),
      // HTTP instrumentation
      new Sentry.Integrations.Http({ tracing: true }),
      // Express instrumentation
      new Sentry.Integrations.Express({ app: true }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: configService.get('npm_package_version', '1.0.0'),
    // Before send hook to filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  console.log(`Sentry initialized for environment: ${environment}`);
};

export const getSentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler();
};

export const getSentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

export const getSentryTracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};
