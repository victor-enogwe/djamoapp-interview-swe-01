import { Cache, CacheModule } from '@nestjs/cache-manager';
import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { get } from 'lodash';
import { RedisModuleOptionsProvider } from './providers/options/options.provider';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: RedisModuleOptionsProvider,
    }),
  ],
  providers: [
    {
      provide: Redis,
      inject: [Cache],
      useFactory: (cache: Cache): Redis =>
        get(cache.store, 'client') as unknown as Redis,
    },
  ],
  exports: [Redis],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly redis: Redis) {}

  onApplicationShutdown(): void {
    this.redis.disconnect();
  }
}
