import {
  BullModule,
  type BullRootModuleOptions,
  getSharedConfigToken,
} from '@nestjs/bullmq';
import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { BullmqQueuesModule } from './bullmq-queues.module';
import { BullmqModuleOptionsProvider } from './providers/module-options.provider';
import { BULL_MODULE_OPTIONS } from './providers/options.factory';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync(BULL_MODULE_OPTIONS, {
      useClass: BullmqModuleOptionsProvider,
    }),
    BullmqQueuesModule.forRoot({ registerWorkers: true }),
  ],
})
export class BullmqConsumerModule implements OnApplicationShutdown {
  constructor(
    @Inject(getSharedConfigToken(BULL_MODULE_OPTIONS))
    private readonly config: BullRootModuleOptions,
  ) {}

  onApplicationShutdown(): void {
    (this.config.connection as Redis)?.disconnect();
  }
}
