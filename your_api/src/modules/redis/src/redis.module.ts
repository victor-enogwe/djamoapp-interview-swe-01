import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { redisOptionsFactory } from './providers/options/options.factory';
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
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        new Redis(redisOptionsFactory(configService)),
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
