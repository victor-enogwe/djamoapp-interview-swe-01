import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigurableModuleOptionsFactory, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { cacheOptionsFactory } from './options.factory';

@Injectable()
export class RedisModuleOptionsProvider
  implements
    ConfigurableModuleOptionsFactory<
      CacheModuleOptions<RedisOptions>,
      'createCacheOptions'
    >
{
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions<RedisOptions>> {
    const options = await cacheOptionsFactory(this.configService);

    return options;
  }
}
