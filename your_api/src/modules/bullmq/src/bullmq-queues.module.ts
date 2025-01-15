import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { BullmqQueuesModuleOptions } from '../../@types/bullmq.module';
import { Event } from '../../enums/event.enum';
import { BullmqDefaultJobOptionsOptionsProvider } from './providers/default-job-options.provider';
import {
  BULL_QUEUES,
  BULL_QUEUES_MODULE_OPTIONS,
  BULL_TOPIC,
} from './providers/options.factory';
import { BullmqQueueOptionsProvider } from './providers/queue-options.provider';
import { BullmqWorkerEnvProvider } from './providers/worker-env.provider';
import { BullmqQueueService } from './services/bullmq-queue.service';

@Global()
@Module({})
export class BullmqQueuesModule {
  static forRoot(options: BullmqQueuesModuleOptions): DynamicModule {
    return {
      module: BullmqQueuesModule,
      global: true,
      imports: Event.values.map((name) =>
        BullModule.registerQueueAsync({
          name,
          useClass: BullmqQueueOptionsProvider,
          extraProviders: [
            { provide: BULL_QUEUES_MODULE_OPTIONS, useValue: options },
            { provide: BULL_TOPIC, useValue: name },
            BullmqWorkerEnvProvider,
            BullmqDefaultJobOptionsOptionsProvider,
          ],
        }),
      ),
      providers: [
        {
          provide: BULL_QUEUES,
          inject: Event.values.map((name) => getQueueToken(name)),
          useFactory: (...queues: Queue[]): Map<string, Queue> => {
            const queueMap = new Map<string, Queue>();

            queues.forEach((queue) => queueMap.set(queue.name, queue));

            return queueMap;
          },
        },
        BullmqQueueService,
      ],
      exports: [BULL_QUEUES, BullmqQueueService],
    };
  }
}
