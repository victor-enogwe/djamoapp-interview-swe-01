import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BULL_MQ_PREFIX } from './options.factory';

@Injectable()
export class BullmqModuleOptionsProvider
  implements SharedBullConfigurationFactory
{
  constructor(private readonly redis: Redis) {}

  async createSharedConfiguration(): Promise<BullRootModuleOptions> {
    return Promise.resolve({
      blockingConnection: false,
      connection: this.redis.duplicate({
        maxRetriesPerRequest: null,
        name: 'bullmq',
        connectionName: 'djamo-bullmq-client',
      }),
      prefix: BULL_MQ_PREFIX,
      defaultJobOptions: {
        attempts: 5,
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
      extraOptions: { manualRegistration: false },
    });
  }
}
