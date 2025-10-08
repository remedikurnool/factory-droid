import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  return {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB', 0),
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Reconnect when getting READONLY error
        return true;
      }
      return false;
    },
  };
};
