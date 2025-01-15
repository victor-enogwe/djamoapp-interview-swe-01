import type { CacheModuleOptions } from '@nestjs/cache-manager';
import type { ConfigService } from '@nestjs/config';
import type { RedisOptions, SentinelAddress } from 'ioredis';
import { Redis } from 'ioredis';
import { RedisStore } from '../../classes/store';

export function redisOptionsFactory(
  configService: ConfigService<NodeJS.ProcessEnv>,
): RedisOptions {
  const connectionName = 'djamo-redis-client';
  const host = configService.get<string>('REDIS_HOSTNAME');
  const port = configService.get<number>('REDIS_PORT');
  const username = configService.get<string>('REDIS_USERNAME');
  const password = configService.get<string>('REDIS_PASSWORD');
  const sentinels = configService.get<SentinelAddress[]>('REDIS_SENTINELS');

  return {
    host,
    port,
    username,
    password,
    db: 8,
    sentinels,
    connectionName,
    lazyConnect: true,
    role: 'master',
    sentinelPassword: password,
    showFriendlyErrorStack: true,
    enableOfflineQueue: true,
    enableAutoPipelining: true,
    retryStrategy: (times) => Math.max(Math.min(Math.exp(times), 20000), 1000),
    sentinelRetryStrategy: (times) =>
      Math.max(Math.min(Math.exp(times), 20000), 1000),
  };
}

export async function cacheOptionsFactory(
  configService: ConfigService<NodeJS.ProcessEnv>,
): Promise<CacheModuleOptions<RedisOptions>> {
  return Promise.resolve({
    store: new RedisStore(new Redis(redisOptionsFactory(configService)), {}),
  });
}
