import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigurableModuleOptionsFactory, Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { cacheOptionsFactory } from './options.factory';

@Injectable()
export class RedisModuleOptionsProvider
  implements
    ConfigurableModuleOptionsFactory<
      CacheModuleOptions<RedisOptions>,
      'createCacheOptions'
    >
{
  constructor(private readonly redis: Redis) {}

  async createCacheOptions(): Promise<CacheModuleOptions<RedisOptions>> {
    const options = await cacheOptionsFactory(this.redis);

    return options;
  }
}
