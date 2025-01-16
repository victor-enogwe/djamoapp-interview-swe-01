import {
  RegisterFlowProducerOptions,
  RegisterFlowProducerOptionsFactory,
} from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { BullmqDefaultJobOptionsOptionsProvider } from './default-job-options.provider';
import { BULL_MQ_PREFIX } from './options.factory';

@Injectable()
export class BullmqFlowProducerOptionsProvider
  implements RegisterFlowProducerOptionsFactory
{
  constructor(
    private readonly defaultJobOptions: BullmqDefaultJobOptionsOptionsProvider,
    private readonly redis: Redis,
  ) {}

  async createRegisterQueueOptions(): Promise<
    RegisterFlowProducerOptions & QueueOptions
  > {
    return Promise.resolve({
      blockingConnection: false,
      connection: this.redis.duplicate({
        maxRetriesPerRequest: null,
        name: 'bullmq-flow-producer',
        enableOfflineQueue: false,
        connectionName: 'djamo-bullmq-flow-producer-client',
      }),
      prefix: BULL_MQ_PREFIX,
      defaultJobOptions: this.defaultJobOptions,
    });
  }
}
