import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-mongodb';

export const getLoggerConfig = (mongoUri: string): WinstonModuleOptions => {
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    })
  );

  return {
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      }),

      // File transport for errors
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // File transport for combined logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // MongoDB transport for production logs
      ...(mongoUri
        ? [
            new winston.transports.MongoDB({
              db: mongoUri,
              options: { useUnifiedTopology: true },
              collection: 'logs',
              level: 'info',
              format: logFormat,
              capped: true,
              cappedSize: 10485760, // 10MB
              metaKey: 'metadata',
            }),
          ]
        : []),
    ],
    exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
  };
};

// Custom logger service
export class LoggerService {
  private logger: winston.Logger;

  constructor(context: string) {
    this.logger = winston.createLogger({
      defaultMeta: { context },
    });
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }
}
