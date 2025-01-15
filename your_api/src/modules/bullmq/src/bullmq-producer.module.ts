import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BullmqQueuesModule } from './bullmq-queues.module';
import { BullmqDefaultJobOptionsOptionsProvider } from './providers/default-job-options.provider';
import { BullmqFlowProducerOptionsProvider } from './providers/flow-options.provider';
import { BULL_FLOW_PRODUCER } from './providers/options.factory';
import { BullmqCreateJobService } from './services/bullmq-create-job.service';
import { BullmqProducerService } from './services/bullmq-producer.service';

@Global()
@Module({
  imports: [
    BullmqQueuesModule.forRoot({ registerWorkers: false }),
    BullModule.registerFlowProducerAsync({
      name: BULL_FLOW_PRODUCER,
      useFactory: async (redis: Redis) =>
        new BullmqFlowProducerOptionsProvider(
          new BullmqDefaultJobOptionsOptionsProvider(),
          redis,
        ).createRegisterQueueOptions(),
      inject: [Redis],
    }),
  ],
  providers: [
    BullmqDefaultJobOptionsOptionsProvider,
    BullmqProducerService,
    BullmqCreateJobService,
  ],
  exports: [BullmqProducerService, BullmqCreateJobService],
})
export class BullmqProducerModule {}
