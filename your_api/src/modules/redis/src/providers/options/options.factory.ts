import type { CacheModuleOptions } from '@nestjs/cache-manager';
import type { ConfigService } from '@nestjs/config';
import { KeyvAdapter } from 'cache-manager';
import type { Redis, RedisOptions, SentinelAddress } from 'ioredis';
import { RedisStore } from '../../classes/store';

export function redisOptionsFactory(
  configService: ConfigService<NodeJS.ProcessEnv>,
): RedisOptions {
  const connectionName = 'djamo-redis-client';
  const host = configService.get<string>('REDIS_HOSTNAME');
  const port = configService.get<number>('REDIS_PORT');
  const username = configService.get<string>('REDIS_USERNAME');
  const password = configService.get<string>('REDIS_PASSWORD');
  const db = +(configService.get<string>('REDIS_DATABASE') ?? '8');
  const sentinels = configService.get<SentinelAddress[]>('REDIS_SENTINELS');
  const env = configService.get<string>('NODE_ENV');

  const testMode = env === 'test';

  const retryStrategy = (times: number): number =>
    testMode ? 0 : Math.max(Math.min(Math.exp(times), 20000), 1000);

  return {
    host,
    port,
    username,
    password,
    db,
    sentinels,
    connectionName,
    lazyConnect: true,
    role: 'master',
    sentinelPassword: password,
    showFriendlyErrorStack: true,
    enableOfflineQueue: !testMode,
    enableAutoPipelining: true,
    reconnectOnError: () => !testMode,
    retryStrategy,
    sentinelRetryStrategy: retryStrategy,
  };
}

export async function cacheOptionsFactory(
  redis: Redis,
): Promise<CacheModuleOptions> {
  return Promise.resolve({
    stores: [
      new KeyvAdapter(
        new RedisStore(
          redis.duplicate({
            db: 9,
            maxRetriesPerRequest: 3,
            name: 'http-cache',
            connectionName: 'djamo-http-cache-client',
          }),
        ),
      ),
    ],
  });
}
